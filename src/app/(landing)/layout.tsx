import type { ReactNode } from "react";
import AnnouncementBar from "@/components/landing/AnnouncementBar";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Navigation from "@/components/landing/Navigation";

type LandingLayoutProps = {
  children: ReactNode;
};

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <>
      <AnnouncementBar />
      <Header>
        <Navigation />
      </Header>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
