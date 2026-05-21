import { Footer } from "@/components/interfaces/site/footer";
import { SiteHeader } from "@/components/interfaces/site/header";
import { BetaTopBanner } from "@/components/interfaces/site/beta-top-banner";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <BetaTopBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
