export const productVariants = [
  {
    slug: "250-ml",
    size: "250 ml",
    image: "/products/zey-250ml.png",
    description: "Küçük sofralar ve zey ile ilk tanışma için.",
  },
  {
    slug: "500-ml",
    size: "500 ml",
    image: "/products/zey-500ml.png",
    description: "Günlük sofralarınızda elinizin altında.",
  },
  {
    slug: "1-l",
    size: "1 L",
    image: "/products/zey-1l.png",
    description: "Kalabalık sofralar, paylaşılacak daha çok lezzet.",
  },
] as const;

export type ProductSize = (typeof productVariants)[number]["size"];
