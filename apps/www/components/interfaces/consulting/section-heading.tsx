export function SectionHeading({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
        <span className="text-xs font-semibold text-foreground">{badge}</span>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground lg:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-muted-foreground text-balance">{description}</p>
      )}
    </div>
  );
}
