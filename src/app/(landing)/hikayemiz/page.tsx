import type { Metadata } from "next";
import ClosingSection from "@/components/landing/ClosingSection";
import StorySection from "@/components/landing/StorySection";

export const metadata: Metadata = {
  title: "Hikâyemiz | zey",
  description: "Zey'in topraktan sofraya uzanan hikâyesini keşfedin.",
};

export default function StoryPage() {
  return (
    <>
      <StorySection />
      <ClosingSection />
    </>
  );
}
