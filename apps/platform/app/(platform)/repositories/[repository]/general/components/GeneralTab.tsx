"use client"

import { useState } from "react"
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
import { HelpCircle } from "lucide-react"

export function GeneralTab() {
  const [language, setLanguage] = useState("")
  const [tone, setTone] = useState("")
  const [useOrgSettings, setUseOrgSettings] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure how CodeArc generates and writes reviews.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Organization Settings Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Use Organization Settings</Label>
            <p className="text-md text-muted-foreground mt-1">
              Organization settings will be applied. If disabled, the
              repository-specific settings configured below will be used.
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

        {/* Review Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <Label className="text-base font-semibold">Review Language</Label>
            <p className="text-md text-muted-foreground mt-1">
              Natural language in which you want CodeArc to write the review.
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
            <p className="text-md text-muted-foreground mt-1">
              Set the tone of reviews and chat. Example: &quot;Use a friendly but concise tone, 
      like a helpful senior engineer guiding a junior developer.&quot;
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
      </CardContent>

      <CardFooter>
        <Button onClick={() => console.log({ language, tone })}>
          Apply changes
        </Button>
      </CardFooter>
    </Card>
  )
}
