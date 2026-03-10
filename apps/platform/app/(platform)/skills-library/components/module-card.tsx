import { type SanitySkill } from "@/lib/skill"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Download, PlusCircle, Tag, Zap } from "lucide-react"
import Link from "next/link"

interface ModuleCardProps {
  skill: SanitySkill
  weeklyDownloads: number
}

export function ModuleCard({ skill, weeklyDownloads }: ModuleCardProps) {
  const { title, description, slug, tags, skillsCount } = skill

  return (
    <Card className="group hover:shadow-md transition-shadow flex flex-col">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4" />
            <span>
              {skillsCount ?? 1} {(skillsCount ?? 1) === 1 ? "skill" : "skills"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            <span>{weeklyDownloads.toLocaleString()} weekly</span>
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                <Tag className="h-3 w-3" />
                {tag.title}
              </Badge>
            ))}
          </div>
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
