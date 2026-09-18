import type { Metadata } from "next";
import StoryPageContent from "@/components/story/StoryPage";

export const metadata: Metadata = {
  title: "Hikâyemiz | zey",
  description: "Zey'in topraktan sofraya uzanan hikâyesini keşfedin.",
};

export default function StoryPage() {
  return <StoryPageContent />;
}
