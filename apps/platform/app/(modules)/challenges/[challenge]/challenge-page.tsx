"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronUp, ChevronDown, Eye, Clock, Trophy, Code, Users } from "lucide-react"

interface Submission {
  id: string
  author: string
  avatar: string
  title: string
  language: string
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

export default function Component() {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "1",
      author: "Alex Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      title: "Optimized Binary Search Solution",
      language: "Python",
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
    {
      id: "4",
      author: "Emma Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      title: "Functional Programming Approach",
      language: "Haskell",
      upvotes: 12,
      downvotes: 0,
      views: 67,
      timeAgo: "8 hours ago",
      criteria: {
        performance: 78,
        readability: 95,
        creativity: 92,
      },
    },
  ])

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

  const getCriteriaColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
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
                      <span>127 participants</span>
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
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Submissions ({submissions.length})
                </CardTitle>
                <CardDescription>Community solutions ranked by votes</CardDescription>
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

                    {/* Submission Title */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">{submission.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {submission.language}
                      </Badge>
                    </div>

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
                      <div className="text-xs font-medium text-muted-foreground mb-2">Evaluation Scores</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className={`font-bold ${getCriteriaColor(submission.criteria.performance)}`}>
                            {submission.criteria.performance}
                          </div>
                          <div className="text-muted-foreground">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getCriteriaColor(submission.criteria.readability)}`}>
                            {submission.criteria.readability}
                          </div>
                          <div className="text-muted-foreground">Readability</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${getCriteriaColor(submission.criteria.creativity)}`}>
                            {submission.criteria.creativity}
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
