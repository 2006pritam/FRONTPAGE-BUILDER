"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-8 py-4 border-t border-border/40 text-center text-sm text-foreground bg-background/95 rounded-lg shadow-md"
    >
      <p>© All rights reserved by PRITAM KUMAR MODAK</p>
    </motion.footer>
  )
}
