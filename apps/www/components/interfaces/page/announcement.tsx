import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@thinkthroo/ui/components/components/badge"

export function Announcement() {
  return (
    // <Badge asChild variant="secondary" className="bg-transparent">
    //   <Link href="https://github.com/ramu-narasinga/thinkthroo" target="_blank">
    //     <span className="flex size-2 rounded-full bg-blue-500" title="New" />
    //     Give us a star on GitHub <ArrowRightIcon />
    //   </Link>
    // </Badge>
    <div className="gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Link href="https://github.com/ramu-narasinga/thinkthroo" target="_blank" className="flex items-center ">
            Give us a star on GitHub <ArrowRightIcon />
        </Link>
    </div>
  )
}