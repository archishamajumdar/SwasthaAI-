'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Heart, Shield, Info, ArrowRight, DollarSign } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface Suggestion {
  id: string
  category: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  duration: string
  completed: boolean
  progress: number
  tips: string[]
}

interface Scheme {
  title: string
  category: string
  description: string
  link: string
}

interface Medicine {
  brand_name: string
  generic_name: string
  savings_percent: number
}

export default function HealthSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      category: 'Exercise',
      title: 'Daily Movement Goal',
      description: 'Aim for 8,000–10,000 steps/day or at least 30–45 minutes of activity.',
      impact: 'high',
      difficulty: 'easy',
      duration: 'Daily',
      completed: false,
      progress: 0,
      tips: [
        'Mix activities: walking, cycling, sports, dancing',
        'Use standard goal: "I will move my body every day, even if it’s just a walk."'
      ],
    },
    {
      id: '2',
      category: 'Exercise',
      title: 'Strength & Fitness Goal',
      description: 'Do strength training 2–3 times/week.',
      impact: 'high',
      difficulty: 'medium',
      duration: '3 days/week',
      completed: false,
      progress: 0,
      tips: [
        'Focus on basics: Squats, Push-ups, Planks',
        'Mantra: "I will build strength, not just lose weight."'
      ],
    },
    {
      id: '3',
      category: 'Meditation',
      title: 'Mental Health Goal',
      description: 'Spend 10–15 mins/day relaxing your mind.',
      impact: 'high',
      difficulty: 'easy',
      duration: '15 mins/day',
      completed: false,
      progress: 0,
      tips: [
        'Try: Meditation, Journaling, Deep breathing',
        'Mantra: "I will take care of my mind as much as my body."'
      ],
    },
    {
      id: '4',
      category: 'Diet',
      title: 'Nutrition Goal',
      description: 'Eat balanced meals with protein and veggies.',
      impact: 'high',
      difficulty: 'medium',
      duration: 'Daily',
      completed: false,
      progress: 0,
      tips: [
        'Include: Dal, eggs, paneer, veggies, whole grains',
        'Reduce: Junk food, Sugary drinks',
        'Mantra: "I will fuel my body, not just fill my stomach."'
      ],
    },
    {
      id: '5',
      category: 'Diet',
      title: 'Hydration Goal',
      description: 'Drink 2–3 liters of water daily.',
      impact: 'medium',
      difficulty: 'easy',
      duration: 'Daily',
      completed: false,
      progress: 0,
      tips: [
        'Keep a bottle with you with markers',
        'Mantra: "I will stay hydrated throughout the day."'
      ],
    },
    {
      id: '6',
      category: 'Sleep',
      title: 'Sleep Goal',
      description: 'Get 7–9 hours of sleep nightly.',
      impact: 'high',
      difficulty: 'medium',
      duration: '7-9 hrs',
      completed: false,
      progress: 0,
      tips: [
        'Fix a sleep schedule (same time daily)',
        'Mantra: "I will prioritize rest for recovery."'
      ],
    },
    {
      id: '7',
      category: 'Exercise',
      title: 'Screen & Lifestyle Goal',
      description: 'Limit unnecessary screen time.',
      impact: 'medium',
      difficulty: 'medium',
      duration: 'Daily',
      completed: false,
      progress: 0,
      tips: [
        'Take breaks every 1 hour',
        'Mantra: "I will reduce screen time and stay active."'
      ],
    },
    {
      id: '8',
      category: 'Health Checkup',
      title: 'Preventive Health Goal',
      description: 'Regular check-ups and tracks.',
      impact: 'high',
      difficulty: 'hard',
      duration: 'Monthly',
      completed: false,
      progress: 0,
      tips: [
        'Track: Weight, Energy levels, Any symptoms',
        'Mantra: "I will monitor my health, not ignore it."'
      ],
    }
  ])

  const [schemes, setSchemes] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiRequest('/schemes')
        setSchemes(data.schemes)
        setMedicines(data.generic_medicines)
      } catch (error) {
        console.error('Error fetching health data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleCompletion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, completed: !s.completed, progress: !s.completed ? 100 : 0 }
          : s
      )
    )
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return ''
    }
  }

  const completedCount = suggestions.filter((s) => s.completed).length
  const totalCount = suggestions.length

  return (
    <div className="w-full bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Personalized Health Suggestions</h1>
          <p className="text-muted-foreground">
            AI-curated recommendations based on your health profile and risk factors
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8 border border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Goals Completed</p>
              <p className="text-3xl font-bold text-foreground">
                {completedCount}/{totalCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-primary">
                {Math.round((completedCount / totalCount) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Impact Points</p>
              <p className="text-3xl font-bold text-foreground">
                {suggestions.filter((s) => s.completed && s.impact === 'high').length * 100 +
                  suggestions.filter((s) => s.completed && s.impact === 'medium').length * 50 +
                  suggestions.filter((s) => s.completed && s.impact === 'low').length * 25}
              </p>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {['All', 'Exercise', 'Diet', 'Meditation', 'Sleep', 'Health Checkup'].map((cat) => (
              <Button key={cat} variant="outline" size="sm">
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Suggestions Grid */}
        <div className="space-y-4">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Card className="p-6 border border-border hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleCompletion(suggestion.id)}
                    className="flex-shrink-0 pt-1 mt-1"
                  >
                    {suggestion.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-border hover:border-primary transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className={`text-lg font-semibold mb-1 ${suggestion.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Badge className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                        <Badge variant="outline">{suggestion.difficulty}</Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${suggestion.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Expandable Tips */}
                    <details className="group">
                      <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                        <span className="group-open:rotate-180 transition-transform">▶</span>
                        Tips & How to Get Started
                      </summary>
                      <div className="mt-4 ml-6 space-y-2">
                        {suggestion.tips.map((tip, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="text-primary flex-shrink-0">•</span>
                            <span className="text-foreground">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bonus SMART Goals Banner */}
        <Card className="p-6 mt-6 border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-between gap-4">
          <div>
            <Badge className="bg-orange-100 text-orange-800 mb-2">🔥 BONUS: SMART GOAL EXAMPLE</Badge>
            <h3 className="text-xl font-bold text-foreground">Set Smarter Objectives!</h3>
            <p className="text-sm text-muted-foreground mt-1">Instead of: <span className="text-red-500 font-bold">❌ “I want to get fit”</span></p>
            <p className="font-semibold text-foreground text-sm flex items-center gap-1 mt-2">
              <span className="text-green-600 font-bold">✅</span> “I will walk 8,000 steps daily and work out 3 times a week for 1 month”
            </p>
          </div>
        </Card>

        {/* Government Schemes */}
        {!loading && schemes.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Government Health Schemes
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {schemes.map((scheme: Scheme, sidx: number) => (
                <Card key={sidx} className="p-6 border border-border">
                  <Badge className="mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {scheme.category}
                  </Badge>
                  <h3 className="text-lg font-semibold mb-2">{scheme.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{scheme.description}</p>
                  <Button variant="link" className="p-0 h-auto text-primary gap-1" asChild>
                    <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Treatment Cost Layer */}
        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Estimated Treatment Cost Layer
          </h2>
          <Card className="p-0 border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Treatment / Procedure</th>
                  <th className="px-6 py-3">Private Hospital Est.</th>
                  <th className="px-6 py-3">Govt / Low-Cost Est.</th>
                  <th className="px-6 py-3">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'General Consultation', private: '₹800 - ₹1500', govt: '₹0 - ₹50', save: '95%+' },
                  { name: 'Blood Test (Basic)', private: '₹1200', govt: '₹200', save: '80%' },
                  { name: 'Cardiology (OPD)', private: '₹2000', govt: '₹100', save: '90%+' },
                  { name: 'Diabetes Management (Monthly)', private: '₹5000', govt: '₹500', save: '90%' },
                  { name: 'X-Ray', private: '₹800 - ₹1500', govt: '₹100 - ₹300', save: '80–90%' },
                  { name: 'MRI Scan', private: '₹6000 - ₹12000', govt: '₹1500 - ₹3000', save: '70–85%' },
                  { name: 'CT Scan', private: '₹4000 - ₹8000', govt: '₹1000 - ₹2500', save: '70–80%' },
                  { name: 'Ultrasound', private: '₹1500 - ₹3000', govt: '₹300 - ₹800', save: '70–85%' },
                  { name: 'Normal Delivery', private: '₹40000 - ₹100000', govt: '₹0 - ₹5000', save: '90–100%' },
                  { name: 'C-Section Delivery', private: '₹80000 - ₹200000', govt: '₹5000 - ₹15000', save: '85–95%' },
                  { name: 'Dialysis (per session)', private: '₹2000 - ₹4000', govt: '₹0 - ₹500', save: '80–100%' },
                  { name: 'Chemotherapy (per cycle)', private: '₹20000 - ₹100000', govt: '₹2000 - ₹10000', save: '80–90%' },
                  { name: 'Cataract Surgery', private: '₹30000 - ₹80000', govt: '₹0 - ₹5000', save: '90–100%' },
                  { name: 'Orthopedic Surgery (Fracture)', private: '₹50000 - ₹150000', govt: '₹5000 - ₹20000', save: '80–90%' },
                  { name: 'ICU per day', private: '₹10000 - ₹25000', govt: '₹500 - ₹3000', save: '70–95%' },
                  { name: 'ECG Test', private: '₹500 - ₹1000', govt: '₹50 - ₹150', save: '85–90%' },
                  { name: 'Physiotherapy Session', private: '₹500 - ₹1500', govt: '₹50 - ₹200', save: '80–90%' },
                  { name: 'Vaccination (General)', private: '₹1000 - ₹3000', govt: '₹0 - ₹200', save: '80–100%' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors border-b">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.private}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{item.govt}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{item.save} saved</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" />
              Costs are estimated based on regional data in Kolkata. Actual costs may vary by institution.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
