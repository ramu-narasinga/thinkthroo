import Link from "next/link";

import { getColors } from "@/lib/colors";
import { siteConfig } from "@/lib/config";
import { GitHubLink } from "@/components/interfaces/site/header/github-link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/interfaces/site/header/main-nav";
import { MobileNav } from "@/components/interfaces/site/header/mobile-nav";
import { ModeSwitcher } from "@/components/interfaces/site/header/mode-switcher";
import { Button, buttonVariants } from "@thinkthroo/ui/components/button";
import { Separator } from "@thinkthroo/ui/components/separator";
import { SiteConfig } from "./site-config";

export async function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="3xl:fixed:container flex h-(--header-height) items-center **:data-[slot=separator]:!h-4">
          <MobileNav 
            className="flex lg:hidden"
          />
          <MainNav className="hidden lg:flex" />
          {/* <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>
            <nav className="flex items-center">
              <Button asChild size="sm" variant="default">
                <Link target="_blank" rel="noreferrer" href="/consultation">
                  Book a meeting
                </Link>
              </Button>

              <Link
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
            </nav>
          </div> */}
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <GitHubLink />
            <Separator orientation="vertical" className="3xl:flex hidden" />
            <SiteConfig className="3xl:flex hidden" />
            <Separator orientation="vertical" />
            <ModeSwitcher />
            <Separator orientation="vertical" />
            <Button asChild size="sm" variant="outline" className="3xl:flex">
              <Link target="_blank" rel="noreferrer" href="/consultation">
                Login
              </Link>
            </Button>
            <Button asChild size="sm" variant="default" className="3xl:flex">
              <Link target="_blank" rel="noreferrer" href="/consultation">
                Signup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
