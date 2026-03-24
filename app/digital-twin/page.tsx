'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, AlertCircle, TrendingUp, Calendar, Heart, Bell, PhoneCall, Star } from 'lucide-react'
import { apiRequest } from '@/lib/api'

const riskDataTimeline = [
  { month: 'Jan', risk: 35 },
  { month: 'Feb', risk: 38 },
  { month: 'Mar', risk: 42 },
  { month: 'Apr', risk: 45 },
  { month: 'May', risk: 48 },
  { month: 'Jun', risk: 52 },
  { month: 'Jul', risk: 48 },
  { month: 'Aug', risk: 45 },
]

interface RiskFactor {
  name: string
  level: number
  trend: 'up' | 'down' | 'stable'
  impact: 'low' | 'medium' | 'high'
}

const impactColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const initialRiskFactors: RiskFactor[] = [
  { name: 'Blood Pressure', level: 75, trend: 'up', impact: 'high' },
  { name: 'Cholesterol', level: 60, trend: 'stable', impact: 'medium' },
  { name: 'Heart Rate', level: 45, trend: 'down', impact: 'low' },
  { name: 'Glucose Level', level: 55, trend: 'up', impact: 'medium' },
]

export default function DigitalTwinPage() {
  const [riskData, setRiskData] = useState<any[]>([])
  const [overallRisk, setOverallRisk] = useState(0)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(6)
  const [selectedRisk, setSelectedRisk] = useState<RiskFactor | null>(null)
  const [aiInsights, setAiInsights] = useState('')
  const [factors, setFactors] = useState<RiskFactor[]>(initialRiskFactors)
  
  // Vitals state
  const [cholesterolInput, setCholesterolInput] = useState('')
  const [bpInput, setBpInput] = useState('')
  const [hrInput, setHrInput] = useState('')
  const [glucoseInput, setGlucoseInput] = useState('')
  const [dailyBp, setDailyBp] = useState('')
  const [bpLogged, setBpLogged] = useState(false)
  const [bpLogs, setBpLogs] = useState<{date: string, value: string}[]>([])
  
  // Custom Diet Symptom state
  const [dietSymptom, setDietSymptom] = useState('')
  const [appliedSymptom, setAppliedSymptom] = useState('')
  const [symptomLogs, setSymptomLogs] = useState<{date: string, value: string}[]>([])

  // Checkup state
  const [checkupInput, setCheckupInput] = useState('')
  const [checkupLogs, setCheckupLogs] = useState<string[]>([])
  const [showNotification, setShowNotification] = useState(false)

  // Predictions state
  const [cardioRisk, setCardioRisk] = useState<'Low' | 'Moderate' | 'High'>('Moderate')
  const [hyperRisk, setHyperRisk] = useState<'Low' | 'Moderate' | 'High'>('High')
  const [metRisk, setMetRisk] = useState<'Low' | 'Moderate' | 'High'>('Moderate')

  useEffect(() => {
    async function fetchData() {
      try {
        const timeline = await apiRequest('/risk-timeline')
        setRiskData(timeline.map((item: any) => ({ month: item.time.split('-')[2], risk: item.risk * 100 })))
        
        const twin = await apiRequest('/digital-twin', 'POST', {
          history: [], // Mock history for now
          symptoms: "Normal checkup"
        })
        setOverallRisk(Math.round(twin.risk_score * 100))
        setAiInsights(twin.ai_insights)
      } catch (error) {
        console.error('Error fetching twin data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Load locally saved BP logs
    const savedLogs = localStorage.getItem('digital_twin_bpLogs')
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs)
        setBpLogs(parsed)
        // Check if logged today
        const todayStr = new Date().toLocaleDateString()
        if (parsed.length > 0 && parsed[0].date.startsWith(todayStr)) {
          setBpLogged(true)
        }
      } catch(e) {}
    }

    // Load locally saved Checkup logs
    const savedCheckup = localStorage.getItem('digital_twin_checkupLogs')
    if (savedCheckup) {
      try {
        const parsed = JSON.parse(savedCheckup)
        setCheckupLogs(parsed)
        // Display notification if any scheduled target date is today
        const todayIso = new Date().toISOString().split('T')[0]
        if (parsed.some((dateStr: string) => dateStr.split('T')[0] === todayIso)) {
          setShowNotification(true)
          playNotificationSound()
        }
      } catch (e) {}
    }
    
    // Load locally saved symptom logs
    const savedSymptoms = localStorage.getItem('digital_twin_symptomLogs')
    if (savedSymptoms) {
      try {
        const parsed = JSON.parse(savedSymptoms)
        setSymptomLogs(parsed)
        if (parsed.length > 0) {
          setAppliedSymptom(parsed[0].value) // apply latest symptom to diet map
        }
      } catch (e) {}
    }
  }, [])

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/ping.wav')
      audio.play().catch(e => console.log('Audio autoplay blocked', e))
    } catch(e) {
      console.warn("Audio play failed.", e)
    }
  }

  const handleUpdateVitals = () => {
    let updated = [...factors]
    let changed = false

    // Cholesterol
    if (cholesterolInput) {
      const val = parseFloat(cholesterolInput)
      if (!isNaN(val)) {
        let impact: 'low' | 'medium' | 'high' = 'low'
        let level = 30
        let cardioLevel: 'Low' | 'Moderate' | 'High' = 'Low'

        if (val < 200) {
          impact = 'low'
          level = Math.max(10, Math.min(40, (val / 200) * 40))
          cardioLevel = 'Low'
        } else if (val <= 239) {
          impact = 'medium'
          level = 40 + ((val - 200) / 39) * 30
          cardioLevel = 'Moderate'
        } else {
          impact = 'high'
          level = Math.min(95, 70 + ((val - 240) / 60) * 25)
          cardioLevel = 'High'
        }
        setCardioRisk(cardioLevel)
        updated = updated.map(f => f.name === 'Cholesterol' ? { ...f, level: Math.round(level), impact, trend: val > 200 ? 'up' : 'down' } : f)
        changed = true
      }
    }

    // Blood Pressure
    if (bpInput) {
      const [sysStr, diaStr] = bpInput.split('/')
      const sys = parseInt(sysStr)
      const dia = parseInt(diaStr)
      if (!isNaN(sys) && !isNaN(dia)) {
        let impact: 'low' | 'medium' | 'high' = 'low'
        let level = 20
        let hRisk: 'Low' | 'Moderate' | 'High' = 'Low'

        if (sys < 120 && dia < 80) {
          impact = 'low'
          level = 20
          hRisk = 'Low'
        } else if (sys < 140 && dia < 90) {
          impact = 'medium'
          level = 50
          hRisk = 'Moderate'
        } else {
          impact = 'high'
          level = 85
          hRisk = 'High'
        }
        setHyperRisk(hRisk)
        updated = updated.map(f => f.name === 'Blood Pressure' ? { ...f, level, impact, trend: sys > 120 ? 'up' : 'down' } : f)
        changed = true
      }
    }

    // Heart Rate
    if (hrInput) {
      const val = parseFloat(hrInput)
      if (!isNaN(val)) {
        let impact: 'low' | 'medium' | 'high' = 'low'
        let level = 30
        if (val >= 60 && val <= 100) {
          impact = 'low'
          level = 30
        } else if ((val > 100 && val <= 120) || (val >= 50 && val < 60)) {
          impact = 'medium'
          level = 60
        } else {
          impact = 'high'
          level = 90
        }
        updated = updated.map(f => f.name === 'Heart Rate' ? { ...f, level, impact, trend: val > 80 ? 'up' : 'down' } : f)
        changed = true
      }
    }

    // Glucose Level
    if (glucoseInput) {
      const val = parseFloat(glucoseInput)
      if (!isNaN(val)) {
        let impact: 'low' | 'medium' | 'high' = 'low'
        let level = 20
        let mRisk: 'Low' | 'Moderate' | 'High' = 'Low'

        if (val < 100) {
          impact = 'low'
          level = 25
          mRisk = 'Low'
        } else if (val <= 125) {
          impact = 'medium'
          level = 60
          mRisk = 'Moderate'
        } else {
          impact = 'high'
          level = 90
          mRisk = 'High'
        }
        setMetRisk(mRisk)
        updated = updated.map(f => f.name === 'Glucose Level' ? { ...f, level, impact, trend: val > 100 ? 'up' : 'down' } : f)
        changed = true
      }
    }

    if (changed) {
      setFactors(updated)
      
      // Calculate new overall risk
      const newOverallRisk = Math.round(updated.reduce((acc, curr) => acc + curr.level, 0) / updated.length)
      setOverallRisk(newOverallRisk)
      
      // Update line chart data dynamically
      setRiskData(prevData => {
        const dataToUse = prevData.length > 0 ? prevData : riskDataTimeline
        const lastIndex = dataToUse.length - 1
        
        if (dataToUse[lastIndex].month === 'Now') {
          const newData = [...dataToUse]
          newData[lastIndex] = { ...newData[lastIndex], risk: newOverallRisk }
          return newData
        } else {
          // If we have existing data, append the new node
          const newData = [...dataToUse, { month: 'Now', risk: newOverallRisk }]
          // Filter to just keep last N items to avoid overcrowding chart
          return newData.length > 8 ? newData.slice(newData.length - 8) : newData
        }
      })
    }
  }

  return (
    <>
      {/* Checkup Notification Banner */}
      {showNotification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-[9999] bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center justify-between gap-4 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/20 p-2 rounded-full">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Doctor's Appointment Today!</p>
              <p className="text-xs opacity-90 mt-0.5">Don't forget your scheduled checkup.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowNotification(false)} className="h-8 px-2 text-primary-foreground hover:bg-primary-foreground/20">
            Dismiss
          </Button>
        </motion.div>
      )}

      <div className="w-full bg-background p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Digital Twin</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your health profile and predictive risk assessment
          </p>
        </div>

        {/* Overall Risk Score */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Health Risk</p>
                <p className="text-4xl font-bold text-foreground">{overallRisk}%</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${overallRisk}%` }}
              />
            </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <p className="text-sm text-muted-foreground">Trend</p>
              </div>
              <p className="text-2xl font-bold text-foreground">Increasing</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">↑ +7% from last month</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <p className="text-sm text-muted-foreground">Alert Level</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Moderate Warning
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">2 factors need attention</p>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="p-6 border-2 border-primary/30 bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">AI Health Insights</h2>
                  <div className="text-muted-foreground whitespace-pre-line text-sm">
                    {aiInsights}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Risk Progression Chart */}
        <Card className="p-6 mb-8 border border-border">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Risk Progression</h2>
            <div className="flex gap-2 flex-wrap">
              {[3, 6, 12].map((months) => (
                <Button
                  key={months}
                  variant={timeRange === months ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(months)}
                >
                  {months}M
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskData.length > 0 ? riskData : riskDataTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--color-foreground)' }}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Risk Factors & Predictions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Risk Factors</h2>
            
            {/* Vitals Logger Form */}
            <Card className="p-4 mb-4 border border-primary/20 bg-primary/5">
              <h3 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Update Vitals
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input 
                  type="number" 
                  placeholder="Cholesterol (mg/dL)" 
                  value={cholesterolInput}
                  onChange={(e) => setCholesterolInput(e.target.value)}
                  className="bg-background text-sm"
                />
                <Input 
                  type="text" 
                  placeholder="BP (e.g. 120/80)" 
                  value={bpInput}
                  onChange={(e) => setBpInput(e.target.value)}
                  className="bg-background text-sm"
                />
                <Input 
                  type="number" 
                  placeholder="Heart Rate (bpm)" 
                  value={hrInput}
                  onChange={(e) => setHrInput(e.target.value)}
                  className="bg-background text-sm"
                />
                <Input 
                  type="number" 
                  placeholder="Glucose (mg/dL)" 
                  value={glucoseInput}
                  onChange={(e) => setGlucoseInput(e.target.value)}
                  className="bg-background text-sm"
                />
              </div>
              <Button id="calc-risk-btn" onClick={handleUpdateVitals} className="w-full">Calculate Risk Assessment</Button>
            </Card>

            <div className="space-y-3">
              {factors.map((factor, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Card
                    className="p-4 border border-border cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setSelectedRisk(factor)}
                  >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{factor.name}</h3>
                    <Badge className={impactColors[factor.impact]}>
                      {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)}
                    </Badge>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        factor.impact === 'high'
                          ? 'bg-red-500'
                          : factor.impact === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${factor.level}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{factor.level}%</span>
                    <span
                      className={`text-xs font-semibold ${
                        factor.trend === 'up'
                          ? 'text-red-600'
                          : factor.trend === 'down'
                            ? 'text-green-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {factor.trend === 'up' ? '↑' : factor.trend === 'down' ? '↓' : '→'}{' '}
                      {factor.trend.charAt(0).toUpperCase() + factor.trend.slice(1)}
                    </span>
                  </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations & Future Risks */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">AI Recommendations</h2>
              <div className="space-y-3">
                {[
                  { id: 'bp', title: 'Monitor Blood Pressure', icon: '📊', desc: 'Check twice daily with consistent timing' },
                  { id: 'activity', title: 'Increase Activity', icon: '🚶', desc: '30 minutes of moderate exercise daily' },
                  { id: 'diet', title: 'Dietary Changes', icon: '🥗', desc: 'Reduce sodium and processed foods' },
                  { id: 'checkup', title: 'Schedule Checkup', icon: '📅', desc: 'Book appointment with cardiologist soon' },
                ].map((rec, idx) => (
                  <Card key={idx} className="p-4 border border-border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex gap-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm flex items-center justify-between">
                          {rec.title}
                          {rec.id === 'bp' && bpLogged && (
                            <Badge className="bg-green-500 text-white hover:bg-green-600 text-[10px] py-0 h-5">✓ Logged</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{rec.desc}</p>
                        
                          {rec.id === 'bp' && (
                            <div className="mt-4 border-t border-border pt-3">
                              <div className="flex gap-2 w-full max-w-[250px] mb-3">
                                <Input 
                                  type="text" 
                                  placeholder="e.g. 120/80" 
                                  value={dailyBp}
                                  onChange={(e) => setDailyBp(e.target.value)}
                                  className="h-8 text-sm bg-background border-primary/20"
                                />
                                <Button size="sm" className="h-8 text-xs whitespace-nowrap px-3" onClick={() => {
                                  if (dailyBp) {
                                    const now = new Date()
                                    const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    const newLogs = [{ date: dateStr, value: dailyBp }, ...bpLogs]
                                    
                                    setBpLogs(newLogs)
                                    localStorage.setItem('digital_twin_bpLogs', JSON.stringify(newLogs))
                                    
                                    setBpInput(dailyBp)
                                    setBpLogged(true)
                                    setDailyBp('')
                                    
                                    setTimeout(() => {
                                      document.getElementById('calc-risk-btn')?.click()
                                    }, 100)
                                  }
                                }}>
                                  {bpLogged ? 'Log Another' : 'Log Check'}
                                </Button>
                              </div>
                              {bpLogs.length > 0 && (
                                <div className="space-y-2 mt-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                  <p className="text-xs font-semibold text-foreground">Previous Logs:</p>
                                  {bpLogs.map((log, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs bg-background/50 p-1.5 rounded border border-border">
                                      <span className="text-muted-foreground">{log.date}</span>
                                      <span className="font-medium text-foreground">{log.value} mmHg</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {rec.id === 'activity' && (
                            <div className="mt-4 border-t border-border pt-4 space-y-3">
                              <div className="flex items-center justify-between text-xs bg-primary/10 p-2.5 rounded border border-primary/20">
                                <span className="font-semibold text-primary">Recommended Duration:</span>
                                <span className="font-bold">{overallRisk > 50 || hyperRisk === 'High' ? '20 - 30 mins / day' : '40 - 60 mins / day'}</span>
                              </div>
                              <div className="text-xs bg-background p-3 rounded border border-border">
                                <span className="font-semibold block mb-2 text-foreground">
                                  Suitable Exercises <span className="font-normal text-muted-foreground">{overallRisk > 50 || hyperRisk === 'High' ? '(Adjusted for elevated BP/Risk)' : '(Healthy/Low Risk Profile)'}</span>:
                                </span>
                                <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
                                  {overallRisk > 50 || hyperRisk === 'High' ? (
                                    <>
                                      <li>Brisk walking (Low impact cardiovascular)</li>
                                      <li>Light Yoga or Stretching (Reduces stress without spiking BP)</li>
                                      <li>Swimming or Water Aerobics (Gentle on joints)</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>Jogging or Running (Heart health conditioning)</li>
                                      <li>Cycling or High Intensity Interval Training (Improves stamina)</li>
                                      <li>Moderate resistance training (Metabolic boost)</li>
                                    </>
                                  )}
                                </ul>
                                <p className="mt-3 text-[10px] italic text-muted-foreground/80">
                                  * Dynamically adjusted based on your logged vitals and age profile. Always consult a physician before starting a new routine.
                                </p>
                              </div>
                            </div>
                          )}

                          {rec.id === 'diet' && (
                            <div className="mt-4 border-t border-border pt-4 space-y-3">
                              <div className="flex items-center justify-between text-xs bg-primary/10 p-2.5 rounded border border-primary/20">
                                <span className="font-semibold text-primary">Recommended Diet Plan:</span>
                                <span className="font-bold">
                                  {metRisk === 'High' ? 'Low GI / Diabetic Diet' : hyperRisk === 'High' ? 'DASH Diet (Low Sodium)' : cardioRisk === 'High' ? 'Mediterranean / Heart Healthy' : 'Balanced Wellness Diet'}
                                </span>
                              </div>
                              <div className="flex gap-2 w-full mt-1 mb-2">
                                <Input 
                                  type="text" 
                                  placeholder="Any current symptoms? (e.g. fever, acid reflux, weak)" 
                                  value={dietSymptom}
                                  onChange={(e) => setDietSymptom(e.target.value)}
                                  className="h-8 text-sm bg-background border-primary/20"
                                />
                                <Button size="sm" className="h-8 text-xs whitespace-nowrap px-3" onClick={() => {
                                  if (dietSymptom) {
                                    setAppliedSymptom(dietSymptom)
                                    const now = new Date()
                                    const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    const newLogs = [{ date: dateStr, value: dietSymptom }, ...symptomLogs]
                                    setSymptomLogs(newLogs)
                                    localStorage.setItem('digital_twin_symptomLogs', JSON.stringify(newLogs))
                                    setDietSymptom('')
                                  }
                                }}>
                                  {symptomLogs.length > 0 ? 'Log Another' : 'Update Diet'}
                                </Button>
                              </div>
                              <div className="text-xs bg-background p-3 rounded border border-border">
                                <span className="font-semibold block mb-2 text-foreground">
                                  Suggested Daily Diet Chart:
                                </span>
                                <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
                                  {metRisk === 'High' ? (
                                    <>
                                      <li>Breakfast: Oatmeal with chia seeds and almonds (No added sugar)</li>
                                      <li>Lunch: Grilled chicken/tofu salad with leafy greens and a light vinaigrette</li>
                                      <li>Dinner: Baked fish/paneer with quinoa and roasted broccoli</li>
                                      <li className="text-orange-600 dark:text-orange-400 mt-2 font-medium">Strictly avoid: Refined carbs, sugary drinks, sweets</li>
                                    </>
                                  ) : hyperRisk === 'High' ? (
                                    <>
                                      <li>Breakfast: Fresh fruit smoothie with spinach and unsalted nuts</li>
                                      <li>Lunch: Lentil soup with whole-grain bread and cucumber slices</li>
                                      <li>Dinner: Steamed vegetables with brown rice and grilled salmon</li>
                                      <li className="text-orange-600 dark:text-orange-400 mt-2 font-medium">Strictly avoid: Processed meats, excess salt, canned soup</li>
                                    </>
                                  ) : cardioRisk === 'High' ? (
                                    <>
                                      <li>Breakfast: Avocado toast on whole-wheat bread with a side of berries</li>
                                      <li>Lunch: Quinoa bowl with chickpeas, tomatoes, and olive oil dressing</li>
                                      <li>Dinner: Grilled turkey or lentils with sweet potato and asparagus</li>
                                      <li className="text-orange-600 dark:text-orange-400 mt-2 font-medium">Strictly avoid: Deep-fried foods, butter, full-fat dairy</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>Breakfast: Eggs/Oatmeal with whole-grain toast and fresh fruit</li>
                                      <li>Lunch: Mixed vegetable stir-fry with lean protein and brown rice</li>
                                      <li>Dinner: Light soup or salad with a portion of complex carbohydrates</li>
                                      <li className="text-green-600 dark:text-green-400 mt-2 font-medium">Main Focus: Maintain balanced macros and portion sizes</li>
                                    </>
                                  )}
                                </ul>
                                {appliedSymptom && (
                                  <div className="mt-4 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
                                    <span className="font-semibold text-yellow-600 block mb-1">
                                      Special Modification for "{appliedSymptom}":
                                    </span>
                                    <span className="text-muted-foreground">
                                      {appliedSymptom.toLowerCase().includes('acid') || appliedSymptom.toLowerCase().includes('reflux') || appliedSymptom.toLowerCase().includes('heartburn') 
                                      ? 'Avoid spicy foods, tomatoes, citrus fruits, and heavy fats. Eat smaller meals.'
                                      : appliedSymptom.toLowerCase().includes('fever') || appliedSymptom.toLowerCase().includes('cold') || appliedSymptom.toLowerCase().includes('weak')
                                      ? 'Increase fluid intake significantly. Substitute solid meals with warm vegetable/chicken broths and light khichdi/rice.'
                                      : appliedSymptom.toLowerCase().includes('stomach') || appliedSymptom.toLowerCase().includes('bloating') || appliedSymptom.toLowerCase().includes('gas')
                                      ? 'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast). Avoid dairy and heavily fibrous veggies.'
                                      : 'Ensure you stay hydrated and eat lighter, easily digestible portions of the above diet.'}
                                    </span>
                                  </div>
                                )}
                                {symptomLogs.length > 0 && (
                                  <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar border-t border-border pt-3">
                                    <p className="text-xs font-semibold text-foreground">Previous Symptom Logs:</p>
                                    {symptomLogs.map((log, i) => (
                                      <div key={i} className="flex justify-between items-center text-xs bg-background/50 p-1.5 rounded border border-border">
                                        <span className="text-muted-foreground">{log.date}</span>
                                        <span className="font-medium text-foreground">{log.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p className="mt-3 text-[10px] italic text-muted-foreground/80">
                                  * Diet charts map directly to your individual health markers (Glucose, BP, Cholesterol) entered today.
                                </p>
                              </div>
                            </div>
                          )}

                          {rec.id === 'checkup' && (
                            <div className="mt-4 border-t border-border pt-4 space-y-3">
                              <p className="text-xs font-semibold text-foreground">Select Date & Time for Checkup:</p>
                              <div className="flex gap-2 w-full max-w-[320px]">
                                <Input 
                                  type="datetime-local" 
                                  value={checkupInput}
                                  onChange={(e) => setCheckupInput(e.target.value)}
                                  className="h-8 text-[11px] sm:text-xs bg-background border-primary/20"
                                  min={new Date().toISOString().slice(0, 16)}
                                />
                                <Button size="sm" className="h-8 text-xs whitespace-nowrap px-3" onClick={() => {
                                  if (checkupInput && !checkupLogs.includes(checkupInput)) {
                                    const newLogs = [...checkupLogs, checkupInput].sort()
                                    setCheckupLogs(newLogs)
                                    localStorage.setItem('digital_twin_checkupLogs', JSON.stringify(newLogs))
                                    
                                    const todayIso = new Date().toISOString().split('T')[0]
                                    if (checkupInput.split('T')[0] === todayIso) {
                                      setShowNotification(true)
                                      playNotificationSound()
                                      window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }
                                    setCheckupInput('')
                                  }
                                }}>
                                  {checkupLogs.length > 0 ? 'Log Another' : 'Set Reminder'}
                                </Button>
                              </div>
                              {checkupLogs.length > 0 && (
                                <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                                  {checkupLogs.map((dateStr, i) => (
                                    <div key={i} className="mt-2 text-[11px] sm:text-xs flex items-center gap-2 text-green-600 dark:text-green-400 font-medium bg-green-500/10 p-2 rounded border border-green-500/20 break-words">
                                      <Calendar className="w-4 h-4 shrink-0" />
                                      <span className="truncate">Scheduled: {new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                      <button onClick={() => {
                                        const newLogs = checkupLogs.filter(d => d !== dateStr)
                                        setCheckupLogs(newLogs)
                                        localStorage.setItem('digital_twin_checkupLogs', JSON.stringify(newLogs))
                                        
                                        // Auto dim notification if deleting today's current appt
                                        if (dateStr.split('T')[0] === new Date().toISOString().split('T')[0]) {
                                          setShowNotification(false) 
                                        }
                                      }} className="text-red-500 hover:text-red-600 hover:underline shrink-0 ml-auto pl-1">
                                        Cancel
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-foreground">Future Health Risk Prediction</h3>
                </div>
                <div className="space-y-3">
                  <motion.div 
                    key={cardioRisk + "1"} 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-between items-center p-3 bg-background rounded-lg border border-border"
                  >
                    <span className="text-sm font-medium">Cardiovascular Risk (12 Months)</span>
                    <Badge className={
                      cardioRisk === 'High' ? 'bg-red-500 text-white hover:bg-red-600' : 
                      cardioRisk === 'Moderate' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }>
                      {cardioRisk}
                    </Badge>
                  </motion.div>
                  <motion.div 
                    key={hyperRisk + "2"} 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-between items-center p-3 bg-background rounded-lg border border-border"
                  >
                    <span className="text-sm font-medium">Hypertension Risk (12 Months)</span>
                    <Badge className={
                      hyperRisk === 'High' ? 'bg-red-500 text-white hover:bg-red-600' : 
                      hyperRisk === 'Moderate' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }>
                      {hyperRisk}
                    </Badge>
                  </motion.div>
                  <motion.div 
                    key={metRisk + "3"} 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-between items-center p-3 bg-background rounded-lg border border-border"
                  >
                    <span className="text-sm font-medium">Metabolic Risk (24 Months)</span>
                    <Badge className={
                      metRisk === 'High' ? 'bg-red-500 text-white hover:bg-red-600' : 
                      metRisk === 'Moderate' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }>
                      {metRisk}
                    </Badge>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  * Predictions based on current trends in Blood Pressure, Glucose, and Cholesterol levels. Log symptoms regularly to improve accuracy.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
