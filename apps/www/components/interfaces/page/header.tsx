import type React from "react"
import { cn } from "@/lib/utils"

function PageHeader({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("relative w-full bg-gradient-to-b from-background to-secondary/5", className)} {...props}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_0%,transparent_80%)]"></div>
      </div>

      <div className="relative">
        <div className="container flex flex-col items-center gap-2 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
          {children}
        </div>
      </div>
    </section>
  )
}

function PageHeaderHeading({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-primary leading-tighter max-w-2xl text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter",
        className,
      )}
      {...props}
    />
  )
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-foreground max-w-3xl text-base text-balance sm:text-lg", className)} {...props} />
}

function PageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full items-center justify-center gap-2 pt-2 **:data-[slot=button]:shadow-none", className)}
      {...props}
    />
  )
}

export { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading }
