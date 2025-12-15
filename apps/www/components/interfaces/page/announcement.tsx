"use client";
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { useUmami } from "@/hooks/use-umami"

import { Badge } from "@thinkthroo/ui/components/badge"

export function Announcement() {
  const { track } = useUmami();
  return (
    // <Badge asChild variant="secondary" className="bg-transparent">
    //   <Link href="https://github.com/ramu-narasinga/thinkthroo" target="_blank">
    //     <span className="flex size-2 rounded-full bg-blue-500" title="New" />
    //     Give us a star on GitHub <ArrowRightIcon />
    //   </Link>
    // </Badge>
    <div className="gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Link 
          href="https://github.com/ramu-narasinga/thinkthroo" 
          target="_blank" 
          className="flex items-center "
          onClick={() => track('github-star', { button: 'Give us a star on GitHub', href: 'https://github.com/ramu-narasinga/thinkthroo' })}
        >
            Give us a star on GitHub<ArrowRightIcon />
        </Link>
    </div>
  )
}