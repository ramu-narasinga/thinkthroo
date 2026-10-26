import { LandingPage } from "@/components/interfaces/consulting/landing-page";
import { getLandingPage } from "@/lib/data/consulting/pages";
import { buildLandingPageMetadata } from "@/lib/data/consulting/metadata";

const content = getLandingPage("rag-document-ai")!;

export const metadata = buildLandingPageMetadata(content, "/consulting/rag-document-ai");

export default function RagDocumentAiPage() {
  return <LandingPage content={content} />;
}
