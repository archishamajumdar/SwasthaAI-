'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  delay?: number
  className?: string
  hoverScale?: boolean
}

export function GlassCard({
  children,
  delay = 0,
  className = '',
  hoverScale = true,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverScale ? { scale: 1.02 } : undefined}
      className={`backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg ${className}`}
    >
      {children}
    </motion.div>
  )
}
