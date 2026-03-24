'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  Cpu, 
  Activity, 
  LayoutDashboard, 
  UserRound, 
  FileText, 
  ShieldCheck, 
  LineChart 
} from 'lucide-react'

const workflowSteps = [
  {
    title: 'User Input',
    description: 'User enters symptoms (text/voice) + basic details (age, gender, history)',
    icon: <UserPlus className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-500/10'
  },
  {
    title: 'AI Processing',
    description: 'NLP/LLM analyzes symptoms, predicts diseases, and assigns urgency levels.',
    icon: <Cpu className="w-8 h-8 text-purple-500" />,
    color: 'bg-purple-500/10'
  },
  {
    title: 'Digital Health Twin',
    description: 'Stores data in database, tracks patterns, and predicts future health risks.',
    icon: <Activity className="w-8 h-8 text-green-500" />,
    color: 'bg-green-500/10'
  },
  {
    title: 'Results Dashboard',
    description: 'Shows likely diseases, urgency alerts, and basic health precautions.',
    icon: <LayoutDashboard className="w-8 h-8 text-orange-500" />,
    color: 'bg-orange-500/10'
  },
  {
    title: 'Expert Recommendations',
    description: 'Suggests nearby specialists filtered by experience, cost, and availability.',
    icon: <UserRound className="w-8 h-8 text-indigo-500" />,
    color: 'bg-indigo-500/10'
  },
  {
    title: 'Prescription Decoder',
    description: 'User uploads prescription images; OCR extracts medicines and instructions.',
    icon: <FileText className="w-8 h-8 text-red-500" />,
    color: 'bg-red-500/10'
  },
  {
    title: 'Affordable Care Layer',
    description: 'Displays Govt schemes (Ayushman Bharat) and low-cost pharmacy options.',
    icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
    color: 'bg-emerald-500/10'
  },
  {
    title: 'Continuous Monitoring',
    description: 'User logs symptoms regularly; system updates health predictions and alerts.',
    icon: <LineChart className="w-8 h-8 text-pink-500" />,
    color: 'bg-pink-500/10'
  }
]

export default function HowItWorksPage() {
  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-foreground mb-4"
          >
            SwasthyaAI Twin+
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Simple & Clear Workflow for Your Health Journey
          </motion.p>
        </div>

        <div className="relative space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 hidden md:block" />

          {workflowSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="flex-1 w-full">
                <Card className={`p-6 border border-border hover:shadow-xl transition-all ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              </div>

              {/* Icon / Circle */}
              <div className="relative z-10 flex-shrink-0 w-20 h-20 rounded-full border-4 border-background shadow-lg flex items-center justify-center bg-card">
                <div className={`w-full h-full rounded-full ${step.color} flex items-center justify-center p-4`}>
                  {step.icon}
                </div>
              </div>

              <div className="flex-1 w-full hidden md:block" />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <Card className="p-8 border-2 border-primary/20 bg-primary/5">
            <h2 className="text-2xl font-bold mb-4">Start Your Health Journey Today</h2>
            <p className="text-muted-foreground mb-6">Empower yourself with AI-driven insights and affordable care solutions.</p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="px-8">Get Started</Button>
              <Button variant="outline" size="lg">Explore Features</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
