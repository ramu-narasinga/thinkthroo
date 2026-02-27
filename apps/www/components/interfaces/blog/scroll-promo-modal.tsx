"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()

  const [open, setOpen] = useState(false)

  // Use refs so the scroll listener never goes stale and doesn't need re-registration
  const readyRef = useRef(false)
  const hasTriggeredRef = useRef(false)
  const tickingRef = useRef(false)

  // Reset on every blog navigation
  useEffect(() => {
    setOpen(false)
    readyRef.current = false
    hasTriggeredRef.current = false

    // Give the browser enough time to finish rendering AND scroll-restoration
    // (rAF alone is too fast — Next.js restores scroll after the first paint)
    const id = setTimeout(() => {
      readyRef.current = true
    }, 500)

    return () => clearTimeout(id)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (!readyRef.current) return
      if (hasTriggeredRef.current) return
      if (tickingRef.current) return

      tickingRef.current = true

      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight

        if (docHeight <= 0) {
          tickingRef.current = false
          return
        }

        const scrolledPercent = (scrollTop / docHeight) * 100

        if (scrolledPercent >= 30) {
          hasTriggeredRef.current = true
          setOpen(true)
        }

        tickingRef.current = false
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
    // No dependency on hasTriggered — the ref keeps the listener accurate without re-registration
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🔥 Wait!</DialogTitle>
          <DialogDescription>
            Check out our AI code review tool before you continue reading.
          </DialogDescription>
        </DialogHeader>

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