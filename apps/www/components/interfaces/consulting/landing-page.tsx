import { Separator } from "@thinkthroo/ui/components/separator";
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
      <Separator className="mx-auto max-w-3xl" />
      <WhoYoullWorkWith />
      <Separator className="mx-auto max-w-3xl" />
      <Offer offer={content.offer} />
      <Process steps={content.process} />
      <Separator className="mx-auto max-w-3xl" />
      <IndiaAngle indiaAngle={content.indiaAngle} />
      <Faq items={content.faq} />
      <Separator className="mx-auto max-w-3xl" />
      <FinalCta finalCta={content.finalCta} pageSlug={content.slug} />
    </div>
  );
}
