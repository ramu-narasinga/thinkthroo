"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@thinkthroo/ui/components/dialog"
import { ArrowRight } from "lucide-react"
import { Button } from "@thinkthroo/ui/components/button"

export function ScrollPromoModal() {
  const [open, setOpen] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (hasTriggered) return

      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight

      const scrolledPercent = (scrollTop / docHeight) * 100

      if (scrolledPercent >= 30) {
        setOpen(true)
        setHasTriggered(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasTriggered])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🔥 Wait!</DialogTitle>
          <DialogDescription>
            Check out our AI code review tool before you continue reading.
          </DialogDescription>
        </DialogHeader>

        {/* your promo content */}
        <div className="mt-4">
          <Button
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white cursor-pointer"
            size="sm"
            onClick={() =>
              window.open(
                "https://app.thinkthroo.com",
                "_blank",
                "noopener,noreferrer"
              )
            }
            >
            Try it for free 
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}