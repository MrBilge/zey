import { sendOrderEmail } from "@/app/api/siparis/action";
import { getPaymentProvider } from "@/lib/payment/provider";

export const runtime = "nodejs";

const globalForPaymentEmail = globalThis as typeof globalThis & {
  __zeyPaymentEmailDeliveries?: Map<string, Promise<void>>;
};
const paymentEmailDeliveries =
  globalForPaymentEmail.__zeyPaymentEmailDeliveries ??= new Map();

function sendOrderEmailOnce(
  order: Parameters<typeof sendOrderEmail>[0],
  payment: Parameters<typeof sendOrderEmail>[1],
) {
  const deliveryKey = `${payment.provider}:${payment.paymentId}`;
  const existingDelivery = paymentEmailDeliveries.get(deliveryKey);

  if (existingDelivery) return existingDelivery;

  const delivery = sendOrderEmail(order, payment).catch((error) => {
    paymentEmailDeliveries.delete(deliveryKey);
    throw error;
  });
  paymentEmailDeliveries.set(deliveryKey, delivery);

  return delivery;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resultPage(
  targetOrigin: string,
  status: "success" | "failure",
  message: string,
) {
  const payload = JSON.stringify({
    type: "payment-result",
    status,
    message,
  }).replaceAll("<", "\\u003c");
  const title = status === "success" ? "Ödeme başarılı" : "Ödeme tamamlanamadı";

  return new Response(
    `<!doctype html>
      <html lang="tr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <style>
            body{display:grid;min-height:100vh;place-items:center;margin:0;padding:24px;background:#fff;color:#293c28;font:16px Arial,sans-serif;text-align:center}
            h1{font:38px Georgia,serif;margin:0 0 12px}p{color:#687060;line-height:1.6;margin:0}
          </style>
        </head>
        <body>
          <main><h1>${title}</h1><p>${escapeHtml(message)}</p></main>
          <script>window.parent.postMessage(${payload}, ${JSON.stringify(targetOrigin)});</script>
        </body>
      </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-ancestors 'self'",
      },
    },
  );
}

export async function POST(request: Request) {
  const fallbackOrigin = new URL(request.url).origin;

  try {
    const result = await getPaymentProvider().completeCheckout(request);

    if (result.status === "failure") {
      return resultPage(result.resultOrigin, result.status, result.message);
    }

    try {
      await sendOrderEmailOnce(result.order, result.payment);
    } catch (emailError) {
      console.error(
        `Ödeme başarılı ancak sipariş e-postası gönderilemedi (${result.payment.paymentId}):`,
        emailError instanceof Error ? emailError.message : emailError,
      );

      return resultPage(
        result.resultOrigin,
        "success",
        "Ödeme onaylandı. Sipariş bildirimi işlenirken gecikme oluştu.",
      );
    }

    return resultPage(result.resultOrigin, result.status, result.message);
  } catch (error) {
    console.error(
      "Ödeme callback isteği işlenemedi:",
      error instanceof Error ? error.message : error,
    );

    return resultPage(
      fallbackOrigin,
      "failure",
      "Ödeme sonucu doğrulanamadı. Lütfen tekrar deneyin.",
    );
  }
}
