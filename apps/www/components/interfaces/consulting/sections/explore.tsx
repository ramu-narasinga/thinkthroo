import Link from "next/link";
import { BookOpen, Blocks, GraduationCap } from "lucide-react";
import { GridBackground } from "../grid-background";
import { SectionHeading } from "../section-heading";
import { siteConfig } from "@/lib/config";

const LINKS = [
  {
    href: "/blog",
    external: false,
    icon: BookOpen,
    title: "Blog",
    description:
      "We study real open-source codebases and write about the patterns, best practices, and code quality behind them.",
    stat: "1,000+ monthly readers · 150+ signups",
  },
  {
    href: "https://app.thinkthroo.com/skills-library",
    external: true,
    icon: Blocks,
    title: "Skills library",
    description: "Skills built from real codebase architecture patterns.",
  },
  {
    href: siteConfig.links.learningPlatform,
    external: true,
    icon: GraduationCap,
    title: "Codebase architecture breakdowns",
    description: "Real production codebases, studied in detail.",
  },
];

export function Explore() {
  return (
    <section className="relative w-full">
      <GridBackground />

      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading badge="Research" title="Dig into the work itself" />
        <div className="grid gap-4 sm:grid-cols-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="group h-full rounded-lg border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/70"
            >
              <link.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{link.description}</p>
              {"stat" in link && (
                <p className="mt-3 text-xs font-medium text-primary">{link.stat}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
