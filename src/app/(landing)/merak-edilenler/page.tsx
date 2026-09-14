import type { Metadata } from "next";
import ClosingSection from "@/components/landing/ClosingSection";
import FaqSection from "@/components/landing/FaqSection";

export const metadata: Metadata = {
  title: "Merak Edilenler | zey",
  description: "Zey ve zeytinyağı hakkında sık sorulan soruların yanıtları.",
};

export default function FrequentlyAskedQuestionsPage() {
  return (
    <>
      <FaqSection />
      <ClosingSection />
    </>
  );
}
