import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/interfaces/site/header/main-nav"
import { MobileNav } from "@/components/interfaces/site/header/mobile-nav"
import { Button, buttonVariants } from "@thinkthroo/ui/components/button"
import { createClient } from '@/utils/supabase/server';
import { AccountMenu } from "./account-menu"
import { BadgeCheck, Rocket, Star } from "lucide-react"

export async function SiteHeader() {

  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-[2rem] flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild size="sm" variant="default">
                <Link
                  href="/upgrade"
                  className="flex items-center gap-2"
                >
                  <Rocket />
                  <span>Upgrade</span>
                </Link>
            </Button>
            {/* <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "h-8 w-8 px-0"
                )}
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "h-8 w-8 px-0"
                )}
              >
                <Icons.twitter className="h-3 w-3 fill-current" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link> */}
            {
              user ? 
              <AccountMenu fullName={user.user_metadata.full_name} />
              : 
              <Button asChild size="sm" className="h-8">
                <Link href="/signin">Login</Link>
              </Button>
            }
          </nav>
        </div>
      </div>
    </header>
  )
}