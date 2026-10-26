import { Hero } from "./sections/hero";
import { Proof } from "./sections/proof";
import { WhoYoullWorkWith } from "./sections/who-you-work-with";
import { Offer } from "./sections/offer";
import { Process } from "./sections/process";
import { IndiaAngle } from "./sections/india-angle";
import { Faq } from "./sections/faq";
import { FinalCta } from "./sections/final-cta";
import type { LandingPageContent } from "@/lib/data/consulting/types";

export function LandingPage({ content }: { content: LandingPageContent }) {
  return (
    <div>
      <Hero content={content} />
      <Proof caseStudySlugs={content.caseStudySlugs} />
      <WhoYoullWorkWith />
      <Offer offer={content.offer} />
      <div className="bg-gradient-to-b from-background to-secondary/5">
        <Process steps={content.process} />
        <IndiaAngle indiaAngle={content.indiaAngle} />
      </div>
      <Faq items={content.faq} />
      <FinalCta finalCta={content.finalCta} pageSlug={content.slug} />
    </div>
  );
}
