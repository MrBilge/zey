import { sendOrderEmail } from "@/app/api/siparis/action";
import {
  getPaymentResultOrigin,
  openPaymentContext,
  retrieveCheckoutForm,
  verifyCheckoutSignature,
} from "@/lib/iyzico";

export const runtime = "nodejs";

function resultPage(
  request: Request,
  status: "success" | "failure",
  message: string,
) {
  const targetOrigin = getPaymentResultOrigin(request);
  const payload = JSON.stringify({
    type: "iyzico-payment-result",
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
          <main><h1>${title}</h1><p>${message}</p></main>
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
  const sealedOrder = new URL(request.url).searchParams.get("order");

  if (!sealedOrder) {
    return resultPage(
      request,
      "failure",
      "Sipariş doğrulama bilgisi bulunamadı.",
    );
  }

  let token = "";

  try {
    const formData = await request.formData();
    const submittedToken = formData.get("token");
    token = typeof submittedToken === "string" ? submittedToken : "";
  } catch {
    return resultPage(request, "failure", "iyzico yanıtı okunamadı.");
  }

  if (!token) {
    return resultPage(request, "failure", "Ödeme doğrulama anahtarı eksik.");
  }

  try {
    const context = openPaymentContext(sealedOrder);
    const payment = await retrieveCheckoutForm(context.conversationId, token);
    const samePayment =
      payment.conversationId === context.conversationId &&
      payment.basketId === context.basketId &&
      Number(payment.price) === Number(context.price) &&
      Number(payment.paidPrice) === Number(context.price) &&
      payment.currency === "TRY" &&
      payment.token === token;

    if (
      payment.status !== "success" ||
      payment.paymentStatus !== "SUCCESS" ||
      !samePayment ||
      !verifyCheckoutSignature(payment)
    ) {
      console.error("iyzico ödeme doğrulaması başarısız:", {
        status: payment.status,
        paymentStatus: payment.paymentStatus,
        errorMessage: payment.errorMessage,
      });

      return resultPage(
        request,
        "failure",
        "Ödeme onaylanmadı. Kartını kontrol edip tekrar deneyebilirsin.",
      );
    }

    try {
      await sendOrderEmail(context.order, {
        paymentId: String(payment.paymentId),
        paidPrice: String(payment.paidPrice),
      });
    } catch (emailError) {
      console.error(
        `Ödeme başarılı ancak sipariş e-postası gönderilemedi (${payment.paymentId}):`,
        emailError instanceof Error ? emailError.message : emailError,
      );

      return resultPage(
        request,
        "success",
        "Ödemen alındı. Sipariş bildirimi işlenirken gecikme oluştu.",
      );
    }

    return resultPage(
      request,
      "success",
      "Ödemen alındı ve siparişin bize ulaştı.",
    );
  } catch (error) {
    console.error(
      "iyzico callback işlenemedi:",
      error instanceof Error ? error.message : error,
    );

    return resultPage(
      request,
      "failure",
      "Ödeme sonucu doğrulanamadı. Lütfen bizimle iletişime geç.",
    );
  }
}
