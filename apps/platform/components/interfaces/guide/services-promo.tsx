"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { Globe } from 'lucide-react'
import Link from "next/link"
import { siteConfig } from "@/config/site"

export default function ServicesPromo() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Insights from Open Source projects</CardTitle>
        <CardDescription>Best practices used in open-source are explained, compared among multiple projects.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Study the codebase architecture and level up your skills.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button className="w-full max-w-xs" >
          <Link href={siteConfig.links.learningPlatform} target="_blank">Get Started For Free</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}