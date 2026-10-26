import Link from "next/link";
import Image from "next/image";
import { BookCallButton } from "./book-call-button";

export function MinimalHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/consulting" className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="Think Throo"
            width={28}
            height={28}
            className="rounded-full"
            unoptimized
          />
          <span className="font-semibold">Think Throo</span>
        </Link>
        <BookCallButton label="Book a free call" size="sm" />
      </div>
    </header>
  );
}
