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
  { icon: GitPullRequest, text: "Architecture validation for public repos" },
  { icon: BookOpen, text: "Up to 3 architecture rule files" },
  { icon: Database, text: "3 Pinecone namespace docs (RAG context)" },
  { icon: Zap, text: "10 free credits on signup" },
  { icon: Shield, text: "Community support" },
]

export const proFeatures: PricingFeature[] = [
  { icon: GitPullRequest, text: "Architecture validation for private repos" },
  { icon: BookOpen, text: "Up to 20 architecture rule files" },
  { icon: Database, text: "20 Pinecone namespace docs (RAG context)" },
  { icon: Zap, text: "500 credits / month (renews with billing)" },
  { icon: Shield, text: "PR comment feedback with line-level context" },
  { icon: Check, text: "Custom architecture rules via markdown" },
  { icon: Check, text: "RAG-powered review — scoped to your rules only" },
  { icon: Check, text: "Priority support" },
]

export const creditBundles: CreditBundle[] = [
  { label: "50 credits", dollars: 5, description: "~5 small PRs" },
  { label: "100 credits", dollars: 10, description: "~10 small PRs" },
  { label: "250 credits", dollars: 25, description: "~25 small PRs" },
  { label: "500 credits", dollars: 50, description: "Best value" },
]

export const pricing = {
  monthly: { amount: "$49", label: "/ month" },
  yearly: { amount: "$42", label: "/ month", note: "$504 billed yearly" },
}
