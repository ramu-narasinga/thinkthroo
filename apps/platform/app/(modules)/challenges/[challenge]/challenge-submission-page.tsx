"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronUp, ChevronDown, Eye, Clock, Trophy, Code, Users, Plus, X, Github, ExternalLink } from "lucide-react"

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

export default function Component() {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "1",
      author: "Alex Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      title: "Optimized Binary Search Solution",
      language: "Python",
      githubUrl: "https://github.com/alexchen/two-sum-optimized",
      description:
        "Implemented using a hash map approach for O(n) time complexity. The solution iterates through the array once while maintaining a lookup table.",
      ossReferences: [
        { name: "NumPy", url: "https://numpy.org" },
        { name: "pytest", url: "https://pytest.org" },
      ],
      upvotes: 24,
      downvotes: 2,
      views: 156,
      timeAgo: "2 hours ago",
      criteria: {
        performance: 95,
        readability: 88,
        creativity: 76,
      },
    },
    {
      id: "2",
      author: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      title: "Recursive Approach with Memoization",
      language: "JavaScript",
      githubUrl: "https://github.com/sarahj/recursive-two-sum",
      description:
        "A unique recursive solution that explores all possible combinations with memoization to avoid redundant calculations.",
      ossReferences: [
        { name: "Lodash", url: "https://lodash.com" },
        { name: "Jest", url: "https://jestjs.io" },
      ],
      upvotes: 18,
      downvotes: 1,
      views: 89,
      timeAgo: "4 hours ago",
      criteria: {
        performance: 82,
        readability: 92,
        creativity: 85,
      },
    },
    {
      id: "3",
      author: "Mike Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      title: "Dynamic Programming Solution",
      language: "Java",
      githubUrl: "https://github.com/miker/dp-two-sum",
      description:
        "Applied dynamic programming principles to solve the two-sum problem with optimal space-time tradeoffs.",
      ossReferences: [
        { name: "JUnit", url: "https://junit.org" },
        { name: "Apache Commons", url: "https://commons.apache.org" },
      ],
      upvotes: 31,
      downvotes: 3,
      views: 203,
      timeAgo: "6 hours ago",
      criteria: {
        performance: 90,
        readability: 85,
        creativity: 88,
      },
    },
  ])

  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false)
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
    setIsSubmissionOpen(false)
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge Details - Left Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Algorithm</Badge>
                    <Badge variant="outline">Medium</Badge>
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
                <CardTitle className="text-2xl">Two Sum Problem</CardTitle>
                <CardDescription>Find two numbers in an array that add up to a specific target sum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Problem Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Given an array of integers <code className="bg-muted px-1 py-0.5 rounded text-sm">nums</code> and an
                    integer <code className="bg-muted px-1 py-0.5 rounded text-sm">target</code>, return indices of the
                    two numbers such that they add up to target. You may assume that each input would have exactly one
                    solution, and you may not use the same element twice. You can return the answer in any order.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Examples</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <div className="mb-2">
                      <strong>Example 1:</strong>
                    </div>
                    <div>Input: nums = [2,7,11,15], target = 9</div>
                    <div>Output: [0,1]</div>
                    <div className="text-muted-foreground">
                      Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>2 ≤ nums.length ≤ 10⁴</li>
                    <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                    <li>-10⁹ ≤ target ≤ 10⁹</li>
                    <li>Only one valid answer exists</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Evaluation Criteria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                      <div className="font-medium">Performance</div>
                      <div className="text-sm text-muted-foreground">Time & Space Complexity</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Code className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Readability</div>
                      <div className="text-sm text-muted-foreground">Code Quality & Style</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium">Creativity</div>
                      <div className="text-sm text-muted-foreground">Innovative Approach</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions - Right Side */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Submissions ({submissions.length})
                    </CardTitle>
                    <CardDescription>Community solutions ranked by votes</CardDescription>
                  </div>
                  <Dialog open={isSubmissionOpen} onOpenChange={setIsSubmissionOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Submit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit Your Solution</DialogTitle>
                        <DialogDescription>
                          Share your solution to the Two Sum problem with the community
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="github-url">GitHub Repository URL *</Label>
                          <Input
                            id="github-url"
                            type="url"
                            placeholder="https://github.com/username/repository"
                            value={submissionForm.githubUrl}
                            onChange={(e) => setSubmissionForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                            required
                          />
                          {submissionForm.githubUrl && !isValidGitHubUrl(submissionForm.githubUrl) && (
                            <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Solution Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your approach, algorithm complexity, and key insights..."
                            value={submissionForm.description}
                            onChange={(e) => setSubmissionForm((prev) => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            required
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Open Source References</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addOSSReference}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Reference
                            </Button>
                          </div>

                          {submissionForm.ossReferences.map((ref, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1 space-y-2">
                                <Input
                                  placeholder="Library/Tool name"
                                  value={ref.name}
                                  onChange={(e) => updateOSSReference(index, "name", e.target.value)}
                                />
                                <Input
                                  placeholder="https://..."
                                  value={ref.url}
                                  onChange={(e) => updateOSSReference(index, "url", e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOSSReference(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsSubmissionOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
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
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {submissions.map((submission, index) => (
                  <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                    {/* Author Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                          <div className="font-medium text-sm">{submission.author}</div>
                          <div className="text-xs text-muted-foreground">{submission.timeAgo}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>

                    {/* Submission Title and GitHub Link */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm flex-1">{submission.title}</h4>
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {submission.language}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2">{submission.description}</p>

                    {/* OSS References */}
                    {submission.ossReferences.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Libraries Used:</div>
                        <div className="flex flex-wrap gap-1">
                          {submission.ossReferences.map((ref, refIndex) => (
                            <a
                              key={refIndex}
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                            >
                              {ref.name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voting and Views */}
                    <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{submission.views}</span>
                      </div>
                    </div>

                    {/* Criteria Scores */}
                    <div className="space-y-2">
                      <Separator />
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        {submission.criteria.performance === 0 ? "Pending Evaluation" : "Evaluation Scores"}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className={`font-bold ${getCriteriaColor(submission.criteria.performance)}`}>
                            {submission.criteria.performance || "—"}
                          </div>
                          <div className="text-muted-foreground">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getCriteriaColor(submission.criteria.readability)}`}>
                            {submission.criteria.readability || "—"}
                          </div>
                          <div className="text-muted-foreground">Readability</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getCriteriaColor(submission.criteria.creativity)}`}>
                            {submission.criteria.creativity || "—"}
                          </div>
                          <div className="text-muted-foreground">Creativity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full bg-transparent">
                  Load More Submissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
