import type { ComponentType } from "react"
import {
  Check,
  Zap,
  BookOpen,
  GitPullRequest,
  Shield,
  Database,
} from "lucide-react"

export type PricingFeature = {
  icon: ComponentType<{ className?: string }>
  text: string
}

export type CreditBundle = {
  label: string
  dollars: number
  description: string
}

export const freeFeatures: PricingFeature[] = [
  { icon: Zap, text: "50 free credits on signup — no card required" },
  { icon: GitPullRequest, text: "Automated PR summaries (up to 5 / month)" },
  { icon: BookOpen, text: "Define up to 3 architecture rules" },
  { icon: Database, text: "Public repositories only" },
  { icon: Shield, text: "Community support" },
]

export const proFeatures: PricingFeature[] = [
  { icon: Zap, text: "500 credits / month — renews automatically" },
  { icon: GitPullRequest, text: "Unlimited automated PR summaries" },
  { icon: Database, text: "RAG-powered violation comments on every PR" },
  { icon: BookOpen, text: "Unlimited architecture rules via markdown" },
  { icon: Check, text: "Private repository support" },
  { icon: Check, text: "Analytics dashboard" },
  { icon: Check, text: "Slack digest & team reports" },
  { icon: Check, text: "Top-up credits anytime at $0.10 / credit" },
  { icon: Shield, text: "Priority support via email" },
]

export const creditBundles: CreditBundle[] = [
  { label: "50 credits", dollars: 5, description: "~5 PR reviews" },
  { label: "100 credits", dollars: 9, description: "~10 PR reviews" },
  { label: "250 credits", dollars: 20, description: "~25 PR reviews" },
  { label: "500 credits", dollars: 35, description: "Best value" },
]

export const pricing = {
  monthly: { amount: "$49", label: "/ month" },
  yearly: { amount: "$42", label: "/ month", note: "$504 billed yearly" },
}
