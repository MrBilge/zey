import { mockPaymentProvider } from "@/lib/payment/mock-payment-provider";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function errorPage(message: string, status: number) {
  return new Response(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mock ödeme açılamadı</title><style>body{display:grid;min-height:100vh;place-items:center;margin:0;padding:24px;background:#f8f6ef;color:#293c28;font:16px Arial,sans-serif;text-align:center}main{max-width:460px}h1{font:34px Georgia,serif;margin:0 0 12px}p{color:#687060;line-height:1.6}</style></head><body><main><h1>Mock ödeme açılamadı.</h1><p>${escapeHtml(message)}</p></main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'",
      },
    },
  );
}

export async function GET(request: Request) {
  const session = new URL(request.url).searchParams.get("session");

  if (!session) {
    return errorPage("Ödeme oturumu bulunamadı.", 400);
  }

  try {
    const summary = mockPaymentProvider.getCheckoutSummary(session);
    const safeSession = escapeHtml(session);

    return new Response(
      `<!doctype html>
      <html lang="tr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Mock ödeme</title>
          <style>
            *{box-sizing:border-box}body{margin:0;padding:28px;background:#f8f6ef;color:#293c28;font:15px Arial,sans-serif}main{max-width:540px;margin:auto}.badge{display:inline-block;padding:7px 10px;border-radius:999px;background:#ead66f;color:#293c28;font-size:11px;font-weight:700;letter-spacing:.12em}h1{font:36px Georgia,serif;margin:18px 0 10px}.warning{padding:14px 16px;border:1px solid #d8c45c;background:#fffbe2;line-height:1.55}.summary{margin:22px 0;padding:18px;border:1px solid #dedfd3;background:#fff}.row{display:flex;justify-content:space-between;gap:20px;padding:7px 0}.row+ .row{border-top:1px solid #ecece5}.actions{display:grid;gap:10px}form{margin:0}button{display:flex;width:100%;min-height:46px;align-items:center;justify-content:center;gap:9px;border:0;border-radius:3px;padding:14px 18px;font:700 14px Arial,sans-serif;cursor:pointer}button:disabled{cursor:wait;opacity:.68}.success{background:#293c28;color:#fff}.failure{background:#e8e9e1;color:#293c28}.spinner{display:none;width:17px;height:17px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin 650ms linear infinite}.is-loading .spinner{display:block}.footnote{color:#687060;font-size:12px;line-height:1.5;margin-top:16px}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation-duration:1.4s}}
          </style>
        </head>
        <body>
          <main>
            <span class="badge">GELİŞTİRME MODU</span>
            <h1>Mock ödeme</h1>
            <p class="warning"><strong>Gerçek ödeme yapılmaz.</strong><br />Bu ekran yalnızca sipariş akışını geliştirme ortamında test eder. Kart bilgisi girmeyin.</p>
            <div class="summary">
              <div class="row"><span>Ürün</span><strong>Zey ${escapeHtml(summary.productSize)}</strong></div>
              <div class="row"><span>Adet</span><strong>${summary.quantity}</strong></div>
              <div class="row"><span>Toplam</span><strong>${escapeHtml(summary.totalPrice)} TL</strong></div>
            </div>
            <div class="actions">
              <form method="post" action="/api/payment/callback">
                <input type="hidden" name="session" value="${safeSession}" />
                <input type="hidden" name="outcome" value="success" />
                <button class="success" type="submit"><span class="spinner" aria-hidden="true"></span><span class="button-label">Başarılı ödeme simüle et</span></button>
              </form>
              <form method="post" action="/api/payment/callback">
                <input type="hidden" name="session" value="${safeSession}" />
                <input type="hidden" name="outcome" value="failure" />
                <button class="failure" type="submit"><span class="spinner" aria-hidden="true"></span><span class="button-label">Başarısız ödeme simüle et</span></button>
              </form>
            </div>
            <p class="footnote">Mock oturumu 30 dakika geçerlidir. Başarılı senaryo sipariş e-postası akışını da çalıştırır.</p>
          </main>
          <script>
            (() => {
              let isSubmitting = false;
              const forms = document.querySelectorAll("form");
              const buttons = document.querySelectorAll("button");
              const actions = document.querySelector(".actions");

              forms.forEach((form) => {
                form.addEventListener("submit", (event) => {
                  event.preventDefault();
                  if (isSubmitting) return;

                  isSubmitting = true;
                  actions?.setAttribute("aria-busy", "true");
                  buttons.forEach((button) => {
                    button.disabled = true;
                  });

                  const activeButton = form.querySelector("button");
                  activeButton?.classList.add("is-loading");
                  const label = activeButton?.querySelector(".button-label");
                  if (label) label.textContent = "Ödeme işleniyor…";

                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      HTMLFormElement.prototype.submit.call(form);
                    });
                  });
                });
              });
            })();
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'self'",
        },
      },
    );
  } catch (error) {
    console.error(
      "Mock ödeme sayfası açılamadı:",
      error instanceof Error ? error.message : error,
    );

    return errorPage(
      error instanceof Error ? error.message : "Ödeme oturumu açılamadı.",
      400,
    );
  }
}
