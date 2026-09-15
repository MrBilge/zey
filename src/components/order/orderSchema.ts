import { z } from "zod";

export const orderSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Ad soyad en az 3 karakter olmalı."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine(
      (value) => /^(?:\+90|0)?5\d{9}$/.test(value),
      "Geçerli bir cep telefonu numarası girin.",
    ),
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta adresi girin."),
  identityNumber: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "T.C. kimlik numarası 11 haneli olmalı."),
  city: z.string().trim().min(2, "Şehir alanını doldurun."),
  district: z.string().trim().min(2, "İlçe alanını doldurun."),
  address: z
    .string()
    .trim()
    .min(15, "Adres en az 15 karakter olmalı.")
    .max(400, "Adres en fazla 400 karakter olabilir."),
  quantity: z.coerce
    .number()
    .int("Adet tam sayı olmalı.")
    .min(1, "En az 1 adet seçin.")
    .max(20, "Tek siparişte en fazla 20 adet seçebilirsiniz."),
  note: z
    .string()
    .trim()
    .max(300, "Sipariş notu en fazla 300 karakter olabilir."),
  terms: z.literal(true, {
    error: "Mesafeli satış ve gizlilik koşullarını onaylamalısınız.",
  }),
});

export const orderSubmissionSchema = orderSchema.extend({
  productSize: z.enum(["250 ml", "500 ml", "1 L"], {
    error: "Geçerli bir ürün boyutu seçin.",
  }),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type OrderSubmissionValues = z.infer<typeof orderSubmissionSchema>;
