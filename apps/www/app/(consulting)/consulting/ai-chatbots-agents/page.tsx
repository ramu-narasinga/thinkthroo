import { LandingPage } from "@/components/interfaces/consulting/landing-page";
import { getLandingPage } from "@/lib/data/consulting/pages";
import { buildLandingPageMetadata } from "@/lib/data/consulting/metadata";

const content = getLandingPage("ai-chatbots-agents")!;

export const metadata = buildLandingPageMetadata(content, "/consulting/ai-chatbots-agents");

export default function AiChatbotsAgentsPage() {
  return <LandingPage content={content} />;
}
