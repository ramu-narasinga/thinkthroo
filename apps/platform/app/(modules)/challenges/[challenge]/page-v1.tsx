"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

export default function Component({ params }: { params: { slug: string } }) {

  const [activeTab, setActiveTab] = useState("description")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [challenge, setChallenge] = useState(null)

  const [submissionForm, setSubmissionForm] = useState<SubmissionForm>({
    githubUrl: "",
    description: "",
    ossReferences: [],
  })

  const handleVote = (submissionId: string, voteType: "up" | "down") => {
    setSubmissions((prev) =>
      prev.map((submission) => {
        if (submission.id === submissionId) {
          if (voteType === "up") {
            if (submission.isUpvoted) {
              return { ...submission, upvotes: submission.upvotes - 1, isUpvoted: false }
            } else {
              return {
                ...submission,
                upvotes: submission.upvotes + 1,
                downvotes: submission.isDownvoted ? submission.downvotes - 1 : submission.downvotes,
                isUpvoted: true,
                isDownvoted: false,
              }
            }
          } else {
            if (submission.isDownvoted) {
              return { ...submission, downvotes: submission.downvotes - 1, isDownvoted: false }
            } else {
              return {
                ...submission,
                downvotes: submission.downvotes + 1,
                upvotes: submission.isUpvoted ? submission.upvotes - 1 : submission.upvotes,
                isDownvoted: true,
                isUpvoted: false,
              }
            }
          }
        }
        return submission
      }),
    )
  }

  const addOSSReference = () => {
    setSubmissionForm((prev) => ({
      ...prev,
      ossReferences: [...prev.ossReferences, { name: "", url: "" }],
    }))
  }

  const removeOSSReference = (index: number) => {
    setSubmissionForm((prev) => ({
      ...prev,
      ossReferences: prev.ossReferences.filter((_, i) => i !== index),
    }))
  }

  const updateOSSReference = (index: number, field: "name" | "url", value: string) => {
    setSubmissionForm((prev) => ({
      ...prev,
      ossReferences: prev.ossReferences.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Extract repository name from GitHub URL for title
    const repoName = submissionForm.githubUrl.split("/").pop() || "New Solution"
    const title = repoName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

    const newSubmission: Submission = {
      id: Date.now().toString(),
      author: "You", // In a real app, this would come from user auth
      avatar: "/placeholder.svg?height=32&width=32",
      title,
      language: "Unknown", // Could be detected from GitHub API
      githubUrl: submissionForm.githubUrl,
      description: submissionForm.description,
      ossReferences: submissionForm.ossReferences.filter((ref) => ref.name && ref.url),
      upvotes: 0,
      downvotes: 0,
      views: 0,
      timeAgo: "Just now",
      criteria: {
        performance: 0, // Would be evaluated later
        readability: 0,
        creativity: 0,
      },
    }

    setSubmissions((prev) => [newSubmission, ...prev])
    setSubmissionForm({ githubUrl: "", description: "", ossReferences: [] })
    setActiveTab("submissions") // Switch to submissions tab after submitting
  }

  const getCriteriaColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    if (score === 0) return "text-gray-400"
    return "text-red-600"
  }

  const isValidGitHubUrl = (url: string) => {
    return url.match(/^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/)
  }

  const getOverallScore = (criteria: { performance: number; readability: number; creativity: number }) => {
    if (criteria.performance === 0) return 0
    return Math.round((criteria.performance + criteria.readability + criteria.creativity) / 3)
  }

  useEffect(() => {
    async function fetchChallenge() {
      const data = await getChallengeBySlug(params.slug)
      setChallenge(data)
    }

    fetchChallenge()
  }, [params.slug])

  if (!challenge) {
    return <ChallengeLoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{submissions.length} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>3 days left</span>
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl">Two Sum Problem</CardTitle>
            <CardDescription className="text-lg">
              Find two numbers in an array that add up to a specific target sum
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Challenge
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit Solution
            </TabsTrigger>
          </TabsList>

          {/* Challenge Description Tab */}
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Problem Description</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Given an array of integers <code className="bg-muted px-2 py-1 rounded text-sm">nums</code> and an
                    integer <code className="bg-muted px-2 py-1 rounded text-sm">target</code>, return indices of the
                    two numbers such that they add up to target. You may assume that each input would have exactly one
                    solution, and you may not use the same element twice. You can return the answer in any order.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Examples</h3>
                  <div className="bg-muted p-6 rounded-lg font-mono text-sm space-y-4">
                    <div>
                      <div className="font-bold mb-2">Example 1:</div>
                      <div>Input: nums = [2,7,11,15], target = 9</div>
                      <div>Output: [0,1]</div>
                      <div className="text-muted-foreground mt-1">
                        Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-bold mb-2">Example 2:</div>
                      <div>Input: nums = [3,2,4], target = 6</div>
                      <div>Output: [1,2]</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-bold mb-2">Example 3:</div>
                      <div>Input: nums = [3,3], target = 6</div>
                      <div>Output: [0,1]</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Constraints</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg">
                    <li>2 ≤ nums.length ≤ 10⁴</li>
                    <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                    <li>-10⁹ ≤ target ≤ 10⁹</li>
                    <li>Only one valid answer exists</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Evaluation Criteria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <Trophy className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
                      <div className="font-semibold text-lg">Performance</div>
                      <div className="text-muted-foreground">Time & Space Complexity</div>
                    </div>
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <Code className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                      <div className="font-semibold text-lg">Readability</div>
                      <div className="text-muted-foreground">Code Quality & Style</div>
                    </div>
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                      <div className="font-semibold text-lg">Creativity</div>
                      <div className="text-muted-foreground">Innovative Approach</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Community Submissions</CardTitle>
                <CardDescription>All submissions ranked by community votes and evaluation scores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Author & Solution</TableHead>
                      <TableHead className="w-24">Language</TableHead>
                      <TableHead className="w-32 text-center">Votes</TableHead>
                      <TableHead className="w-24 text-center">Views</TableHead>
                      <TableHead className="w-32 text-center">Overall Score</TableHead>
                      <TableHead className="w-32">Submitted</TableHead>
                      <TableHead className="w-24 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission, index) => (
                      <TableRow key={submission.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Badge variant="outline">#{index + 1}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={submission.avatar || "/placeholder.svg"} alt={submission.author} />
                              <AvatarFallback>
                                {submission.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{submission.title}</div>
                              <div className="text-sm text-muted-foreground">by {submission.author}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{submission.language}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${submission.isUpvoted ? "text-green-600" : ""}`}
                              onClick={() => handleVote(submission.id, "up")}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">
                              {submission.upvotes - submission.downvotes}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${submission.isDownvoted ? "text-red-600" : ""}`}
                              onClick={() => handleVote(submission.id, "down")}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{submission.views}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div
                            className={`text-lg font-bold ${getCriteriaColor(getOverallScore(submission.criteria))}`}
                          >
                            {getOverallScore(submission.criteria) || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{submission.timeAgo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        src={submission.avatar || "/placeholder.svg"}
                                        alt={submission.author}
                                      />
                                      <AvatarFallback>
                                        {submission.author
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-xl">{submission.title}</div>
                                      <div className="text-sm text-muted-foreground font-normal">
                                        by {submission.author} • {submission.timeAgo}
                                      </div>
                                    </div>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {/* Submission Stats */}
                                  <div className="flex items-center gap-6">
                                    <Badge variant="secondary" className="text-sm">
                                      {submission.language}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 w-8 p-0 ${submission.isUpvoted ? "text-green-600" : ""}`}
                                          onClick={() => handleVote(submission.id, "up")}
                                        >
                                          <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm font-medium min-w-[2rem] text-center">
                                          {submission.upvotes - submission.downvotes}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 w-8 p-0 ${submission.isDownvoted ? "text-red-600" : ""}`}
                                          onClick={() => handleVote(submission.id, "down")}
                                        >
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Eye className="h-4 w-4" />
                                      <span>{submission.views} views</span>
                                    </div>
                                    <a
                                      href={submission.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm hover:text-foreground"
                                    >
                                      <Github className="h-4 w-4" />
                                      View Code
                                    </a>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Solution Description</h4>
                                    <p className="text-muted-foreground leading-relaxed">{submission.description}</p>
                                  </div>

                                  {/* OSS References */}
                                  {submission.ossReferences.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-3">Libraries & Tools Used</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {submission.ossReferences.map((ref, refIndex) => (
                                          <a
                                            key={refIndex}
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50"
                                          >
                                            <div className="flex-1">
                                              <div className="font-medium">{ref.name}</div>
                                              <div className="text-sm text-muted-foreground truncate">{ref.url}</div>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Evaluation Scores */}
                                  <div>
                                    <h4 className="font-semibold mb-3">
                                      {submission.criteria.performance === 0
                                        ? "Pending Evaluation"
                                        : "Evaluation Scores"}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="text-center p-4 bg-muted rounded-lg">
                                        <div
                                          className={`text-2xl font-bold ${getCriteriaColor(submission.criteria.performance)}`}
                                        >
                                          {submission.criteria.performance || "—"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Performance</div>
                                      </div>
                                      <div className="text-center p-4 bg-muted rounded-lg">
                                        <div
                                          className={`text-2xl font-bold ${getCriteriaColor(submission.criteria.readability)}`}
                                        >
                                          {submission.criteria.readability || "—"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Readability</div>
                                      </div>
                                      <div className="text-center p-4 bg-muted rounded-lg">
                                        <div
                                          className={`text-2xl font-bold ${getCriteriaColor(submission.criteria.creativity)}`}
                                        >
                                          {submission.criteria.creativity || "—"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Creativity</div>
                                      </div>
                                      <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                                        <div
                                          className={`text-2xl font-bold ${getCriteriaColor(getOverallScore(submission.criteria))}`}
                                        >
                                          {getOverallScore(submission.criteria) || "—"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Overall</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <a
                              href={submission.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 text-center">
                  <Button variant="outline" size="lg">
                    Load More Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Form Tab */}
          <TabsContent value="submit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Submit Your Solution</CardTitle>
                <CardDescription className="text-lg">
                  Share your solution to the Two Sum problem with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                  <div className="space-y-3">
                    <Label htmlFor="github-url" className="text-base font-semibold">
                      GitHub Repository URL *
                    </Label>
                    <Input
                      id="github-url"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={submissionForm.githubUrl}
                      onChange={(e) => setSubmissionForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                      className="text-base"
                      required
                    />
                    {submissionForm.githubUrl && !isValidGitHubUrl(submissionForm.githubUrl) && (
                      <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Link to your GitHub repository containing the solution code
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Solution Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your approach, algorithm complexity, key insights, and any interesting implementation details..."
                      value={submissionForm.description}
                      onChange={(e) => setSubmissionForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="text-base"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Explain your solution approach, time/space complexity, and any unique aspects
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Open Source References</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          List any libraries, frameworks, or tools you used
                        </p>
                      </div>
                      <Button type="button" variant="outline" onClick={addOSSReference}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reference
                      </Button>
                    </div>

                    {submissionForm.ossReferences.map((ref, index) => (
                      <div key={index} className="flex gap-3 items-end p-4 border rounded-lg">
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder="Library/Tool name (e.g., NumPy, Jest, etc.)"
                            value={ref.name}
                            onChange={(e) => updateOSSReference(index, "name", e.target.value)}
                          />
                          <Input
                            placeholder="URL (e.g., https://numpy.org)"
                            value={ref.url}
                            onChange={(e) => updateOSSReference(index, "url", e.target.value)}
                          />
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => removeOSSReference(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {submissionForm.ossReferences.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No references added yet. Click "Add Reference" to include libraries you used.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSubmissionForm({ githubUrl: "", description: "", ossReferences: [] })}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        !submissionForm.githubUrl ||
                        !submissionForm.description ||
                        !isValidGitHubUrl(submissionForm.githubUrl)
                      }
                    >
                      Submit Solution
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
