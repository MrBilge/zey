import { orderSubmissionSchema } from "@/components/order/orderSchema";
import { initializeCheckoutForm } from "@/lib/iyzico";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return Response.json(
      { success: false, message: "Geçersiz istek kaynağı." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  const result = orderSubmissionSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        success: false,
        message: "Sipariş bilgilerini kontrol edip tekrar deneyin.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const checkout = await initializeCheckoutForm(result.data, request);

    return Response.json(
      {
        success: true,
        message: "iyzico ödeme formu hazırlandı.",
        ...checkout,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "iyzico ödeme formu başlatılamadı:",
      error instanceof Error ? error.message : error,
    );

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Ödeme formu hazırlanamadı. Lütfen tekrar deneyin.",
      },
      { status: 502 },
    );
  }
}
