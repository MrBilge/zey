import "server-only";

import nodemailer from "nodemailer";
import type { OrderSubmissionValues } from "@/components/order/orderSchema";
import type { ConfirmedPayment } from "@/lib/payment/types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendOrderEmail(
  order: OrderSubmissionValues,
  payment: ConfirmedPayment,
) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("E-posta sunucusu yapılandırılmamış.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const submittedAt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date());
  const note = order.note || "Belirtilmedi";
  const address = `${order.address}, ${order.district}/${order.city}`;
  const isMockPayment = payment.provider === "MockPaymentProvider";
  const subjectPrefix = isMockPayment ? "[MOCK] " : "";
  const emailHeading = isMockPayment
    ? "MOCK ÖDEMESİ ONAYLANAN YENİ SİPARİŞ"
    : "ÖDEMESİ ONAYLANAN YENİ SİPARİŞ";
  const introduction = isMockPayment
    ? "Mock sağlayıcı tarafından onaylanan yeni bir Zey siparişi var."
    : "Ödeme sağlayıcısı tarafından onaylanan yeni bir Zey siparişi var.";

  await transporter.sendMail({
    from: `"Zey Sipariş" <${emailUser}>`,
    to: emailUser,
    replyTo: order.email,
    subject: `${subjectPrefix}Ödeme onaylandı · Zey ${order.productSize} · ${order.fullName}`,
    text: [
      introduction,
      "",
      `Ödeme sağlayıcısı: ${payment.provider}`,
      `Ödeme referansı: ${payment.paymentId}`,
      `Ödenen tutar: ${payment.paidPrice} TL`,
      `Ürün: Zey ${order.productSize}`,
      `Adet: ${order.quantity}`,
      `Ad soyad: ${order.fullName}`,
      `Telefon: ${order.phone}`,
      `E-posta: ${order.email}`,
      `Adres: ${address}`,
      `Sipariş notu: ${note}`,
      `Gönderim zamanı: ${submittedAt}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#293c28">
        <div style="background:#293c28;color:#f8f6ef;padding:24px 28px">
          <div style="font-family:Georgia,serif;font-size:36px;font-style:italic">zey</div>
          <div style="margin-top:8px;font-size:12px;letter-spacing:.12em">${emailHeading}</div>
        </div>
        <div style="padding:28px;border:1px solid #dedfd3;border-top:0;background:#f8f6ef">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin:0 0 22px">
            Zey ${escapeHtml(order.productSize)} · ${order.quantity} adet
          </h1>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tbody>
              <tr><td style="padding:9px 0;color:#687060">Ödeme sağlayıcısı</td><td style="padding:9px 0;text-align:right">${escapeHtml(payment.provider)}</td></tr>
              <tr><td style="padding:9px 0;color:#687060">Ödeme referansı</td><td style="padding:9px 0;text-align:right">${escapeHtml(payment.paymentId)}</td></tr>
              <tr><td style="padding:9px 0;color:#687060">Ödenen tutar</td><td style="padding:9px 0;text-align:right">${escapeHtml(payment.paidPrice)} TL</td></tr>
              <tr><td style="padding:9px 0;color:#687060">Ad soyad</td><td style="padding:9px 0;text-align:right">${escapeHtml(order.fullName)}</td></tr>
              <tr><td style="padding:9px 0;color:#687060">Telefon</td><td style="padding:9px 0;text-align:right">${escapeHtml(order.phone)}</td></tr>
              <tr><td style="padding:9px 0;color:#687060">E-posta</td><td style="padding:9px 0;text-align:right">${escapeHtml(order.email)}</td></tr>
              <tr><td style="padding:9px 0;color:#687060">Adres</td><td style="padding:9px 0;text-align:right">${escapeHtml(address)}</td></tr>
              <tr><td style="padding:9px 0;color:#687060">Sipariş notu</td><td style="padding:9px 0;text-align:right">${escapeHtml(note)}</td></tr>
            </tbody>
          </table>
          <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #dedfd3;color:#687060;font-size:12px">
            ${escapeHtml(submittedAt)} tarihinde web sitesinden gönderildi.
          </p>
        </div>
      </div>
    `,
  });
}
