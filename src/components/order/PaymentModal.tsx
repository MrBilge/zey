"use client";

import { useEffect, useRef } from "react";
import styles from "./PaymentModal.module.css";

type PaymentResult = {
  type: "iyzico-payment-result";
  status: "success" | "failure";
  message: string;
};

type PaymentModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  productSize: string;
  quantity: number;
  totalPrice: string;
  checkoutUrl: string;
  error: string;
  onClose: () => void;
  onRetry: () => void;
  onPaymentResult: (
    status: PaymentResult["status"],
    message: string,
  ) => void;
};

function isPaymentResult(value: unknown): value is PaymentResult {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PaymentResult>;
  return (
    candidate.type === "iyzico-payment-result" &&
    (candidate.status === "success" || candidate.status === "failure") &&
    typeof candidate.message === "string"
  );
}

export default function PaymentModal({
  isOpen,
  isLoading,
  productSize,
  quantity,
  totalPrice,
  checkoutUrl,
  error,
  onClose,
  onRetry,
  onPaymentResult,
}: PaymentModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) onClose();
    }

    function handleMessage(event: MessageEvent<unknown>) {
      if (event.origin !== window.location.origin) return;
      if (!isPaymentResult(event.data)) return;

      onPaymentResult(event.data.status, event.data.message);
    }

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("message", handleMessage);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, isLoading, onClose, onPaymentResult]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        aria-describedby="payment-description"
      >
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          aria-label="Ödeme penceresini kapat"
          disabled={isLoading}
          onClick={onClose}
        >
          ×
        </button>

        <div className={styles.modalHeader}>
          <div>
            <div className={styles.eyebrow}>İYZİCO GÜVENLİ ÖDEME</div>
            <h2 id="payment-title">Ödemeni tamamla.</h2>
          </div>
          <dl className={styles.compactSummary}>
            <div>
              <dt>Zey · {productSize}</dt>
              <dd>{quantity} adet</dd>
            </div>
            {totalPrice && (
              <div>
                <dt>Toplam</dt>
                <dd>{totalPrice} TL</dd>
              </div>
            )}
          </dl>
        </div>

        <p id="payment-description" className={styles.description}>
          Kart bilgilerini aşağıdaki iyzico ödeme alanına güvenle girebilirsin.
          Sipariş e-postası yalnızca ödeme başarılı olduğunda gönderilir.
        </p>

        <div className={styles.checkoutArea} aria-busy={isLoading}>
          {isLoading && (
            <div className={styles.loading} role="status">
              <span className={styles.spinner} aria-hidden="true" />
              <strong>iyzico ödeme formu hazırlanıyor…</strong>
              <small>Bu işlem birkaç saniye sürebilir.</small>
            </div>
          )}

          {!isLoading && error && (
            <div className={styles.error} role="alert">
              <strong>Ödeme formu açılamadı.</strong>
              <span>{error}</span>
              <button type="button" onClick={onRetry}>
                Tekrar dene
              </button>
            </div>
          )}

          {!isLoading && checkoutUrl && (
            <iframe
              className={styles.checkoutFrame}
              src={checkoutUrl}
              title="iyzico güvenli ödeme formu"
              allow="payment *"
            />
          )}
        </div>

        <p className={styles.note}>
          Kart bilgileriniz Zey sunucularına aktarılmaz; ödeme iyzico tarafından
          işlenir.
        </p>
      </section>
    </div>
  );
}
