import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@thinkthroo/ui/components/card";
import { TodoText } from "./todo-text";
import type { CaseStudy } from "@/lib/data/consulting/types";

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link href={`/consulting/case-studies/${caseStudy.slug}`}>
      <Card className="h-full transition-colors hover:border-foreground/30">
        <CardHeader>
          <CardDescription>
            <TodoText>{caseStudy.industry}</TodoText>
          </CardDescription>
          <CardTitle className="text-lg">
            <TodoText>{caseStudy.title}</TodoText>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <TodoText>{caseStudy.summary}</TodoText>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
