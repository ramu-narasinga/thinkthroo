import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { TodoText } from "@/components/interfaces/consulting/todo-text";
import { caseStudies, getCaseStudy } from "@/lib/data/consulting/case-studies";
import { hasUnresolvedTodo } from "@/lib/data/consulting/todo-check";
import { siteConfig } from "@/lib/config";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) return {};

  const path = `/consulting/case-studies/${caseStudy.slug}`;
  return {
    title: `${caseStudy.title} | Think Throo`,
    description: caseStudy.summary,
    alternates: { canonical: `${siteConfig.url}${path}` },
    robots: hasUnresolvedTodo(caseStudy) ? { index: false, follow: true } : undefined,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">
        <TodoText>{caseStudy.industry}</TodoText>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-foreground lg:text-4xl">
        <TodoText>{caseStudy.title}</TodoText>
      </h1>

      {caseStudy.screenshot && (
        <Image
          src={caseStudy.screenshot}
          alt={caseStudy.title}
          width={800}
          height={450}
          className="mt-8 rounded-lg border border-border/50"
        />
      )}

      <section className="mt-10">
        <h2 className="font-semibold text-foreground">The problem</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          <TodoText>{caseStudy.problem}</TodoText>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-foreground">What I built</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          <TodoText>{caseStudy.whatIBuilt}</TodoText>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-foreground">Stack</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {caseStudy.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs text-muted-foreground"
            >
              <TodoText>{tech}</TodoText>
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
        <h2 className="font-semibold text-foreground">Result</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          <TodoText>{caseStudy.result}</TodoText>
        </p>
      </section>
    </article>
  );
}
