import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Clock,
  Trophy,
  Code,
  Users,
  Plus,
  X,
  Github,
  ExternalLink,
  FileText,
  Send,
  Info,
} from "lucide-react"
import { getChallengeBySlug } from "@/lib/challenges"
import ChallengeLoadingSkeleton from "./skeleton"
import ChallengeTabs from "@/components/interfaces/challenges/challenge-tabs"

interface OSSReference {
  name: string
  url: string
}

interface Submission {
  id: string
  author: string
  avatar: string
  title: string
  language: string
  githubUrl: string
  description: string
  ossReferences: OSSReference[]
  upvotes: number
  downvotes: number
  views: number
  timeAgo: string
  criteria: {
    performance: number
    readability: number
    creativity: number
  }
  isUpvoted?: boolean
  isDownvoted?: boolean
}

interface SubmissionForm {
  githubUrl: string
  description: string
  ossReferences: OSSReference[]
}

export default async function ChallengePage({ params }: { params: { challenge: string } }) {

  console.log("params.slug", params.challenge)

  const challenge = await getChallengeBySlug(params.challenge);

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {challenge.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag.title}
                  </Badge>
                ))}
              </div>
              {/* <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{0} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>3 days left</span>
                </div>
              </div> */}
            </div>
            <CardTitle className="text-3xl">{challenge.title}</CardTitle>
            <CardDescription className="text-lg">
              {challenge.metaDescription}
            </CardDescription>
          </CardHeader>
        </Card>

        <ChallengeTabs 
          challenge={challenge}
        />
      </div>
    </div>
  )
}
