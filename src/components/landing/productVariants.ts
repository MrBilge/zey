export const productVariants = [
  {
    slug: "500-ml",
    size: "500 ml",
    image: "/products/zey-500ml.png",
    description: "Zey ile ilk tanışma için.",
  },
  {
    slug: "1-l",
    size: "1L",
    image: "/products/zey-1l.png",
    description: "Günlük sofralarınızda elinizin altında.",
  },
  {
    slug: "2-l",
    size: "2L",
    image: "/products/zey-2l.png",
    description: "Günlük sofralarınızda elinizin altında.",
  },
  {
    slug: "5-l",
    size: "5L",
    image: "/products/zey-5l.png",
    description: "Kalabalık sofralar, paylaşılacak daha çok lezzet.",
  },
] as const;

export type ProductSize = (typeof productVariants)[number]["size"];
