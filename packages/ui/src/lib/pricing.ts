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
  { icon: Zap, text: "25 credits on signup — no card required" },
  { icon: GitPullRequest, text: "PR summaries on every pull request (credits required)" },
  { icon: Database, text: "Up to 3 repositories (public & private)" },
  { icon: BookOpen, text: "RAG-powered violation comments (credits required)" },
  { icon: Shield, text: "Community support" },
]

export const proFeatures: PricingFeature[] = [
  { icon: Zap, text: "180 credits / month — renews automatically" },
  { icon: GitPullRequest, text: "Unlimited automated PR summaries" },
  { icon: Database, text: "Unlimited repositories (public & private)" },
  { icon: BookOpen, text: "Architecture rules indexed per repo" },
  { icon: Check, text: "RAG-powered violation comments on every PR" },
  { icon: Check, text: "Analytics dashboard" },
  { icon: Check, text: "Slack digest & team reports" },
  { icon: Check, text: "Top-up credits anytime at $0.10 / credit" },
  { icon: Shield, text: "Priority support via email" },
]

export const creditBundles: CreditBundle[] = [
  { label: "50 credits", dollars: 5, description: "~5 PR reviews" },
  { label: "100 credits", dollars: 10, description: "~10 PR reviews" },
  { label: "250 credits", dollars: 20, description: "~25 PR reviews" },
  { label: "500 credits", dollars: 35, description: "Best value" },
]

export const pricing = {
  monthly: { amount: "$15", label: "/ month" },
  yearly: { amount: "$15", label: "/ month", note: "$180 billed yearly" },
}
