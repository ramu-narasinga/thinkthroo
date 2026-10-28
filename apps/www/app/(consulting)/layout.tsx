import { Footer } from "@/components/interfaces/site/footer";
import { SiteHeader } from "@/components/interfaces/site/header";
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
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
