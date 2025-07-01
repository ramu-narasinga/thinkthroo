"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/architecture"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/architecture") ? "text-foreground" : "text-foreground/60"
          )}
        >
          Codebase Architecture
        </Link>
        <Link
          href="/best-practices"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/best-practices") ? "text-foreground" : "text-foreground/60"
          )}
        >
          Best Practices
        </Link>
        <Link
          href="/production-grade-projects"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/production-grade-projects")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Production Grade Projects
        </Link>
        <Link
          href="/build-from-scratch"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/build-from-scratch")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Build From Scratch
        </Link>
        <Link
          href="/cli"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/cli")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          CLI
        </Link>
        <Link
          href="/challenges"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/challenges")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Challenges
        </Link>
        <Link
          href="/leaderboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/leader-board")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Leaderboard
        </Link>
      </nav>
    </div>
  )
}