import Image from "next/image";
import { consultingConfig, TODO_PREFIX } from "@/lib/data/consulting/config";
import { TodoText } from "../todo-text";
import { SectionHeading } from "../section-heading";

export function WhoYoullWorkWith() {
  const hasRealPhoto = !consultingConfig.engineerPhoto.includes(TODO_PREFIX);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading badge="Who you work with" title="Direct access, no middlemen" />
      <div className="flex flex-col items-center gap-6 rounded-lg border border-border/50 bg-card/50 p-8 text-center sm:flex-row sm:items-start sm:text-left">
        {hasRealPhoto ? (
          <Image
            src={consultingConfig.engineerPhoto}
            alt={consultingConfig.engineerName}
            width={96}
            height={96}
            className="shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-amber-500 bg-amber-100 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            photo
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">
            <TodoText>{consultingConfig.engineerName}</TodoText>
          </p>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            <TodoText>{consultingConfig.engineerBio}</TodoText>
          </p>
          <p className="mt-3 text-sm text-primary">
            You work directly with me, start to finish — no account manager, no handoffs.
          </p>
        </div>
      </div>
    </section>
  );
}
