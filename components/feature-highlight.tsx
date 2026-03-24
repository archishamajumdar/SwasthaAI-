'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface FeatureHighlightProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
  iconColor?: string
}

export function FeatureHighlight({
  icon: Icon,
  title,
  description,
  delay = 0,
  iconColor = 'text-primary',
}: FeatureHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 bg-card hover:shadow-xl transition-all duration-300 border border-border group overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
            >
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </motion.div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Animated background gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-primary to-accent blur-xl"
        />
      </Card>
    </motion.div>
  )
}
