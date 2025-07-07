"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Trophy, Send } from "lucide-react"

export default function ChallengeLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-9 w-80 mt-4" />
            <Skeleton className="h-6 w-96 mt-2" />
          </CardHeader>
        </Card>

        {/* Tabs Skeleton */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Challenge
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <Skeleton className="h-4 w-20 inline-block" />
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit Solution
            </TabsTrigger>
          </TabsList>

          {/* Challenge Description Skeleton */}
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-8 space-y-8">
                {/* Problem Description */}
                <div>
                  <Skeleton className="h-7 w-48 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <Skeleton className="h-7 w-24 mb-4" />
                  <div className="bg-muted p-6 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <Skeleton className="h-7 w-32 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div>
                  <Skeleton className="h-7 w-44 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="text-center p-6 bg-muted rounded-lg">
                        <Skeleton className="h-8 w-8 mx-auto mb-3" />
                        <Skeleton className="h-5 w-24 mx-auto mb-2" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Skeleton */}
          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
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
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-6 w-8" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-48 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-4 w-6" />
                            <Skeleton className="h-6 w-6" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-6 w-8 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 text-center">
                  <Skeleton className="h-10 w-40 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Form Skeleton */}
          <TabsContent value="submit" className="mt-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-96" />
              </CardHeader>
              <CardContent>
                <div className="space-y-8 max-w-2xl">
                  {/* GitHub URL Field */}
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-80" />
                  </div>

                  {/* Description Field */}
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-96" />
                  </div>

                  {/* OSS References */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64 mt-1" />
                      </div>
                      <Skeleton className="h-9 w-32" />
                    </div>

                    {/* Sample OSS Reference Fields */}
                    <div className="flex gap-3 items-end p-4 border rounded-lg">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-9 w-9" />
                    </div>

                    <div className="flex gap-3 items-end p-4 border rounded-lg">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
