import type { Metadata } from "next";
import ClosingSection from "@/components/landing/ClosingSection";
import ProductSection from "@/components/landing/ProductSection";

export const metadata: Metadata = {
  title: "Ürünler | zey",
  description: "Zey zeytinyağı ürünlerini ve farklı boy seçeneklerini keşfedin.",
};

export default function ProductsPage() {
  return (
    <>
      <ProductSection />
      <ClosingSection />
    </>
  );
}
