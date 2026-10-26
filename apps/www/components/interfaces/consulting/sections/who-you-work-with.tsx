import Image from "next/image";
import { consultingConfig } from "@/lib/data/consulting/config";
import { TodoText } from "../todo-text";
import { TODO_PREFIX } from "@/lib/data/consulting/config";

export function WhoYoullWorkWith() {
  const hasRealPhoto = !consultingConfig.engineerPhoto.includes(TODO_PREFIX);

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h2 className="text-center text-2xl font-semibold">Who you'll work with</h2>
      <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        {hasRealPhoto ? (
          <Image
            src={consultingConfig.engineerPhoto}
            alt={consultingConfig.engineerName}
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-amber-500 bg-amber-100 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-300">
            photo
          </div>
        )}
        <div>
          <p className="font-semibold">
            <TodoText>{consultingConfig.engineerName}</TodoText>
          </p>
          <p className="mt-2 text-muted-foreground">
            <TodoText>{consultingConfig.engineerBio}</TodoText>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You work directly with me, start to finish — no account manager, no handoffs between sales and delivery.
          </p>
        </div>
      </div>
    </section>
  );
}
