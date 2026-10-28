import { Footer } from "@/components/interfaces/site/footer";
import { SiteHeader } from "@/components/interfaces/site/header";
import { BetaTopBanner } from "@/components/interfaces/site/beta-top-banner";
import { CalInit } from "@/components/interfaces/consulting/cal-init";
import { AttributionCapture } from "@/components/interfaces/consulting/attribution-capture";

export default function ConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AttributionCapture />
      <CalInit />
      <BetaTopBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
