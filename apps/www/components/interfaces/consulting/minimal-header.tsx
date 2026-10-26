import Link from "next/link";
import { Icons } from "@/components/icons";
import { BookCallButton } from "./book-call-button";

export function MinimalHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b border-border/50">
      <div className="container-wrapper px-6">
        <div className="flex h-(--header-height) items-center justify-between">
          <Link href="/consulting" className="flex items-center gap-2">
            <Icons.logo className="h-7 w-7" />
            <span className="font-semibold tracking-tight text-foreground">
              Think Throo
            </span>
          </Link>
          <BookCallButton label="Book a free call" size="sm" />
        </div>
      </div>
    </header>
  );
}
