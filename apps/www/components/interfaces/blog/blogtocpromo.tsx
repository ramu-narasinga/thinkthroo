"use client"

import { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { PromoCard } from "./promo-card"

export function BlogTocPromo() {
  useEffect(() => {
    const toc = document.getElementById("nd-toc")
    if (!toc) return

    if (toc.querySelector("[data-blog-promo]")) return

    const wrapper = document.createElement("div")
    wrapper.setAttribute("data-blog-promo", "true")
    wrapper.className = "mt-4"

    toc.insertBefore(wrapper, toc.firstChild)

    createRoot(wrapper).render(<div className="mb-4"><PromoCard /></div>)
  }, [])

  return null
}
