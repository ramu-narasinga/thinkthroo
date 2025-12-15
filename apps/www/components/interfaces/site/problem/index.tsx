// import { AlertCircle, GitPullRequest, Zap } from "lucide-react"
// import { Card } from "@thinkthroo/ui/components/card"

// export function Problem() {
//   const problems = [
//     {
//       icon: AlertCircle,
//       title: "Inconsistent Patterns",
//       description:
//         "Easy to introduce your own patterns when working in a team, leading to scattered architecture across your codebase.",
//     },
//     {
//       icon: GitPullRequest,
//       title: "Missed in Code Review",
//       description:
//         "Direct API calls in page.tsx instead of service functions slip through PR reviews and get merged into production.",
//     },
//     {
//       icon: Zap,
//       title: "Cascading Failures",
//       description:
//         "When endpoints change, broken code fails silently. Without centralized service functions, fixes must be scattered everywhere.",
//     },
//   ]

//   return (
//     <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
//       {/* Background grid pattern */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
//       </div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-16 lg:mb-20">
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
//             <span className="text-sm font-semibold text-primary">The Problem</span>
//           </div>
//           <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-6 text-foreground">
//             Code Consistency Breaks Down
//           </h2>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
//             When teams grow, maintaining consistent code patterns becomes harder. One missed PR review can cascade into
//             production issues.
//           </p>
//         </div>

//         {/* Problem Cards Grid */}
//         <div className="grid md:grid-cols-3 gap-6 mb-16 lg:mb-24">
//           {problems.map((problem, index) => {
//             const IconComponent = problem.icon
//             return (
//               <Card
//                 key={index}
//                 className="group relative p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>

//                 <div className="relative z-10">
//                   <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300 mb-5">
//                     <IconComponent className="w-6 h-6 text-primary" />
//                   </div>

//                   <h3 className="text-xl font-semibold text-foreground mb-3">{problem.title}</h3>
//                   <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
//                 </div>
//               </Card>
//             )
//           })}
//         </div>

//         {/* Real-world scenario */}
//         <Card className="relative border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8 lg:p-12 overflow-hidden">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             {/* Left content */}
//             <div>
//               <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">Here's What Usually Happens</h3>

//               <div className="space-y-4">
//                 <div className="flex gap-4 items-start">
//                   <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
//                     1
//                   </div>
//                   <p className="text-foreground/80 pt-1">You join a new team with established codebase architecture</p>
//                 </div>

//                 <div className="flex gap-4 items-start">
//                   <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
//                     2
//                   </div>
//                   <p className="text-foreground/80 pt-1">You submit a PR with a direct API call in your page.tsx</p>
//                 </div>

//                 <div className="flex gap-4 items-start">
//                   <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
//                     3
//                   </div>
//                   <p className="text-foreground/80 pt-1">
//                     A service function already exists for this, but nobody catches it
//                   </p>
//                 </div>

//                 <div className="flex gap-4 items-start">
//                   <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/20 text-destructive font-semibold text-sm">
//                     4
//                   </div>
//                   <p className="text-foreground/80 pt-1">
//                     Code gets merged. Later, the endpoint changes and{" "}
//                     <span className="font-semibold text-destructive">everything breaks.</span>
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Right - Code example */}
//             <div className="relative">
//               <div className="bg-card border border-border/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
//                 <div className="text-muted-foreground/70 mb-4">{"// ❌ What gets merged"}</div>
//                 <div className="space-y-2 text-foreground/90">
//                   <div>
//                     <span className="text-primary">export default</span>
//                     <span> </span>
//                     <span className="text-cyan-400">async function</span>
//                     <span> Page() {"{"}</span>
//                   </div>
//                   <div className="ml-4">
//                     <span className="text-amber-400">const</span>
//                     <span> response = </span>
//                     <span className="text-purple-400">await</span>
//                     <span> </span>
//                     <span className="text-yellow-400">fetch</span>
//                     <span className="text-foreground/70">(</span>
//                     <span className="text-green-400">'/api/users'</span>
//                     <span className="text-foreground/70">)</span>
//                   </div>
//                   <div className="ml-4">
//                     <span className="text-muted-foreground/60">// 😅 service.ts already does this</span>
//                   </div>
//                   <div>{"}"}</div>
//                 </div>

//                 <div className="text-muted-foreground/70 mt-6 mb-4 pt-4 border-t border-border/30">
//                   {"// ✅ Should have used"}
//                 </div>
//                 <div className="space-y-2 text-green-400/90">
//                   <div>
//                     <span className="text-amber-400">import</span>
//                     <span> {"{ "}</span>
//                     <span>getUsers</span>
//                     <span> {"} "}</span>
//                     <span className="text-amber-400">from</span>
//                     <span className="text-green-400"> '@/services'</span>
//                   </div>
//                   <div>
//                     <span className="text-amber-400">const</span>
//                     <span> data = </span>
//                     <span className="text-purple-400">await</span>
//                     <span> </span>
//                     <span className="text-yellow-400">getUsers</span>
//                     <span>()</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </section>
//   )
// }

import { AlertCircle, GitPullRequest, Zap } from "lucide-react"
import { Card } from "@thinkthroo/ui/components/card"

export function Problem() {
  const problems = [
    {
      icon: AlertCircle,
      title: "Inconsistent Patterns Multiply",
      description:
        "Each developer introduces their own approach. What starts as one shortcut becomes 10+ scattered implementations across your codebase.",
    },
    {
      icon: GitPullRequest,
      title: "Human Review Can't Scale",
      description:
        "Senior developers spend 20% of PR review time catching architecture violations. Direct API calls, duplicate utilities, and bypassed patterns slip through anyway.",
    },
    {
      icon: Zap,
      title: "Technical Debt Compounds",
      description:
        "When that endpoint changes, you're hunting down 7 different implementations. What should be a one-line fix becomes 3+ hours of debugging.",
    },
  ]

  return (
    <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/5">
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">The Problem</span>
          </div>
          <h1 className="text-primary leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Inconsistent Code Patterns Are Costing You Weeks
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Inconsistent patterns slip through code review, creating technical debt that compounds silently. One violation today means hours of debugging tomorrow.
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 lg:mb-24">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon
            return (
              <Card
                key={index}
                className="group relative p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300 mb-5">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Real-world scenario */}
        <Card className="relative border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8 lg:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">The Pattern Violation Cycle</h3>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
                    1
                  </div>
                  <p className="text-foreground/80 pt-1">New developer joins team with established service layer architecture</p>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
                    2
                  </div>
                  <p className="text-foreground/80 pt-1">Submits PR with direct API call in page.tsx—bypassing existing userService.ts</p>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                    3
                  </div>
                  <p className="text-foreground/80 pt-1">
                    Reviewers miss it. Code looks fine. <span className="font-medium">Gets merged to production</span>
                  </p>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/20 text-destructive font-semibold text-sm">
                    4
                  </div>
                  <div className="text-foreground/80 pt-1">
                    <p className="mb-2">Three months later: API endpoint changes</p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• 7 scattered implementations to track down</li>
                      <li>• 3+ hours of debugging and fixes</li>
                      <li>• Production incident that could've been prevented</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-foreground/90">
                  <span className="font-semibold">The hidden cost?</span> Your senior developers become pattern police, spending hours in reviews catching violations that automated tools should catch instantly.
                </p>
              </div>
            </div>

            {/* Right - Code example */}
            <div className="relative">
              <div className="bg-card border border-border/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground/70 mb-4">{"// ❌ What gets merged"}</div>
                <div className="space-y-2 text-foreground/90">
                  <div>
                    <span className="text-primary">export default</span>
                    <span> </span>
                    <span className="text-cyan-400">async function</span>
                    <span> Page() {"{"}</span>
                  </div>
                  <div className="ml-4">
                    <span className="text-amber-400">const</span>
                    <span> response = </span>
                    <span className="text-purple-400">await</span>
                    <span> </span>
                    <span className="text-yellow-400">fetch</span>
                    <span className="text-foreground/70">(</span>
                    <span className="text-green-400">'/api/users'</span>
                    <span className="text-foreground/70">)</span>
                  </div>
                  <div className="ml-4">
                    <span className="text-muted-foreground/60">// userService.ts already exists 😅</span>
                  </div>
                  <div>{"}"}</div>
                </div>

                <div className="text-muted-foreground/70 mt-6 mb-4 pt-4 border-t border-border/30">
                  {"// ✅ Should have used"}
                </div>
                <div className="space-y-2 text-green-400/90">
                  <div>
                    <span className="text-amber-400">import</span>
                    <span> {"{ "}</span>
                    <span>getUsers</span>
                    <span> {"} "}</span>
                    <span className="text-amber-400">from</span>
                    <span className="text-green-400"> '@/services/user'</span>
                  </div>
                  <div>
                    <span className="text-amber-400">const</span>
                    <span> users = </span>
                    <span className="text-purple-400">await</span>
                    <span> </span>
                    <span className="text-yellow-400">getUsers</span>
                    <span>()</span>
                  </div>
                  <div className="ml-0 mt-3 text-muted-foreground/60 text-xs">
                    <span>Centralized, reusable, one place to update</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}