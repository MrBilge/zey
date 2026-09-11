"use client";
import Link from "next/link";
import { productVariants, type ProductSize } from "./productVariants";

type ProductSizeSelectorProps = {
  selectedSize: ProductSize;
  onSizeChange: (size: ProductSize) => void;
};

export default function ProductSizeSelector({
  selectedSize,
  onSizeChange,
}: ProductSizeSelectorProps) {
  const selectedVariant = productVariants.find(
    (variant) => variant.size === selectedSize,
  )!;

  return (
    <>
      <fieldset>
        <legend>Size uygun boyu keşfedin</legend>
        <div className="flex justify-between">
          <div className="sizes">
            {productVariants.map(({ size }) => (
              <button
                key={size}
                aria-pressed={selectedSize === size}
                onClick={() => onSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <Link
            href="/urunler"
            className="flex justify-center items-center cursor-pointer"
          >
            <p className=" text-sm">Tüm ürünleri incele →</p>
          </Link>
        </div>

        <p className="size-note" aria-live="polite">
          {selectedVariant.description}
        </p>
      </fieldset>
    </>
  );
}
