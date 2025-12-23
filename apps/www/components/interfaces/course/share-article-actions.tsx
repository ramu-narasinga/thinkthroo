'use client'

import Link from 'next/link'
import { Icons } from '@/components/icons'
import posthog from 'posthog-js'

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

  const handleShare = (platform: string) => {
    posthog.capture("article_shared", {
      platform,
      article_title: title,
      article_slug: slug
    });
  };

  return (
    <div className="mt-4 flex items-center gap-4">
      <Link
        aria-label="Share on X"
        href={`https://twitter.com/intent/tweet?url=${permalink}&text=${encodedTitle}`}
        target="_blank"
        className="text-foreground-lighter hover:text-foreground"
        onClick={() => handleShare('twitter')}
      >
        <Icons.twitter />
      </Link>

      <Link
        aria-label="Share on Linkedin"
        href={`https://www.linkedin.com/shareArticle?url=${permalink}&text=${encodedTitle}`}
        target="_blank"
        className="text-foreground-lighter hover:text-foreground"
        onClick={() => handleShare('linkedin')}
      >
        <Icons.linkedin />
      </Link>

      <Link
        aria-label="Share on Reddit"
        href={`https://www.reddit.com/submit?url=${permalink}&text=${encodedTitle}`}
        target="_blank"
        className="text-foreground-lighter hover:text-foreground"
        onClick={() => handleShare('reddit')}
      >
        <Icons.reddit />
      </Link>
    </div>
  )
}

export default ShareArticleActions