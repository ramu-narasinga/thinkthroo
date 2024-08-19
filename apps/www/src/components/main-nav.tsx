"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import Image from "next/image"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        {/* <Icons.logo className="h-6 w-6" /> */}
        <Image
          src="/logo.svg"
          alt="Hero"
          className="h-6 w-6 text-primary"
          width={120}
          height={120}
        />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/architecture"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/architecture" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Architecture
        </Link>
        <Link
          href="/best-practices"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname == "/best-practices"
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Best practices
        </Link>
        <Link
          href="/build-from-scratch"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname == "/build-from-scratch"
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Build from scratch
        </Link>
        <Link
          href="/production-grade-projects"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname == "/production-grade-projects"
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Production-grade projects
        </Link>
        <Link
          href="/blog"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname == "/blog"
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Blog
        </Link>
        <Link
          href="/contact"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname == "/contact"
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Contact
        </Link>
      </nav>
    </div>
  )
}