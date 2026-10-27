import type { Metadata } from "next";
import { Hero } from "@/components/interfaces/consulting/sections/hero";
import { Proof } from "@/components/interfaces/consulting/sections/proof";
import { WhoYoullWorkWith } from "@/components/interfaces/consulting/sections/who-you-work-with";
import { Offer } from "@/components/interfaces/consulting/sections/offer";
import { Process } from "@/components/interfaces/consulting/sections/process";
import { IndiaAngle } from "@/components/interfaces/consulting/sections/india-angle";
import { Faq } from "@/components/interfaces/consulting/sections/faq";
import { BookingSection } from "@/components/interfaces/consulting/booking-section";
import { consultingContent } from "@/lib/data/consulting/content";
import { buildConsultingMetadata } from "@/lib/data/consulting/metadata";

export const metadata: Metadata = buildConsultingMetadata(consultingContent, "/consulting");

export default function ConsultingPage() {
  return (
    <div>
      <Hero content={consultingContent} />
      <Proof caseStudy={consultingContent.caseStudy} />
      <WhoYoullWorkWith />
      <Offer offer={consultingContent.offer} />
      <div className="bg-gradient-to-b from-background to-secondary/5">
        <Process steps={consultingContent.process} />
        <IndiaAngle indiaAngle={consultingContent.indiaAngle} />
      </div>
      <Faq items={consultingContent.faq} />
      <BookingSection
        heading={consultingContent.booking.heading}
        subhead={consultingContent.booking.subhead}
      />
    </div>
  );
}
