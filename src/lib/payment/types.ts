import type { OrderSubmissionValues } from "@/components/order/orderSchema";

export type CheckoutInitialization = {
  checkoutUrl: string;
  totalPrice: string;
};

export type ConfirmedPayment = {
  provider: string;
  paymentId: string;
  paidPrice: string;
};

export type PaymentCompletion =
  | {
      status: "success";
      message: string;
      resultOrigin: string;
      order: OrderSubmissionValues;
      payment: ConfirmedPayment;
    }
  | {
      status: "failure";
      message: string;
      resultOrigin: string;
    };

export interface PaymentProvider {
  readonly name: string;

  initializeCheckout(
    order: OrderSubmissionValues,
    request: Request,
  ): Promise<CheckoutInitialization>;

  completeCheckout(request: Request): Promise<PaymentCompletion>;
}
