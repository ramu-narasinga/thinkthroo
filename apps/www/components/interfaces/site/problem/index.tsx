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
      title: "Your backlog never clears",
      description:
        "Every sprint ends with carryover. There's always more to build than capacity to build it. Features get deprioritized, not because they don't matter, but because the team is stretched.",
    },
    {
      icon: GitPullRequest,
      title: "Hiring doesn't scale",
      description:
        "Recruiting takes months. Onboarding takes more. By the time the new hire is productive, the roadmap has already shifted. You needed them yesterday.",
    },
    {
      icon: Zap,
      title: "Senior time is wasted",
      description:
        "Your best engineers spend hours on boilerplate, repetitive tests, and routine fixes that block the team but don't need their expertise.",
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
            <span className="text-sm font-semibold text-foreground">The Problem</span>
          </div>
          <h1 className="text-foreground leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Your roadmap is bigger than your team.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Implementation capacity is the bottleneck. The backlog grows faster than you can hire. And your best engineers are stuck on work that shouldn&apos;t need them.
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

          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">A week without agents</h3>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
                1
              </div>
              <p className="text-foreground/80 pt-1">Sprint planning adds 8 tickets. Team capacity is 5. Three tickets are pushed to next sprint before work even starts.</p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
                2
              </div>
              <p className="text-foreground/80 pt-1">Senior engineers context-switch between writing code and reviewing PRs. Neither gets the focus it needs.</p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                3
              </div>
              <p className="text-foreground/80 pt-1">
                2 more tickets carry over. Deadline slips. <span className="font-medium">Stakeholders ask for a status update.</span>
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/20 text-destructive font-semibold text-sm">
                4
              </div>
              <p className="text-foreground/80 pt-1">Team decides to hire. Recruiting takes 3 months. Onboarding takes 2 more. The backlog is now twice as long.</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-foreground/90">
              <span className="font-semibold">The real bottleneck isn&apos;t talent.</span> It&apos;s capacity. AI agents don&apos;t replace your engineers — they multiply what each engineer can ship.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}