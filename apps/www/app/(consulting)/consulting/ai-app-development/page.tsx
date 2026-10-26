import { LandingPage } from "@/components/interfaces/consulting/landing-page";
import { getLandingPage } from "@/lib/data/consulting/pages";
import { buildLandingPageMetadata } from "@/lib/data/consulting/metadata";

const content = getLandingPage("ai-app-development")!;

export const metadata = buildLandingPageMetadata(content, "/consulting/ai-app-development");

export default function AiAppDevelopmentPage() {
  return <LandingPage content={content} />;
}
