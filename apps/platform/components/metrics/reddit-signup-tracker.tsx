"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function RedditSignupTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("signup") !== "success") return
    if (typeof window === "undefined") return
    const rdt = (window as unknown as { rdt?: (a: string, e: string) => void }).rdt
    if (rdt) rdt("track", "SignUp")
    window.history.replaceState({}, "", window.location.pathname)
  }, [searchParams])

  return null
}
