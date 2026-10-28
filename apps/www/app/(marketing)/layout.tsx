import { Footer } from "@/components/interfaces/site/footer";
import { SiteHeader } from "@/components/interfaces/site/header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
