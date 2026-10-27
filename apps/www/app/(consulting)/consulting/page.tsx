import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@thinkthroo/ui/components/button";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { BookCallButton } from "@/components/interfaces/consulting/book-call-button";
import { FinalCta } from "@/components/interfaces/consulting/sections/final-cta";
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
    <div>
      <PageHeader>
        <PageHeaderHeading className="text-foreground">
          AI development services
        </PageHeaderHeading>
        <PageHeaderDescription>
          Pick the closest match to what you need. Every page ends with the
          same thing: a free 20-minute scoping call.
        </PageHeaderDescription>
        <PageActions>
          <BookCallButton label="Book a free 20-min scoping call" size="sm" />
          <Button size="sm" variant="outline" asChild>
            <a href="#lead-form">Send a few details instead</a>
          </Button>
        </PageActions>
        <p className="text-sm text-muted-foreground">
          Built in India · US-hours overlap · Fixed-price pilots
        </p>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(landingPages).map((page) => (
            <Link key={page.slug} href={`/consulting/${page.slug}`} className="group">
              <div className="h-full rounded-lg border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/70">
                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {page.hero.h1}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {page.hero.subhead}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="mt-16 text-center text-xl font-semibold text-foreground">
          Case studies
        </h2>
        <div className="mt-6 flex flex-col items-center gap-3">
          {caseStudies.map((caseStudy) => (
            <Link
              key={caseStudy.slug}
              href={`/consulting/case-studies/${caseStudy.slug}`}
              className="text-sm text-primary hover:underline"
            >
              {caseStudy.title}
            </Link>
          ))}
        </div>
      </div>

      <FinalCta
        pageSlug="consulting"
        finalCta={{
          heading: "Not sure which page fits?",
          subhead: "Tell me what you need built. I'll point you to the right scope, or tell you if it's not a fit.",
        }}
      />
    </div>
  );
}
