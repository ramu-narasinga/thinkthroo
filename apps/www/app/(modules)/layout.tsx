import { Footer } from "@/components/interfaces/site/footer";
import ConvertKitForm from "@/components/interfaces/site/forms/newsletter";
import { SiteHeader } from "@/components/interfaces/site/header";
import { InviteOnlyTopBanner } from "@/components/interfaces/site/invite-only-top-banner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function ModulesLayout({ children }: AppLayoutProps) {
  return (
    <>
      <InviteOnlyTopBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
