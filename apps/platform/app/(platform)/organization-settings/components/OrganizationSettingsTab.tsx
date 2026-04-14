"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@thinkthroo/ui/components/card"
import { Label } from "@thinkthroo/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@thinkthroo/ui/components/select"
import { Input } from "@thinkthroo/ui/components/input"
import { Button } from "@thinkthroo/ui/components/button"
import { Switch } from "@thinkthroo/ui/components/switch"
import { Badge } from "@thinkthroo/ui/components/badge"
import { HelpCircle, X } from "lucide-react"
import { organizationSettingsClientService } from "@/service/organizationSettings"
import { useOrganizationStore } from "@/store/organization"
import { organizationSelectors } from "@/store/organization/selectors"

export function OrganizationSettingsTab() {
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg)
  const isPro = activeOrg?.currentPlanName === "pro"

  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const [enableReviews, setEnableReviews] = useState(true)
  const [enablePrSummary, setEnablePrSummary] = useState(true)
  const [enableInlineReviewComments, setEnableInlineReviewComments] = useState(true)
  const [enableArchitectureReview, setEnableArchitectureReview] = useState(true)
  const [language, setLanguage] = useState("")
  const [tone, setTone] = useState("")
  const [pathFilters, setPathFilters] = useState<string[]>([])
  const [pathFilterInput, setPathFilterInput] = useState("")

  useEffect(() => {
    if (!activeOrg?.id) return
    const load = async () => {
      try {
        const data = await organizationSettingsClientService.getByOrganization(activeOrg.id)
        if (data) {
          setEnableReviews(data.enableReviews)
          setEnablePrSummary(data.enablePrSummary)
          setEnableInlineReviewComments(data.enableInlineReviewComments)
          setEnableArchitectureReview(data.enableArchitectureReview)
          setLanguage(data.reviewLanguage ?? "")
          setTone(data.toneInstructions ?? "")
          setPathFilters(data.pathFilters ?? [])
        }
      } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [activeOrg?.id])

  const addPathFilter = () => {
    const value = pathFilterInput.trim()
    if (value && !pathFilters.includes(value)) {
      setPathFilters((prev) => [...prev, value])
    }
    setPathFilterInput("")
  }

  const removePathFilter = (filter: string) => {
    setPathFilters((prev) => prev.filter((f) => f !== filter))
  }

  const handleSave = async () => {
    if (!activeOrg?.id) return
    setIsSaving(true)
    try {
      await organizationSettingsClientService.upsert(activeOrg.id, {
          enableReviews,
          enablePrSummary,
          enableInlineReviewComments: isPro ? enableInlineReviewComments : false,
          enableArchitectureReview: isPro ? enableArchitectureReview : false,
          reviewLanguage: language || null,
          toneInstructions: tone || null,
          pathFilters,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>
          Defaults applied to all repositories unless overridden at the repository level.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Enable Reviews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Enable Reviews</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Allow ThinkThroo to analyse pull requests and post comments across all repositories.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={enableReviews}
              onCheckedChange={setEnableReviews}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>

        <hr />

        {/* Enable PR Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Enable PR Summary</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a high-level summary of changes in the PR description.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={enablePrSummary}
              onCheckedChange={setEnablePrSummary}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>

        <hr />

        {/* Enable Inline Review Comments — Pro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Enable Inline Review Comments</Label>
              {!isPro && <Badge variant="outline" className="text-xs">Pro</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Post line-by-line AI review comments directly on pull request diffs.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={isPro ? enableInlineReviewComments : false}
              onCheckedChange={setEnableInlineReviewComments}
              disabled={!isPro}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>

        <hr />

        {/* Enable Architecture Review — Pro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Enable Architecture Review</Label>
              {!isPro && <Badge variant="outline" className="text-xs">Pro</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Check each changed file against your uploaded architecture rules.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={isPro ? enableArchitectureReview : false}
              onCheckedChange={setEnableArchitectureReview}
              disabled={!isPro}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>

        <hr />

        {/* Review Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Review Language</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Natural language in which ThinkThroo writes reviews.
            </p>
          </div>
          <div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-80 bg-gray-50">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
            <p className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
              <HelpCircle className="w-4 h-4" />
              Default language is English
            </p>
          </div>
        </div>

        <hr />

        {/* Tone Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Tone Instructions</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Set the tone of reviews. Example: &quot;Use a friendly but concise tone, like a helpful senior engineer.&quot;
            </p>
          </div>
          <div>
            <Input
              placeholder="Friendly, concise, professional..."
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-80"
            />
          </div>
        </div>

        <hr />

        {/* Path Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Path Filters</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Glob patterns for files to exclude from review (e.g. <code className="text-xs bg-muted px-1 py-0.5 rounded">dist/**</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">*.lock</code>).
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. dist/**, *.lock"
                value={pathFilterInput}
                onChange={(e) => setPathFilterInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPathFilter() } }}
                className="w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addPathFilter}
                disabled={!pathFilterInput.trim()}
              >
                + Add
              </Button>
            </div>
            {pathFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pathFilters.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md"
                  >
                    {f}
                    <button onClick={() => removePathFilter(f)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={isSaving || !isLoaded || !activeOrg?.id}
        >
          {isSaving ? "Saving..." : "Apply changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
