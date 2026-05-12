import { type SanitySkill } from "@/lib/skill"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

interface ModuleCardProps {
  skill: SanitySkill
}

export function ModuleCard({ skill }: ModuleCardProps) {
  const { title, description, slug, tags } = skill

  return (
    <Card className="group hover:shadow-md transition-shadow flex flex-col">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        {/* Tags */}
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag.title}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No tags</p>
        )}

        {/* CTA pinned to bottom */}
        <div className="mt-auto pt-2">
          <Button asChild className="w-full">
            <Link href={`/skills-library/${slug}`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add skill
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
