import { SiteHeader } from "@/components/interfaces/site/header";
import { Footer } from "@/components/interfaces/site/footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function ModulesLayout({ children }: AppLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
