import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { Button } from "@thinkthroo/ui/components/button"
import { Skeleton } from "@thinkthroo/ui/components/skeleton"

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
  const data = await fetch("https://api.github.com/repos/ramu-narasinga/thinkthroo", {
    next: { revalidate: 86400 },
  })
  const json = await data.json()

  const formattedCount =
    json.stargazers_count >= 1000
      ? json.stargazers_count % 1000 === 0
        ? `${Math.floor(json.stargazers_count / 1000)}k`
        : `${(json.stargazers_count / 1000).toFixed(1)}k`
      : json.stargazers_count?.toLocaleString()

  return (
    <span className="text-muted-foreground w-fit text-xs tabular-nums">
      {formattedCount?.replace(".0k", "k")}
    </span>
  )
}