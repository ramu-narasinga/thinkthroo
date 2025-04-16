import { Footer } from "@/components/interfaces/site/footer";
import ConvertKitForm from "@/components/interfaces/site/forms/newsletter";
import { SiteHeader } from "@/components/interfaces/site/header";

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
