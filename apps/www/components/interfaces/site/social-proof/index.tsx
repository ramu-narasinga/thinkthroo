"use client"

import { Star } from "lucide-react"

export function SocialProof() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Senior Engineer",
      company: "TechCorp",
      rating: 5,
      feedback:
        "CodeArc transformed how our team maintains consistency. The AI-powered checks caught architectural violations that would have taken hours to identify manually. Absolutely game-changing.",
      avatar: "SC",
    },
    {
      id: 2,
      name: "Marcus Williams",
      role: "Tech Lead",
      company: "Innovate Labs",
      rating: 5,
      feedback:
        "Finally, a tool that actually understands our codebase structure. The feedback is actionable and our PR reviews are now 40% faster. Can't imagine working without it.",
      avatar: "MW",
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "Engineering Manager",
      company: "Scale Systems",
      rating: 5,
      feedback:
        "We've been able to onboard new developers 50% faster thanks to CodeArc. It enforces our architecture patterns automatically, making our codebase more maintainable.",
      avatar: "PP",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      role: "Full Stack Developer",
      company: "Cloud Ventures",
      rating: 5,
      feedback:
        "The architectural insights are incredible. We discovered patterns we didn't even know we had. Now we're enforcing them consistently across all our services.",
      avatar: "AR",
    },
    {
      id: 5,
      name: "Emma Thompson",
      role: "DevOps Engineer",
      company: "Deploy Hub",
      rating: 5,
      feedback:
        "CodeArc's PR checks have become essential to our workflow. It's like having an expert architecture reviewer available 24/7. Highly recommend to any growing team.",
      avatar: "ET",
    },
    {
      id: 6,
      name: "James Park",
      role: "CTO",
      company: "BuildCo",
      rating: 5,
      feedback:
        "Best investment we've made for our engineering team. The ROI is clear—fewer bugs, faster development cycles, and consistent code quality across the board.",
      avatar: "JP",
    },
  ]

  return (
    <section className="relative w-full py-20 lg:py-32 bg-gradient-to-b from-secondary/5 to-background">
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">Loved by Engineers</span>
          </div>
          <h2 className="text-primary leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
            Trusted by Engineering Teams Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            See what developers and teams love about CodeArc
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group p-6 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70 transition-all duration-300 flex flex-col"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Feedback */}
              <p className="text-muted-foreground leading-relaxed mb-6 flex-1">{testimonial.feedback}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary/20 transition-colors duration-300">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} @ {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 pt-12 border-t border-border/30">
          <div className="text-center">
            <p className="text-3xl font-semibold text-primary mb-2">500+</p>
            <p className="text-muted-foreground">Engineering Teams</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-semibold text-primary mb-2">4.9/5</p>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-semibold text-primary mb-2">98%</p>
            <p className="text-muted-foreground">Retention Rate</p>
          </div>
        </div>
      </div>
    </section>
  )
}
