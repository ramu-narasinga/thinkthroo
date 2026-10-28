import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { pageIsIndexable } from "./page-readiness";
import type { ConsultingContent } from "./types";

export function buildConsultingMetadata(
  content: ConsultingContent,
  path: string
): Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title: content.seoTitle,
    description: content.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: content.seoTitle,
      description: content.seoDescription,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: content.seoTitle,
      description: content.seoDescription,
    },
    robots: pageIsIndexable(content) ? undefined : { index: false, follow: true },
  };
}
