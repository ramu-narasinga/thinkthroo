"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@thinkthroo/ui/components/card";

export default function TemplatesTab() {
  return (
    <div className="flex flex-col gap-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Start from Scratch</CardTitle>
          </CardHeader>
          <CardContent>
            This is the first template card.
          </CardContent>
        </Card>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Start with the Templates</CardTitle>
          </CardHeader>
          <CardContent>
            This is the second template card.
          </CardContent>
        </Card>
    </div>
  );
}
