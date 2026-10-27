import type { Metadata } from "next";
import { Hero } from "@/components/interfaces/consulting/sections/hero";
import { Proof } from "@/components/interfaces/consulting/sections/proof";
import { Explore } from "@/components/interfaces/consulting/sections/explore";
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
      <Proof caseStudy={consultingContent.caseStudy} />
      <Explore />
      <BookingSection
        instanceId="mid"
        heading={consultingContent.booking.heading}
        subhead={consultingContent.booking.subhead}
      />
      <Offer offer={consultingContent.offer} />
      <Process steps={consultingContent.process} />
      <Faq items={consultingContent.faq} />
    </div>
  );
}
