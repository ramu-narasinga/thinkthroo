import { LandingPage } from "@/components/interfaces/consulting/landing-page";
import { getLandingPage } from "@/lib/data/consulting/pages";
import { buildLandingPageMetadata } from "@/lib/data/consulting/metadata";

const content = getLandingPage("white-label-ai-development")!;

export const metadata = buildLandingPageMetadata(
  content,
  "/consulting/white-label-ai-development"
);

export default function WhiteLabelAiDevelopmentPage() {
  return <LandingPage content={content} />;
}
