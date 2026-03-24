'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Droplets, 
  Footprints, 
  Flame, 
  Utensils, 
  Plus, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function HealthGoalsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    water_ml: 0,
    steps: 0,
    calories_burnt: 0,
    food_log: [] as any[]
  })
  const [foodInput, setFoodInput] = useState('')
  const [analyzingFood, setAnalyzingFood] = useState(false)
  const [foodAnalysis, setFoodAnalysis] = useState<any>(null)

  const WATER_GOAL_ML = 7000 // 7 Litres as requested

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/goals/stats')
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchStats()
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const addWater = async (amount: number) => {
    if (!user) {
      setStats(prev => ({
        ...prev,
        water_ml: (prev?.water_ml || 0) + amount
      }))
      return
    }
    try {
      await apiRequest('/goals/update-water', 'POST', { amount_ml: amount })
      fetchStats()
    } catch (error) {
      console.error('Failed to update water:', error)
    }
  }

  const updateSteps = async (steps: number) => {
    if (!user) {
      setStats(prev => ({
        ...prev,
        steps: steps,
        calories_burnt: steps * 0.04
      }))
      return
    }
    try {
      await apiRequest('/goals/update-steps', 'POST', { steps: steps })
      fetchStats()
    } catch (error) {
      console.error('Failed to update steps:', error)
    }
  }

  const analyzeFood = async () => {
    if (!foodInput) return
    setAnalyzingFood(true)
    
    if (!user) {
      const mockResult = {
        calories: 350,
        macros: { protein: '12g', carbs: '45g', fat: '14g' },
        analysis: 'You chose a decent meal block. Create an account or log in to use full AI analysis permanently!',
        missing_nutrients: ['Fiber', 'Iron'],
        recommendation: 'Add leafy greens into next meal.'
      }
      setTimeout(() => {
        setFoodAnalysis(mockResult)
        setStats(prev => ({
          ...prev,
          food_log: [...(prev?.food_log || []), { description: foodInput, analysis: mockResult }]
        }))
        setFoodInput('')
        setAnalyzingFood(false)
      }, 1000)
      return
    }

    try {
      const result = await apiRequest('/goals/analyze-food', 'POST', { description: foodInput })
      setFoodAnalysis(result)
      fetchStats()
      setFoodInput('')
    } catch (error) {
      console.error('Failed to analyze food:', error)
    } finally {
      setAnalyzingFood(false)
    }
  }

  const waterProgress = ((stats?.water_ml || 0) / WATER_GOAL_ML) * 100

  return (
    <div className="w-full bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Health Goals & Tracking</h1>
          <p className="text-muted-foreground">Monitor your daily activities and get AI-powered nutritional insights.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Water Intake Tracker */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Water Intake</h3>
                  <p className="text-sm text-muted-foreground">Goal: {(WATER_GOAL_ML / 1000).toFixed(0)}L</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{((stats?.water_ml || 0) / 1000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground">{waterProgress.toFixed(0)}% reached</p>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-4 mb-6 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(waterProgress, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addWater(250)} className="flex-1">+250ml</Button>
              <Button variant="outline" size="sm" onClick={() => addWater(500)} className="flex-1">+500ml</Button>
              <Button variant="outline" size="sm" onClick={() => addWater(1000)} className="flex-1">+1L</Button>
            </div>
          </Card>

          {/* Activity Tracker */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Footprints className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Activity</h3>
                  <p className="text-sm text-muted-foreground">Steps & Calories</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Steps</p>
                <Input 
                  type="number" 
                  value={stats?.steps || 0} 
                  onChange={(e) => updateSteps(parseInt(e.target.value) || 0)}
                  className="bg-transparent border-none text-2xl font-bold p-0 h-8 focus-visible:ring-0"
                />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Calories Burnt</p>
                <p className="text-2xl font-bold text-foreground">{(stats?.calories_burnt || 0).toFixed(0)} <span className="text-xs font-normal">kcal</span></p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic flex items-center gap-1">
              <Info className="w-3 h-3" />
              Calculated based on 0.04 kcal per step.
            </p>
          </Card>
        </div>

        {/* AI Food Analysis */}
        <Card className="p-8 border border-border mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">AI Food Analyst</h2>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm text-muted-foreground">Tell us what you had for your meal, and Gemini will analyze the contents.</p>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., A grilled chicken sandwich with whole wheat bread and an orange juice."
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && analyzeFood()}
              />
              <Button onClick={analyzeFood} disabled={analyzingFood || !foodInput}>
                {analyzingFood ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>

          {foodAnalysis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-background rounded-xl border border-primary/20 shadow-inner"
            >
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Calories</p>
                  <p className="text-2xl font-bold text-primary">{foodAnalysis.calories} kcal</p>
                </div>
                <div className="md:col-span-2 flex justify-around p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 text-center">Protein</p>
                    <p className="font-semibold text-center">{foodAnalysis.macros?.protein || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 text-center">Carbs</p>
                    <p className="font-semibold text-center">{foodAnalysis.macros?.carbs || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 text-center">Fat</p>
                    <p className="font-semibold text-center">{foodAnalysis.macros?.fat || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    AI Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">{foodAnalysis.analysis}</p>
                </div>

                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    What you might need
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {foodAnalysis.missing_nutrients?.map((n: string, i: number) => (
                      <Badge key={i} variant="secondary">{n}</Badge>
                    ))}
                  </div>
                </div>

                <Card className="p-4 bg-primary/10 border-none">
                  <p className="text-sm font-medium italic">
                    " {foodAnalysis.recommendation} "
                  </p>
                </Card>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Recent Food Logs */}
        {stats?.food_log && stats.food_log.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Recent Meals</h3>
            <div className="space-y-3">
              {stats.food_log.slice().reverse().map((log: any, i: number) => (
                <div key={i} className="p-4 border border-border rounded-lg flex justify-between items-center bg-card">
                  <div>
                    <p className="font-medium text-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground">{log.analysis?.calories} kcal</p>
                  </div>
                  <Badge variant="outline">{log.analysis?.recommendation?.slice(0, 30)}...</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
