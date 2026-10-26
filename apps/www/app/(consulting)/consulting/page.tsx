import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription } from "@thinkthroo/ui/components/card";
import { landingPages } from "@/lib/data/consulting/pages";
import { caseStudies } from "@/lib/data/consulting/case-studies";
import { siteConfig } from "@/lib/config";

const PATH = "/consulting";

export const metadata: Metadata = {
  title: "AI Development Services | Think Throo",
  description:
    "AI chatbots, agents, apps, and RAG systems for small US businesses, built by a senior engineer at a fixed price.",
  alternates: { canonical: `${siteConfig.url}${PATH}` },
};

export default function ConsultingIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        AI development services
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Pick the closest match to what you need. Every page ends with the same
        thing: a free 20-minute scoping call.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Object.values(landingPages).map((page) => (
          <Link key={page.slug} href={`/consulting/${page.slug}`}>
            <Card className="h-full transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardTitle>{page.hero.h1}</CardTitle>
                <CardDescription>{page.hero.subhead}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-16 text-center text-xl font-semibold">Case studies</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <Link
            key={caseStudy.slug}
            href={`/consulting/case-studies/${caseStudy.slug}`}
            className="text-sm underline text-muted-foreground hover:text-foreground"
          >
            {caseStudy.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
