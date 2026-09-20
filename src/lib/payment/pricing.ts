import type { OrderSubmissionValues } from "@/components/order/orderSchema";

const priceEnvironmentKeys: Record<
  OrderSubmissionValues["productSize"],
  string
> = {
  "500 ml": "ZEY_PRICE_500_ML",
  "1L": "ZEY_PRICE_1_L",
  "2L": "ZEY_PRICE_2_L",
  "5L": "ZEY_PRICE_5_L",
};

function requireEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} sunucu ortam değişkeni tanımlı değil.`);
  }

  return value;
}

export function getOrderTotalCents(order: OrderSubmissionValues) {
  const environmentKey = priceEnvironmentKeys[order.productSize];
  const rawPrice = requireEnvironment(environmentKey).replace(",", ".");
  const unitPrice = Number(rawPrice);

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error(`${environmentKey} geçerli bir fiyat olmalı.`);
  }

  return Math.round(unitPrice * 100) * order.quantity;
}

export function formatPaymentAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export function formatDisplayAmount(cents: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
