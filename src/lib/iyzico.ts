import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import Iyzipay from "iyzipay";
import {
  orderSubmissionSchema,
  type OrderSubmissionValues,
} from "@/components/order/orderSchema";

type CheckoutInitializeResult = {
  status?: string;
  token?: string;
  paymentPageUrl?: string;
  conversationId?: string;
  signature?: string;
  errorMessage?: string;
};

export type CheckoutRetrieveResult = {
  status?: string;
  paymentStatus?: string;
  paymentId?: string;
  currency?: string;
  basketId?: string;
  conversationId?: string;
  paidPrice?: string | number;
  price?: string | number;
  token?: string;
  signature?: string;
  errorMessage?: string;
};

type PaymentContext = {
  version: 1;
  expiresAt: number;
  conversationId: string;
  basketId: string;
  price: string;
  order: OrderSubmissionValues;
};

const priceEnvironmentKeys: Record<
  OrderSubmissionValues["productSize"],
  string
> = {
  "250 ml": "ZEY_PRICE_250_ML",
  "500 ml": "ZEY_PRICE_500_ML",
  "1 L": "ZEY_PRICE_1_L",
};

function requireEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} sunucu ortam değişkeni tanımlı değil.`);
  }

  return value;
}

function getIyzipay() {
  return new Iyzipay({
    apiKey: requireEnvironment("IYZIPAY_API_KEY"),
    secretKey: requireEnvironment("IYZIPAY_SECRET_KEY"),
    uri:
      process.env.IYZIPAY_URI?.trim() ||
      "https://sandbox-api.iyzipay.com",
  });
}

function getUnitPrice(productSize: OrderSubmissionValues["productSize"]) {
  const environmentKey = priceEnvironmentKeys[productSize];
  const rawPrice = requireEnvironment(environmentKey).replace(",", ".");
  const price = Number(rawPrice);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`${environmentKey} geçerli bir fiyat olmalı.`);
  }

  return Math.round(price * 100);
}

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

function verifyHmacSignature(values: unknown[], signature?: string) {
  if (values.some((value) => value === undefined) || !signature) return false;

  const calculated = createHmac(
    "sha256",
    requireEnvironment("IYZIPAY_SECRET_KEY"),
  )
    .update(values.join(":"))
    .digest("hex");
  const actual = Buffer.from(signature, "utf8");
  const expected = Buffer.from(calculated, "utf8");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function encryptionKey() {
  return createHash("sha256")
    .update(requireEnvironment("ORDER_TOKEN_SECRET"))
    .digest();
}

function sealPaymentContext(context: PaymentContext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(context), "utf8"),
    cipher.final(),
  ]);

  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function openPaymentContext(value: string) {
  const parts = value.split(".");

  if (parts.length !== 3) {
    throw new Error("Geçersiz sipariş doğrulama bilgisi.");
  }

  const [ivValue, authTagValue, encryptedValue] = parts;
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const context = JSON.parse(decrypted) as Partial<PaymentContext>;
  const orderResult = orderSubmissionSchema.safeParse(context.order);

  if (
    context.version !== 1 ||
    typeof context.expiresAt !== "number" ||
    context.expiresAt < Date.now() ||
    typeof context.conversationId !== "string" ||
    typeof context.basketId !== "string" ||
    typeof context.price !== "string" ||
    !orderResult.success
  ) {
    throw new Error("Sipariş doğrulama bilgisinin süresi dolmuş veya geçersiz.");
  }

  return {
    ...context,
    order: orderResult.data,
  } as PaymentContext;
}

function callIyzipay<T extends Record<string, unknown>>(
  operation: (
    request: Record<string, unknown>,
    callback: (error: Error | null, result: Record<string, unknown>) => void,
  ) => void,
  request: Record<string, unknown>,
) {
  return new Promise<T>((resolve, reject) => {
    operation(request, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result as T);
    });
  });
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const surname = parts.length > 1 ? parts.pop()! : "-";

  return { name: parts.join(" ") || fullName, surname };
}

function normalizePhone(phone: string) {
  if (phone.startsWith("+90")) return phone;
  if (phone.startsWith("0")) return `+90${phone.slice(1)}`;
  return `+90${phone}`;
}

function publicOrigin(request: Request) {
  const configuredUrl = process.env.SITE_URL?.trim();
  const origin = configuredUrl
    ? new URL(configuredUrl).origin
    : new URL(request.url).origin;

  if (process.env.NODE_ENV === "production" && !origin.startsWith("https://")) {
    throw new Error("SITE_URL üretim ortamında HTTPS adresi olmalı.");
  }

  return origin;
}

export async function initializeCheckoutForm(
  order: OrderSubmissionValues,
  request: Request,
) {
  const iyzipay = getIyzipay();
  const totalCents = getUnitPrice(order.productSize) * order.quantity;
  const price = formatPrice(totalCents);
  const conversationId = randomUUID();
  const basketId = randomUUID();
  const context: PaymentContext = {
    version: 1,
    expiresAt: Date.now() + 30 * 60 * 1000,
    conversationId,
    basketId,
    price,
    order,
  };
  const callbackUrl = new URL("/api/iyzico/callback", publicOrigin(request));
  callbackUrl.searchParams.set("order", sealPaymentContext(context));

  const { name, surname } = splitFullName(order.fullName);
  const address = `${order.address}, ${order.district}/${order.city}`;
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0];
  const buyerId = createHash("sha256")
    .update(`${order.email}:${order.phone}`)
    .digest("hex")
    .slice(0, 24);

  const result = await callIyzipay<CheckoutInitializeResult>(
    iyzipay.checkoutFormInitialize.create.bind(
      iyzipay.checkoutFormInitialize,
    ),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: callbackUrl.toString(),
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: buyerId,
        name,
        surname,
        gsmNumber: normalizePhone(order.phone),
        email: order.email,
        identityNumber: order.identityNumber,
        registrationAddress: address,
        ip: forwardedIp?.trim() || "127.0.0.1",
        city: order.city,
        country: "Turkey",
      },
      shippingAddress: {
        contactName: order.fullName,
        city: order.city,
        country: "Turkey",
        address,
      },
      billingAddress: {
        contactName: order.fullName,
        city: order.city,
        country: "Turkey",
        address,
      },
      basketItems: [
        {
          id: order.productSize.toLowerCase().replaceAll(" ", "-"),
          name: `Zey Natürel Sızma Zeytinyağı ${order.productSize} · ${order.quantity} adet`,
          category1: "Zeytinyağı",
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price,
        },
      ],
    },
  );

  if (result.status !== "success" || !result.paymentPageUrl || !result.token) {
    throw new Error(result.errorMessage || "iyzico ödeme formunu başlatamadı.");
  }

  if (
    !verifyHmacSignature(
      [result.conversationId, result.token],
      result.signature,
    )
  ) {
    throw new Error("iyzico ödeme formu yanıtının imzası doğrulanamadı.");
  }

  const checkoutUrl = new URL(result.paymentPageUrl);
  checkoutUrl.searchParams.set("iframe", "true");

  return {
    checkoutUrl: checkoutUrl.toString(),
    totalPrice: new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalCents / 100),
  };
}

export async function retrieveCheckoutForm(
  conversationId: string,
  token: string,
) {
  const iyzipay = getIyzipay();

  return callIyzipay<CheckoutRetrieveResult>(
    iyzipay.checkoutForm.retrieve.bind(iyzipay.checkoutForm),
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      token,
    },
  );
}

export function verifyCheckoutSignature(result: CheckoutRetrieveResult) {
  const values = [
    result.paymentStatus,
    result.paymentId,
    result.currency,
    result.basketId,
    result.conversationId,
    result.paidPrice,
    result.price,
    result.token,
  ];

  return verifyHmacSignature(values, result.signature);
}

export function getPaymentResultOrigin(request: Request) {
  return publicOrigin(request);
}
