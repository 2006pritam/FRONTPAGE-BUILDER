"use client"

import type { ReactNode } from "react"

interface BackgroundProps {
  children: ReactNode
  isDark: boolean
}

export function Background({ children, isDark }: BackgroundProps) {
  return (
    <div className="min-h-screen relative">
      {/* Background image without blur effect - adjusted opacity for better visibility */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jaredd-craig-HH4WBGNyltc-unsplash.jpg-iKX4u3kL7yRaHWUED8sA8GtQwlhqcp.jpeg")',
          opacity: isDark ? 0.5 : 0.3, // Reduced opacity in light mode for better text contrast
        }}
      />

      {/* Overlay to enhance readability - adjusted for better text visibility */}
      <div className={`fixed inset-0 z-0 ${isDark ? "bg-black/80" : "bg-white/85"}`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
    </div>
  )
}
