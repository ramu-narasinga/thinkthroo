import Link from "next/link";

export function MinimalFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Think Throo</span>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/refund" className="hover:text-foreground">
            Refund Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
