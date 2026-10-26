import { MinimalHeader } from "@/components/interfaces/consulting/minimal-header";
import { MinimalFooter } from "@/components/interfaces/consulting/minimal-footer";
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
      <MinimalHeader />
      <main className="flex-1">{children}</main>
      <MinimalFooter />
    </>
  );
}
