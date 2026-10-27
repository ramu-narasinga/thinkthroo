"use client";

import { useState } from "react";
import Cal from "@calcom/embed-react";
import { Button } from "@thinkthroo/ui/components/button";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { Textarea } from "@thinkthroo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select";
import { getAttribution } from "@/lib/attribution";
import { useUmami } from "@/hooks/use-umami";
import { setEnhancedConversionEmail, reportConversion } from "@/lib/gtag";
import { consultingConfig } from "@/lib/data/consulting/config";
import { CAL_NAMESPACE } from "./cal-init";
import { GridBackground } from "./grid-background";
import { SectionHeading } from "./section-heading";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Path portion of a cal.com URL, e.g. "team-thinkthroo-dxiovj/consultation". Undefined if bookingUrl isn't a cal.com link. */
function getCalLink(bookingUrl: string): string | undefined {
  const match = bookingUrl.match(/cal\.com\/(.+)$/);
  return match?.[1];
}

export function BookingSection({
  heading,
  subhead,
  instanceId,
  variant = "section",
}: {
  heading: string;
  subhead: string;
  /** Suffixes field/section ids so two BookingSection instances can render on one page. */
  instanceId: string;
  /** "section": standalone section with its own heading/padding. "compact": just the card, for dropping into a custom layout (e.g. beside the hero). */
  variant?: "section" | "compact";
}) {
  const fieldId = (name: string) => `${name}-${instanceId}`;
  const { track } = useUmami();
  const [formState, setFormState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState(""); // honeypot - real users never see or fill this

  const calLink = getCalLink(consultingConfig.bookingUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_RE.test(workEmail)) {
      setServerError("Enter a valid work email.");
      return;
    }

    setFormState("submitting");
    setServerError(null);

    const attribution = getAttribution();
    const submissionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const res = await fetch("/api/consulting-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          page_slug: "consulting",
          name,
          work_email: workEmail,
          project_type: projectType,
          budget_range: budgetRange,
          description,
          company, // honeypot
          ...attribution,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setFormState("error");
        return;
      }

      track("consulting_lead_submitted", { page_slug: "consulting" });

      if (!data.spam) {
        // Honeypot tripped - skip firing any conversion, but still show the same
        // next step so a bot isn't tipped off that it was caught.
        setEnhancedConversionEmail(workEmail);
        reportConversion("form_submit");
        track("consulting_form_submit_conversion");
      }

      setFormState("submitted");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  }

  // "compact" nests inside a single card the caller already draws (see the variant==="compact"
  // branch below), so the form/result block here stays unstyled to avoid a card-in-a-card.
  const formClass = variant === "compact" ? "space-y-5" : "space-y-5 rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-8 dark:shadow-black/30";
  const resultClass = variant === "compact" ? "" : "rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-4 dark:shadow-black/30 sm:p-6";

  const card = (
    <>
      {formState !== "submitted" ? (
        <form onSubmit={handleSubmit} className={formClass}>
          {serverError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
              {serverError}
            </div>
          )}

          {/* Honeypot - hidden from real users via CSS, bots that auto-fill forms will trip it */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor={fieldId("company")}>Company</label>
            <input
              id={fieldId("company")}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("name")}>Name</Label>
            <Input id={fieldId("name")} required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("work-email")}>Work email</Label>
            <Input
              id={fieldId("work-email")}
              type="email"
              required
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("project-type")}>Project type</Label>
            <Select value={projectType} onValueChange={setProjectType} required>
              <SelectTrigger id={fieldId("project-type")} className="w-full">
                <SelectValue placeholder="Select a project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workflow-automation">AI workflow automation</SelectItem>
                <SelectItem value="ai-chatbot-agent">AI chatbot / agent</SelectItem>
                <SelectItem value="ai-app">AI app development</SelectItem>
                <SelectItem value="rag-document-ai">RAG / document AI</SelectItem>
                <SelectItem value="white-label">White-label / offshore capacity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("budget-range")}>Budget range</Label>
            <Select value={budgetRange} onValueChange={setBudgetRange} required>
              <SelectTrigger id={fieldId("budget-range")} className="w-full">
                <SelectValue placeholder="Select a budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-2k">Under $2,000</SelectItem>
                <SelectItem value="2k-5k">$2,000 - $5,000</SelectItem>
                <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                <SelectItem value="15k-plus">$15,000+</SelectItem>
                <SelectItem value="not-sure">Not sure yet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("description")}>What do you need built?</Label>
            <Textarea
              id={fieldId("description")}
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={formState === "submitting"}>
            {formState === "submitting" ? "Sending…" : "Continue to pick a time"}
          </Button>
        </form>
      ) : (
        <div className={resultClass}>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Got your details{name ? `, ${name.split(" ")[0]}` : ""}. Pick a time that works:
          </p>
          {calLink ? (
            // Same sizing as the /contact page embed. Cal sizes its iframe to the picker's content,
            // so a fixed height or an overflow-hidden parent clips the time slots / confirm step
            // with nothing left to scroll.
            <Cal
              namespace={CAL_NAMESPACE}
              calLink={calLink}
              style={{ width: "100%", height: "100%", overflow: "scroll" }}
              config={{
                layout: "month_view",
                name,
                email: workEmail,
                notes: description,
              }}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              <a
                href={consultingConfig.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Book a time here →
              </a>
            </p>
          )}
        </div>
      )}
    </>
  );

  if (variant === "compact") {
    return (
      <div
        id={`book-${instanceId}`}
        className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-6 dark:shadow-black/30 lg:p-8"
      >
        <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">{subhead}</p>
        {card}
      </div>
    );
  }

  return (
    <section id={`book-${instanceId}`} className="relative w-full">
      <GridBackground />

      <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading badge="Get started" title={heading} description={subhead} />
        {card}
      </div>
    </section>
  );
}
