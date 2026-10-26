import Link from "next/link";
import { Icons } from "@/components/icons";

export function MinimalFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="container-wrapper px-6">
        <div className="flex flex-col items-center gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Icons.logo className="h-5 w-5" />
            <span>© {new Date().getFullYear()} Think Throo</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-foreground transition-colors">
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
