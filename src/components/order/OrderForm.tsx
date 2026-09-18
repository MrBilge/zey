"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  orderSchema,
  type OrderSubmissionValues,
} from "./orderSchema";
import PaymentModal from "./PaymentModal";
import styles from "./OrderForm.module.css";

type OrderFormProps = {
  productSize: OrderSubmissionValues["productSize"];
};

type OrderField =
  | "fullName"
  | "phone"
  | "email"
  | "identityNumber"
  | "city"
  | "district"
  | "address"
  | "quantity"
  | "note"
  | "terms";

type FieldErrors = Partial<Record<OrderField, string>>;

type CompletedOrder = {
  productSize: OrderSubmissionValues["productSize"];
  quantity: number;
  totalPrice: string;
};

export default function OrderForm({ productSize }: OrderFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [completedOrder, setCompletedOrder] =
    useState<CompletedOrder | null>(null);
  const [pendingOrder, setPendingOrder] =
    useState<OrderSubmissionValues | null>(null);
  const successTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isSubmitted) successTitleRef.current?.focus();
  }, [isSubmitted]);

  const closePaymentModal = useCallback(() => {
    if (!isInitializing) {
      setPendingOrder(null);
      setPaymentError("");
      setCheckoutUrl("");
      setTotalPrice("");
    }
  }, [isInitializing]);

  const handlePaymentResult = useCallback(
    (status: "success" | "failure", message: string) => {
      setCheckoutUrl("");

      if (status === "success") {
        setCompletedOrder({
          productSize: pendingOrder?.productSize ?? productSize,
          quantity: pendingOrder?.quantity ?? 1,
          totalPrice,
        });
        setPendingOrder(null);
        setIsSubmitted(true);
        setSuccessMessage(message);
        document.querySelector<HTMLFormElement>("#order-form")?.reset();
        return;
      }

      setPaymentError(message);
    },
    [pendingOrder, productSize, totalPrice],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(false);
    setCompletedOrder(null);
    setSuccessMessage("");
    setSubmitError("");
    setPaymentError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = orderSchema.safeParse({
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      identityNumber: formData.get("identityNumber"),
      city: formData.get("city"),
      district: formData.get("district"),
      address: formData.get("address"),
      quantity: formData.get("quantity"),
      note: formData.get("note"),
      terms: formData.get("terms") === "on",
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as OrderField | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }

      setErrors(nextErrors);
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }

    setErrors({});
    setPendingOrder({
      ...result.data,
      productSize,
    });
    await initializePayment({
      ...result.data,
      productSize,
    });
  }

  async function initializePayment(order: OrderSubmissionValues) {
    if (isInitializing) return;

    setIsInitializing(true);
    setPaymentError("");
    setCheckoutUrl("");

    try {
      const response = await fetch("/api/siparis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const payload = (await response.json()) as {
        message?: string;
        checkoutUrl?: string;
        totalPrice?: string;
        errors?: Partial<Record<OrderField, string[]>>;
      };

      if (!response.ok) {
        const message = payload.message ?? "Sipariş gönderilemedi.";

        if (payload.errors) {
          const apiErrors: FieldErrors = {};

          for (const [field, messages] of Object.entries(payload.errors)) {
            const message = messages?.[0];
            if (message) apiErrors[field as OrderField] = message;
          }

          setErrors(apiErrors);
          setPendingOrder(null);
          setSubmitError(message);
          requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>("#order-form [aria-invalid='true']")
              ?.focus();
          });
        } else {
          setPaymentError(message);
        }

        return;
      }

      if (!payload.checkoutUrl) {
        throw new Error("Ödeme formu alınamadı.");
      }

      setCheckoutUrl(payload.checkoutUrl);
      setTotalPrice(payload.totalPrice ?? "");
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsInitializing(false);
    }
  }

  const errorFor = (field: OrderField) => errors[field];

  if (isSubmitted) {
    return (
      <div className={styles.formPanel}>
        <section
          className={styles.orderSuccess}
          role="status"
          aria-labelledby="order-success-title"
        >
          <div className={styles.successIcon} aria-hidden="true">
            ✓
          </div>
          <div className="eyebrow">SİPARİŞİN ALINDI</div>
          <h1
            id="order-success-title"
            ref={successTitleRef}
            className={styles.successTitle}
            tabIndex={-1}
          >
            Siparişin başarıyla oluşturuldu.
          </h1>
          <p className={styles.successMessage}>{successMessage}</p>

          {completedOrder && (
            <dl className={styles.successSummary}>
              <div>
                <dt>Ürün</dt>
                <dd>Zey {completedOrder.productSize}</dd>
              </div>
              <div>
                <dt>Adet</dt>
                <dd>{completedOrder.quantity}</dd>
              </div>
              {completedOrder.totalPrice && (
                <div>
                  <dt>Toplam</dt>
                  <dd>{completedOrder.totalPrice} TL</dd>
                </div>
              )}
            </dl>
          )}

          <p className={styles.successNote}>
            Sipariş bilgilerin ekibimize iletildi. Hazırlık süreciyle ilgili
            seninle iletişime geçeceğiz.
          </p>
          <button
            className={styles.newOrderButton}
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setSuccessMessage("");
              setCompletedOrder(null);
              requestAnimationFrame(() => {
                document.querySelector<HTMLInputElement>("#fullName")?.focus();
              });
            }}
          >
            Yeni sipariş oluştur
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.formPanel}>
      <div className="eyebrow">TESLİMAT BİLGİLERİ</div>
      <h1 className={styles.title}>Siparişini tamamla.</h1>
      <p className={styles.intro}>
        Bilgilerini doldur, <strong>Zey {productSize}</strong> siparişini
        hazırlamaya başlayalım.
      </p>

      <form
        id="order-form"
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.field}>
          <label htmlFor="fullName">Ad soyad</label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Adınız ve soyadınız"
            aria-invalid={Boolean(errorFor("fullName"))}
            aria-describedby={errorFor("fullName") ? "fullName-error" : undefined}
          />
          {errorFor("fullName") && (
            <span id="fullName-error" className={styles.error}>
              {errorFor("fullName")}
            </span>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="phone">Telefon</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="05__ ___ __ __"
              aria-invalid={Boolean(errorFor("phone"))}
              aria-describedby={errorFor("phone") ? "phone-error" : undefined}
            />
            {errorFor("phone") && (
              <span id="phone-error" className={styles.error}>
                {errorFor("phone")}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              aria-invalid={Boolean(errorFor("email"))}
              aria-describedby={errorFor("email") ? "email-error" : undefined}
            />
            {errorFor("email") && (
              <span id="email-error" className={styles.error}>
                {errorFor("email")}
              </span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="identityNumber">T.C. kimlik numarası</label>
          <input
            id="identityNumber"
            name="identityNumber"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            placeholder="11 haneli kimlik numaranız"
            aria-invalid={Boolean(errorFor("identityNumber"))}
            aria-describedby={
              errorFor("identityNumber") ? "identityNumber-error" : undefined
            }
          />
          {errorFor("identityNumber") && (
            <span id="identityNumber-error" className={styles.error}>
              {errorFor("identityNumber")}
            </span>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="city">Şehir</label>
            <input
              id="city"
              name="city"
              autoComplete="address-level1"
              placeholder="İstanbul"
              aria-invalid={Boolean(errorFor("city"))}
              aria-describedby={errorFor("city") ? "city-error" : undefined}
            />
            {errorFor("city") && (
              <span id="city-error" className={styles.error}>
                {errorFor("city")}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="district">İlçe</label>
            <input
              id="district"
              name="district"
              autoComplete="address-level2"
              placeholder="Kadıköy"
              aria-invalid={Boolean(errorFor("district"))}
              aria-describedby={errorFor("district") ? "district-error" : undefined}
            />
            {errorFor("district") && (
              <span id="district-error" className={styles.error}>
                {errorFor("district")}
              </span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="address">Açık adres</label>
          <textarea
            id="address"
            name="address"
            rows={3}
            autoComplete="street-address"
            placeholder="Mahalle, sokak, bina ve daire bilgileri"
            aria-invalid={Boolean(errorFor("address"))}
            aria-describedby={errorFor("address") ? "address-error" : undefined}
          />
          {errorFor("address") && (
            <span id="address-error" className={styles.error}>
              {errorFor("address")}
            </span>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="quantity">Adet</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              defaultValue="1"
              aria-invalid={Boolean(errorFor("quantity"))}
              aria-describedby={errorFor("quantity") ? "quantity-error" : undefined}
            />
            {errorFor("quantity") && (
              <span id="quantity-error" className={styles.error}>
                {errorFor("quantity")}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="note">Sipariş notu <span>(isteğe bağlı)</span></label>
            <input
              id="note"
              name="note"
              placeholder="Varsa notunuz"
              aria-invalid={Boolean(errorFor("note"))}
              aria-describedby={errorFor("note") ? "note-error" : undefined}
            />
            {errorFor("note") && (
              <span id="note-error" className={styles.error}>
                {errorFor("note")}
              </span>
            )}
          </div>
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="terms"
            aria-invalid={Boolean(errorFor("terms"))}
            aria-describedby={errorFor("terms") ? "terms-error" : undefined}
          />
          <span>Mesafeli satış ve gizlilik koşullarını okudum, onaylıyorum.</span>
        </label>
        {errorFor("terms") && (
          <span id="terms-error" className={styles.error}>
            {errorFor("terms")}
          </span>
        )}

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isInitializing}
        >
          <span>
            {isInitializing ? "Ödeme hazırlanıyor…" : "Siparişi tamamla"}
          </span>
          <span aria-hidden="true">→</span>
        </button>

        <p className={styles.secureNote}>🔒 Bilgileriniz güvenle işlenir.</p>

        {submitError && (
          <div className={styles.submitError} role="alert">
            <strong>Sipariş gönderilemedi.</strong>
            <span>{submitError}</span>
          </div>
        )}

      </form>

      <PaymentModal
        isOpen={Boolean(pendingOrder)}
        isLoading={isInitializing}
        productSize={pendingOrder?.productSize ?? productSize}
        quantity={pendingOrder?.quantity ?? 1}
        totalPrice={totalPrice}
        checkoutUrl={checkoutUrl}
        error={paymentError}
        onClose={closePaymentModal}
        onRetry={() => {
          if (pendingOrder) void initializePayment(pendingOrder);
        }}
        onPaymentResult={handlePaymentResult}
      />
    </div>
  );
}
