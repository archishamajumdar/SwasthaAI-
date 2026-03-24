'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Stethoscope, 
  Brain, 
  MapPin, 
  FileText, 
  Lightbulb, 
  Pill,
  Menu,
  X,
  TrendingUp,
  HelpCircle
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/symptom-checker', label: 'Symptom Checker', icon: Stethoscope },
  { href: '/digital-twin', label: 'Digital Twin', icon: Brain },
  { href: '/doctor-finder', label: 'Find Doctors', icon: MapPin },
  { href: '/medical-analyzer', label: 'Medical Analyzer', icon: FileText },
  { href: '/health-suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/health-goals', label: 'Health Goals', icon: TrendingUp },
  { href: '/reminders', label: 'Medicine Reminders', icon: Pill },
  { href: '/how-it-works', label: 'How it Works', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-6 pt-24 lg:pt-6">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border pt-4">
            <p className="text-xs text-sidebar-foreground/60">SwasthyaAI Twin+ v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
