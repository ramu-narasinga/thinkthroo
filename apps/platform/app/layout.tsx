import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Toaster } from "@thinkthroo/ui/components/sonner"
import GlobalProvider from "@/layout/GlobalProvider";

import "@/styles/globals.css";
import "@/styles/prosemirror.css";

export const metadata: Metadata = {
  title: "CodeArc | Think Throo",
  description: "Enforce codebase architecture using AI.",
  icons: {
    icon: "/favicon.ico",
  },
}

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <GlobalProvider>
          {children}
        </GlobalProvider>
        <Toaster />
      </body>
    </html>
  )
}

export default RootLayout;
