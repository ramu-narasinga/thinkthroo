'use client'

import Link from "next/link"
import { Button } from "@thinkthroo/ui/components/button"
import { useUmami } from "@/hooks/use-umami"
import posthog from "posthog-js"

export function AuthButtons() {
  const { track } = useUmami()

  return (
    <>
      <Button asChild size="sm" variant="outline" className="3xl:flex">
        <Link
          target="_blank"
          rel="noreferrer"
          href="https://app.thinkthroo.com//login"
          onClick={() => {
            track('navigation-click', { menu_item: 'login', href: 'https://app.thinkthroo.com//login' });
            posthog.capture("login_clicked", {
              href: "https://app.thinkthroo.com//login"
            });
          }}
        >
          Login
        </Link>
      </Button>
      <Button asChild size="sm" variant="default" className="3xl:flex">
        <Link
          target="_blank"
          rel="noreferrer"
          href="https://app.thinkthroo.com//login"
          onClick={() => {
            track('navigation-click', { menu_item: 'signup', href: 'https://app.thinkthroo.com//login' });
            posthog.capture("signup_clicked", {
              href: "https://app.thinkthroo.com//login"
            });
          }}
        >
          Signup
        </Link>
      </Button>
    </>
  )
}
