import AnnouncementBar from "@/components/landing/AnnouncementBar";
import ClosingSection from "@/components/landing/ClosingSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProductSection from "@/components/landing/ProductSection";
import StorySection from "@/components/landing/StorySection";

export default function LandingPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <ProductSection />
        <StorySection />
        <FaqSection />
        <ClosingSection />
      </main>
      <Footer />
    </>
  );
}
