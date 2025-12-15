'use client'

import Link from "next/link"
import { Button } from "@thinkthroo/ui/components/button"
import { useUmami } from "@/hooks/use-umami"

export function AuthButtons() {
  const { track } = useUmami()
  
  return (
    <>
      <Button asChild size="sm" variant="outline" className="3xl:flex">
        <Link 
          target="_blank" 
          rel="noreferrer" 
          href="https://app.thinkthroo.com/signin/email_signin"
          onClick={() => track('navigation-click', { menu_item: 'login', href: 'https://app.thinkthroo.com/signin/email_signin' })}
        >
          Login
        </Link>
      </Button>
      <Button asChild size="sm" variant="default" className="3xl:flex">
        <Link 
          target="_blank" 
          rel="noreferrer" 
          href="https://app.thinkthroo.com/signin/email_signin"
          onClick={() => track('navigation-click', { menu_item: 'signup', href: 'https://app.thinkthroo.com/signin/email_signin' })}
        >
          Signup
        </Link>
      </Button>
    </>
  )
}
