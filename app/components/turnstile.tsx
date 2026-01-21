"use client"

import { useEffect, useRef, useState } from "react"
import { CustomLoader } from "./custom-loader"

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
}

export function Turnstile({ siteKey, onVerify, onError, onExpire, className = "" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // Check if the script is already loaded
    if (window.turnstile) {
      setIsScriptLoaded(true)
      setIsLoading(false)
      return
    }

    // Load the Turnstile script
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsScriptLoaded(true)
      setIsLoading(false)
    }

    script.onerror = () => {
      console.error("Failed to load Turnstile script")
      setIsLoading(false)
      if (onError) onError()
    }

    document.head.appendChild(script)

    return () => {
      // Clean up script if component unmounts before script loads
      if (!script.onload) {
        document.head.removeChild(script)
      }
    }
  }, [onError])

  useEffect(() => {
    // Render the Turnstile widget once the script is loaded
    if (isScriptLoaded && containerRef.current && window.turnstile) {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token)
        },
        "error-callback": () => {
          if (onError) onError()
        },
        "expired-callback": () => {
          if (onExpire) onExpire()
        },
        theme: "auto",
      })

      return () => {
        // Clean up the widget when component unmounts
        if (window.turnstile) {
          window.turnstile.remove(widgetId)
        }
      }
    }
  }, [isScriptLoaded, siteKey, onVerify, onError, onExpire])

  return (
    <div className={`turnstile-container ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-md">
          <CustomLoader type="circle" className="mr-2" />
          <span className="text-sm text-muted-foreground">Loading verification...</span>
        </div>
      )}
      <div ref={containerRef} className={isLoading ? "hidden" : ""}></div>
    </div>
  )
}

// Add TypeScript declaration for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
        },
      ) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
    }
  }
}
