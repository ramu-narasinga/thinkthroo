import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@thinkthroo/ui/components/badge";
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
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-muted-foreground">
        <TodoText>{caseStudy.industry}</TodoText>
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        <TodoText>{caseStudy.title}</TodoText>
      </h1>

      {caseStudy.screenshot && (
        <Image
          src={caseStudy.screenshot}
          alt={caseStudy.title}
          width={800}
          height={450}
          className="mt-8 rounded-lg border"
        />
      )}

      <section className="mt-8">
        <h2 className="font-semibold">The problem</h2>
        <p className="mt-2 text-muted-foreground">
          <TodoText>{caseStudy.problem}</TodoText>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">What I built</h2>
        <p className="mt-2 text-muted-foreground">
          <TodoText>{caseStudy.whatIBuilt}</TodoText>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Stack</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {caseStudy.stack.map((tech) => (
            <Badge key={tech} variant="secondary">
              <TodoText>{tech}</TodoText>
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Result</h2>
        <p className="mt-2 text-muted-foreground">
          <TodoText>{caseStudy.result}</TodoText>
        </p>
      </section>
    </article>
  );
}
