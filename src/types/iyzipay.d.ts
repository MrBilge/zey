declare module "iyzipay" {
  type IyzipayCallback = (
    error: Error | null,
    result: Record<string, unknown>,
  ) => void;

  type IyzipayResource = {
    create: (
      request: Record<string, unknown>,
      callback: IyzipayCallback,
    ) => void;
    retrieve: (
      request: Record<string, unknown>,
      callback: IyzipayCallback,
    ) => void;
  };

  class Iyzipay {
    constructor(config: {
      apiKey: string;
      secretKey: string;
      uri: string;
    });

    checkoutFormInitialize: IyzipayResource;
    checkoutForm: IyzipayResource;

    static LOCALE: { TR: "tr"; EN: "en" };
    static CURRENCY: { TRY: "TRY" };
    static PAYMENT_GROUP: { PRODUCT: "PRODUCT" };
    static BASKET_ITEM_TYPE: { PHYSICAL: "PHYSICAL" };
  }

  export = Iyzipay;
}
