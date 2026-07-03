import type { ComponentType } from "react"
import {
  Check,
  Zap,
  BookOpen,
  GitPullRequest,
  Shield,
} from "lucide-react"

export type PricingFeature = {
  icon: ComponentType<{ className?: string }>
  text: string
}

export const freeFeatures: PricingFeature[] = [
  { icon: Zap, text: "7-day free trial — no credit card required" },
  { icon: Check, text: "Connect your local machine as a runtime" },
  { icon: Check, text: "Create agents with your own Claude API key" },
  { icon: GitPullRequest, text: "GitHub issue assignment & PR creation" },
  { icon: BookOpen, text: "Skills library" },
  { icon: Shield, text: "Community support" },
]

export const proFeatures: PricingFeature[] = [
  { icon: Zap, text: "Everything in free trial" },
  { icon: Check, text: "Year-long updates & bug fixes" },
  { icon: Check, text: "Multi-agent squads" },
  { icon: Check, text: "Analytics dashboard" },
  { icon: Check, text: "Slack integration" },
  { icon: Shield, text: "Priority email support" },
]

export const pricing = {
  free: { amount: "Free", label: "7-day trial" },
  pro: { amount: "$49", label: "/ year" },
}
