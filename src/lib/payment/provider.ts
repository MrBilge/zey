import "server-only";

import { mockPaymentProvider } from "./mock-payment-provider";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER?.trim().toLowerCase() || "mock";

  if (provider === "mock") {
    return mockPaymentProvider;
  }

  throw new Error(`Desteklenmeyen ödeme sağlayıcısı: ${provider}`);
}
