import { TODO_PREFIX } from "@/lib/data/consulting/config";
import { cn } from "@/lib/utils";

/** Renders text as-is, but visibly flags unresolved {{TODO: ...}} placeholders so they can't ship by accident. */
export function TodoText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const isTodo = children.includes(TODO_PREFIX);
  return (
    <span
      className={cn(
        isTodo &&
          "rounded border border-dashed border-amber-500 bg-amber-100 px-1 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
        className
      )}
    >
      {children}
    </span>
  );
}
