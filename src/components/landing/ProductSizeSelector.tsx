"use client";

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
      </fieldset>
      <p className="size-note" aria-live="polite">
        {selectedVariant.description}
      </p>
    </>
  );
}
