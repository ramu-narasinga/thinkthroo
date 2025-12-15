"use client"

import Link from 'next/link'
import { Icons } from '@/components/icons'

const ShareArticleActions = ({
  title,
  slug,
  iconSize = 20,
  basePath = 'https://app.thinkthroo.com',
}: {
  title: string
  slug: string
  iconSize?: number
  basePath?: string
}) => {
  const permalink = encodeURIComponent(`${basePath}${slug}`)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="mt-4 flex items-center gap-4">
      <Link
        aria-label="Share on X"
        href={`https://twitter.com/intent/tweet?url=${permalink}&text=${encodedTitle}`}
        target="_blank"
        className="text-foreground-lighter hover:text-foreground"
      >
        <Icons.twitter />
      </Link>

      <Link
        aria-label="Share on Linkedin"
        href={`https://www.linkedin.com/shareArticle?url=${permalink}&text=${encodedTitle}`}
        target="_blank"
        className="text-foreground-lighter hover:text-foreground"
      >
        <Icons.linkedin />
      </Link>

      <Link
        aria-label="Share on Reddit"
        href={`https://www.reddit.com/submit?url=${permalink}&text=${encodedTitle}`}
        target="_blank"
        className="text-foreground-lighter hover:text-foreground"
      >
        <Icons.reddit />
      </Link>
    </div>
  )
}

export default ShareArticleActions