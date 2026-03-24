'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface StatCounterProps {
  stat: string
  label: string
  delay?: number
  isNumeric?: boolean
}

export function StatCounter({ stat, label, delay = 0, isNumeric = false }: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(isNumeric ? '0' : stat)

  useEffect(() => {
    if (isNumeric && stat.endsWith('+')) {
      const numericValue = parseInt(stat.replace(/\D/g, ''))
      const startValue = 0
      const endValue = numericValue
      const duration = 2000
      const steps = 60

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const current = Math.floor(startValue + (endValue - startValue) * progress)
        setDisplayValue(current + '+')

        if (currentStep >= steps) {
          clearInterval(interval)
          setDisplayValue(stat)
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [stat, isNumeric])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 bg-card rounded-lg border border-border text-center hover:shadow-lg transition-shadow">
        <motion.div
          className="text-3xl font-bold text-primary mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        >
          {displayValue}
        </motion.div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </Card>
    </motion.div>
  )
}
