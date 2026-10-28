"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog";
import { CheckCircle2 } from "lucide-react";
import { getAttribution } from "@/lib/attribution";
import { useUmami } from "@/hooks/use-umami";
import { setEnhancedConversionEmail, reportConversion } from "@/lib/gtag";
import { consultingConfig } from "@/lib/data/consulting/config";
import { CAL_NAMESPACE, CALL_BOOKED_EVENT } from "./cal-init";
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
  const [formState, setFormState] = useState<"idle" | "submitting" | "submitted" | "booked" | "error">("idle");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState(""); // honeypot - real users never see or fill this

  const calLink = getCalLink(consultingConfig.bookingUrl);

  // CalInit (mounted once in the layout) announces a confirmed booking on window. Swap the card
  // for the confirmation in place rather than redirecting to a separate page.
  useEffect(() => {
    const onBooked = () => {
      setFormState("booked");
      setPickerOpen(false);
    };
    window.addEventListener(CALL_BOOKED_EVENT, onBooked);
    return () => window.removeEventListener(CALL_BOOKED_EVENT, onBooked);
  }, []);

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
      setPickerOpen(true);
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
      {formState !== "submitted" && formState !== "booked" ? (
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
          {formState === "booked" ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
              <p className="text-xl font-semibold text-foreground">Call booked.</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll get a calendar invite with a video link. See you then.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
              <div>
                <p className="font-semibold text-foreground">
                  Got your details{name ? `, ${name.split(" ")[0]}` : ""}.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick a time to lock in your free 30-minute call.
                </p>
              </div>
              {calLink ? (
                <Button type="button" onClick={() => setPickerOpen(true)}>
                  Pick a time
                </Button>
              ) : (
                <a
                  href={consultingConfig.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Book a time here →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {calLink && formState === "submitted" && (
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          {/* The body scrolls and the header stays put. Cal sizes its iframe to the picker's
              content, so the embed gets no fixed height - a fixed height clips the time slots
              and the confirm step with nothing left to scroll. */}
          <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
            <DialogHeader className="shrink-0 px-6 pt-6 pr-12 pb-4">
              <DialogTitle>Pick a time for your call</DialogTitle>
              <DialogDescription>
                Free 30-minute call. Your details are already filled in.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 sm:px-4">
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  if (variant === "compact") {
    return (
      <div
        id={`book-${instanceId}`}
        className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-6 dark:shadow-black/30 lg:p-8"
      >
        {formState !== "submitted" && formState !== "booked" && (
          <>
            <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">{subhead}</p>
          </>
        )}
        {card}
      </div>
    );
  }

  return (
    <section id={`book-${instanceId}`} className="relative w-full">
      <GridBackground />

      <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {formState !== "booked" && (
          <SectionHeading badge="Get started" title={heading} description={subhead} />
        )}
        {card}
      </div>
    </section>
  );
}
