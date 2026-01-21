"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import "./neon-logo.css"

interface NeonLogoButtonProps {
  onClick?: () => void
  className?: string
}

export function NeonLogoButton({ onClick, className = "" }: NeonLogoButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Random flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 150)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className={`neon-logo-container ${className} ${isHovered ? "hovered" : ""} ${isAnimating ? "flicker" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="neon-logo-inner">
        <Sparkles className="neon-icon" />
        <span className="neon-text">Supernoxi</span>
      </div>
    </motion.div>
  )
}
