import Link from "next/link";
import { TodoText } from "./todo-text";
import type { CaseStudy } from "@/lib/data/consulting/types";

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link href={`/consulting/case-studies/${caseStudy.slug}`} className="group">
      <div className="h-full rounded-lg border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/70">
        <p className="text-sm text-muted-foreground">
          <TodoText>{caseStudy.industry}</TodoText>
        </p>
        <h3 className="mt-2 font-semibold text-foreground group-hover:text-primary transition-colors">
          <TodoText>{caseStudy.title}</TodoText>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          <TodoText>{caseStudy.summary}</TodoText>
        </p>
      </div>
    </Link>
  );
}
