"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@thinkthroo/ui/components/card";
import { TemplateDialog } from "./patterns-library-modal";

export default function TemplatesTab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 items-start">
      <Card className="w-full max-w-md cursor-pointer hover:border-black transition-colors">
        <CardHeader>
          <CardTitle>Start from Scratch</CardTitle>
        </CardHeader>
        <CardContent>
          This is the first template card.
        </CardContent>
      </Card>

      <Card
        className="w-full max-w-md cursor-pointer hover:border-black transition-colors"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <CardTitle>Start with the Templates</CardTitle>
        </CardHeader>
        <CardContent>
          This is the second template card.
        </CardContent>
      </Card>

      <TemplateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
