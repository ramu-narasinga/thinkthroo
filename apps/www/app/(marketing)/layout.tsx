import { Footer } from "@/components/interfaces/site/footer";
import { SiteHeader } from "@/components/interfaces/site/header";
import { InviteOnlyTopBanner } from "@/components/interfaces/site/invite-only-top-banner";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <InviteOnlyTopBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
