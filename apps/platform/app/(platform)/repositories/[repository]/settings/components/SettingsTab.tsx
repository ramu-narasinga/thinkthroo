"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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
import { repositorySettingsClientService } from "@/service/repositorySettings"
import { useOrganizationStore } from "@/store/organization"
import { organizationSelectors } from "@/store/organization/selectors"

export function SettingsTab() {
  const params = useParams()
  const repoName = decodeURIComponent(params.repository as string)

  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg)
  const isPro = activeOrg?.currentPlanName === "pro"

  const repositoryFullName = activeOrg?.login ? `${activeOrg.login}/${repoName}` : repoName

  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Settings state
  const [useOrgSettings, setUseOrgSettings] = useState(true)
  const [enableReviews, setEnableReviews] = useState(true)
  const [enablePrSummary, setEnablePrSummary] = useState(true)
  const [enableInlineReviewComments, setEnableInlineReviewComments] = useState(true)
  const [enableArchitectureReview, setEnableArchitectureReview] = useState(true)
  const [language, setLanguage] = useState("")
  const [tone, setTone] = useState("")
  const [pathFilters, setPathFilters] = useState<string[]>([])
  const [pathFilterInput, setPathFilterInput] = useState("")

  // IDs needed for upsert
  const [repositoryId, setRepositoryId] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await repositorySettingsClientService.getByFullName(repositoryFullName)
        if (data) {
          setRepositoryId(data.repositoryId)
          setOrganizationId(data.organizationId)
          setUseOrgSettings(data.useOrganizationSettings)
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
  }, [repositoryFullName])

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
    if (!repositoryId || !organizationId) return
    setIsSaving(true)
    try {
      await repositorySettingsClientService.upsert(repositoryId, organizationId, {
          useOrganizationSettings: useOrgSettings,
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

  const disabled = useOrgSettings

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Configure how ThinkThroo generates and writes reviews for this repository.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Use Organization Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Use Organization Settings</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Organization settings will be applied. Disable to configure this repository independently.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={useOrgSettings}
              onCheckedChange={setUseOrgSettings}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>

        <hr />

        {/* Enable Reviews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Enable Reviews</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Allow ThinkThroo to analyse pull requests and post comments on this repository.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={enableReviews}
              onCheckedChange={setEnableReviews}
              disabled={disabled}
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
              disabled={disabled}
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
              Post line-by-line AI review comments directly on the pull request diff.
            </p>
          </div>
          <div className="flex items-center">
            <Switch
              checked={isPro ? enableInlineReviewComments : false}
              onCheckedChange={setEnableInlineReviewComments}
              disabled={disabled || !isPro}
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
              disabled={disabled || !isPro}
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
            <Select value={language} onValueChange={setLanguage} disabled={disabled}>
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
              disabled={disabled}
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
                disabled={disabled}
                className="w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addPathFilter}
                disabled={disabled || !pathFilterInput.trim()}
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
                    {!disabled && (
                      <button onClick={() => removePathFilter(f)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    )}
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
          disabled={isSaving || !isLoaded || !repositoryId}
        >
          {isSaving ? "Saving..." : "Apply changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

