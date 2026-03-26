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
import { Button } from "@thinkthroo/ui/components/button"
import { Input } from "@thinkthroo/ui/components/input"

export function ScrollPromoModal() {
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use refs so the scroll listener never goes stale and doesn't need re-registration
  const readyRef = useRef(false)
  const hasTriggeredRef = useRef(false)
  const tickingRef = useRef(false)

  // Reset on every blog navigation
  useEffect(() => {
    setOpen(false)
    setEmail("")
    setSubmitted(false)
    setError(null)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/blog-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })

      if (res.status === 409) {
        setSubmitted(true)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? "Something went wrong. Please try again.")
        return
      }

      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm text-center">
        {submitted ? (
          <div className="py-6 flex flex-col items-center gap-3">
            <p className="text-2xl">🎉</p>
            <DialogTitle className="text-xl font-semibold">You&apos;re in!</DialogTitle>
            <DialogDescription>
              We&apos;ll send new articles straight to your inbox.
            </DialogDescription>
            <Button className="mt-2" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="items-center text-center gap-1">
              <DialogTitle className="text-xl font-semibold leading-snug">
                Be the first to read new articles
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Enter your email and get new articles from Thinkthroo delivered
                straight to your inbox.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              {error && (
                <p className="text-xs text-destructive text-left">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}