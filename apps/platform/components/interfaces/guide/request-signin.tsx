import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RequestSignin() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Please login to view this content</CardTitle>
        <CardDescription>Log in to access this content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          By logging in, you&apos;ll be able to:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
          <li>Start your learning journey</li>
          <li>Save your progress</li>
          <li>Manage your account settings</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/signin">Log In</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

