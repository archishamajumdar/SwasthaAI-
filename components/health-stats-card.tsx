'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface HealthStatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger'
  delay?: number
}

const colorClasses = {
  primary: 'from-primary/5 to-primary/10 border-primary/20',
  accent: 'from-accent/5 to-accent/10 border-accent/20',
  success: 'from-green-500/5 to-green-500/10 border-green-500/20',
  warning: 'from-yellow-500/5 to-yellow-500/10 border-yellow-500/20',
  danger: 'from-red-500/5 to-red-500/10 border-red-500/20',
}

const iconColorClasses = {
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  danger: 'text-red-500',
}

export function HealthStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  delay = 0,
}: HealthStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`p-6 border-2 bg-gradient-to-br ${colorClasses[color]}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-background`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span
              className={
                trend.direction === 'up'
                  ? 'text-red-500'
                  : trend.direction === 'down'
                    ? 'text-green-500'
                    : 'text-gray-500'
              }
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
              {trend.percentage}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
