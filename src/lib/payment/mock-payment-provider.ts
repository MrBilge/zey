import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";
import {
  orderSubmissionSchema,
  type OrderSubmissionValues,
} from "@/components/order/orderSchema";
import {
  formatDisplayAmount,
  formatPaymentAmount,
  getOrderTotalCents,
} from "./pricing";
import type {
  CheckoutInitialization,
  PaymentCompletion,
  PaymentProvider,
} from "./types";

type MockCheckoutContext = {
  version: 1;
  expiresAt: number;
  checkoutId: string;
  price: string;
  resultOrigin: string;
  order: OrderSubmissionValues;
};

export type MockCheckoutSummary = {
  productSize: string;
  quantity: number;
  totalPrice: string;
};

function requireEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} sunucu ortam değişkeni tanımlı değil.`);
  }

  return value;
}

function encryptionKey() {
  return createHash("sha256")
    .update(requireEnvironment("ORDER_TOKEN_SECRET"))
    .digest();
}

function sealCheckoutContext(context: MockCheckoutContext) {
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

function isHttpOrigin(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin === value
    );
  } catch {
    return false;
  }
}

function openCheckoutContext(value: string) {
  const parts = value.split(".");

  if (parts.length !== 3) {
    throw new Error("Geçersiz mock ödeme oturumu.");
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
  const context = JSON.parse(decrypted) as Partial<MockCheckoutContext>;
  const orderResult = orderSubmissionSchema.safeParse(context.order);

  if (
    context.version !== 1 ||
    typeof context.expiresAt !== "number" ||
    context.expiresAt < Date.now() ||
    typeof context.checkoutId !== "string" ||
    typeof context.price !== "string" ||
    !/^\d+\.\d{2}$/.test(context.price) ||
    !isHttpOrigin(context.resultOrigin) ||
    !orderResult.success
  ) {
    throw new Error("Mock ödeme oturumunun süresi dolmuş veya oturum geçersiz.");
  }

  return {
    ...context,
    order: orderResult.data,
  } as MockCheckoutContext;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "MockPaymentProvider";

  private assertDevelopmentOnly() {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "MockPaymentProvider yalnızca geliştirme ortamında kullanılabilir.",
      );
    }
  }

  async initializeCheckout(
    order: OrderSubmissionValues,
    request: Request,
  ): Promise<CheckoutInitialization> {
    this.assertDevelopmentOnly();

    const totalCents = getOrderTotalCents(order);
    const context: MockCheckoutContext = {
      version: 1,
      expiresAt: Date.now() + 30 * 60 * 1000,
      checkoutId: randomUUID(),
      price: formatPaymentAmount(totalCents),
      resultOrigin: new URL(request.url).origin,
      order,
    };
    const checkoutUrl = new URL(
      "/api/payment/mock/checkout",
      context.resultOrigin,
    );
    checkoutUrl.searchParams.set("session", sealCheckoutContext(context));

    return {
      checkoutUrl: checkoutUrl.toString(),
      totalPrice: formatDisplayAmount(totalCents),
    };
  }

  getCheckoutSummary(session: string): MockCheckoutSummary {
    this.assertDevelopmentOnly();

    const context = openCheckoutContext(session);

    return {
      productSize: context.order.productSize,
      quantity: context.order.quantity,
      totalPrice: new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(context.price)),
    };
  }

  async completeCheckout(request: Request): Promise<PaymentCompletion> {
    this.assertDevelopmentOnly();

    const formData = await request.formData();
    const session = formData.get("session");
    const outcome = formData.get("outcome");

    if (typeof session !== "string" || !session) {
      throw new Error("Mock ödeme oturumu bulunamadı.");
    }

    const context = openCheckoutContext(session);

    if (outcome === "failure") {
      return {
        status: "failure",
        message: "Mock ödeme reddedildi. Tekrar deneyebilirsin.",
        resultOrigin: context.resultOrigin,
      };
    }

    if (outcome !== "success") {
      throw new Error("Geçersiz mock ödeme sonucu.");
    }

    return {
      status: "success",
      message: "Mock ödeme onaylandı ve siparişin bize ulaştı.",
      resultOrigin: context.resultOrigin,
      order: context.order,
      payment: {
        provider: this.name,
        paymentId: `mock_${context.checkoutId}`,
        paidPrice: context.price,
      },
    };
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
