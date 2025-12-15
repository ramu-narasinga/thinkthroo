import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { Button } from "@thinkthroo/ui/components/components/button"
import { Skeleton } from "@thinkthroo/ui/components/components/skeleton"
import { getRepoStars } from "@/lib/get-repo-stars"

export function GitHubLink() {
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
        <Icons.gitHub className="h-4 w-4" />
        <React.Suspense fallback={<Skeleton className="h-4 w-8" />}>
          <StarsCount />
        </React.Suspense>
      </Link>
    </Button>
  )
}

export async function StarsCount() {

  let stars = await getRepoStars("ramu-narasinga/thinkthroo")

  return (
    <span className="text-muted-foreground w-fit text-xs tabular-nums">
      {stars?.replace(".0k", "k")}
    </span>
  )
}