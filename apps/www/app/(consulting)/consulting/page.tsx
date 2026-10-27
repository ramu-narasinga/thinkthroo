import type { Metadata } from "next";
import { Hero } from "@/components/interfaces/consulting/sections/hero";
import { Proof } from "@/components/interfaces/consulting/sections/proof";
import { Offer } from "@/components/interfaces/consulting/sections/offer";
import { Process } from "@/components/interfaces/consulting/sections/process";
import { Faq } from "@/components/interfaces/consulting/sections/faq";
import { BookingSection } from "@/components/interfaces/consulting/booking-section";
import { consultingContent } from "@/lib/data/consulting/content";
import { buildConsultingMetadata } from "@/lib/data/consulting/metadata";

export const metadata: Metadata = buildConsultingMetadata(consultingContent, "/consulting");

export default function ConsultingPage() {
  return (
    <div>
      <Hero content={consultingContent} />
      <BookingSection
        instanceId="top"
        heading={consultingContent.booking.heading}
        subhead={consultingContent.booking.subhead}
      />
      <Proof caseStudy={consultingContent.caseStudy} />
      <BookingSection
        instanceId="mid"
        heading={consultingContent.booking.heading}
        subhead={consultingContent.booking.subhead}
      />
      <Offer offer={consultingContent.offer} />
      <div className="bg-gradient-to-b from-background to-secondary/5">
        <Process steps={consultingContent.process} />
      </div>
      <Faq items={consultingContent.faq} />
    </div>
  );
}
