export function UsedByTeams() {
  const companies = [
    {
      name: "TechCorp",
      logo: "TC",
      description: "Enterprise software solutions",
    },
    {
      name: "DataFlow",
      logo: "DF",
      description: "Data analytics platform",
    },
    {
      name: "CloudSync",
      logo: "CS",
      description: "Cloud infrastructure",
    },
    {
      name: "DevTools",
      logo: "DT",
      description: "Developer platform",
    },
    {
      name: "AutoScale",
      logo: "AS",
      description: "Scaling solutions",
    },
    {
      name: "SecureNet",
      logo: "SN",
      description: "Security infrastructure",
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
            <span className="text-sm font-semibold text-primary">Trusted by Teams</span>
          </div>
          <h1 className="text-primary leading-tighter max-w-2xl mb-6 mx-auto text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
            Used by Teams Worldwide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Join thousands of teams who trust us to maintain their code architecture
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {companies.map((company) => (
            <div
              key={company.name}
              className="group relative p-6 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-sm font-semibold text-primary">{company.logo}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {company.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{company.description}</p>
                </div>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/0 group-hover:w-full transition-all duration-300 rounded-b-lg"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-muted-foreground mb-4">And many more teams building amazing products</p>
        </div>
      </div>
    </section>
  )
}
