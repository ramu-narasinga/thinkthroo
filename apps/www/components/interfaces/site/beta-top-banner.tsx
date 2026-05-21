import { FlaskConical } from "lucide-react";

export function BetaTopBanner() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-800 dark:text-blue-300">
        <FlaskConical className="h-4 w-4 shrink-0" />
        <span>
          <strong>Think Throo is in Beta</strong> — We&apos;re actively improving. Your feedback helps.
        </span>
      </div>
    </div>
  );
}
