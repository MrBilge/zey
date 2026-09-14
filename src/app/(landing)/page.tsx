import ClosingSection from "@/components/landing/ClosingSection";
import FaqSection from "@/components/landing/FaqSection";
import HeroSection from "@/components/landing/HeroSection";
import ProductSection from "@/components/landing/ProductSection";
import StorySection from "@/components/landing/StorySection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProductSection />
      <StorySection />
      <FaqSection />
      <ClosingSection />
    </>
  );
}
