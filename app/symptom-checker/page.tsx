'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Send, AlertCircle } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SymptomResult {
  condition: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  description: string
}

export default function SymptomCheckerPage() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your AI Health Assistant. Please describe your symptoms, and I'll help assess your condition.",
        timestamp: new Date(),
      },
    ])
  }, [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SymptomResult | null>(null)
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<string>('Male')
  const [history, setHistory] = useState<string>('')
  const [showDetails, setShowDetails] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setResult(null) // Clear previous results

    try {
      // 1. Get AI response for chat (now follows the 6-point format)
      const chatData = await apiRequest('/medical/chat', 'POST', { message: input });
      
      // 2. Perform background analysis
      const analysisData = await apiRequest('/medical/analyze-symptoms', 'POST', {
        symptoms: input,
        age: age ? parseInt(age) : 25,
        gender: gender,
        history: history
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: chatData.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Only show the result card if the backend actually found symptoms/diseases
      if (analysisData.predicted_diseases && analysisData.predicted_diseases.length > 0) {
        const topDisease = analysisData.predicted_diseases[0];
        setResult({
          condition: topDisease.disease,
          urgency: analysisData.urgency_level.toLowerCase().includes('emergency') ? 'critical' : 
                   analysisData.urgency_level.toLowerCase().includes('high') ? 'high' :
                   analysisData.urgency_level.toLowerCase().includes('medium') ? 'medium' : 'low',
          confidence: typeof topDisease.probability === 'number' ? topDisease.probability : 0.5,
          description: analysisData.advice
        });
      }
    } catch (error) {
      console.error('Error calling backend:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I am having trouble connecting to the medical server. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const urgencyColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Symptom Checker</h1>
          <p className="text-muted-foreground">
            Describe your symptoms and let our AI analyze your condition
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowDetails(!showDetails)}
          className="hidden md:flex gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {showDetails ? 'Hide Profiles' : 'Patient Details'}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Patient Details Sidebar */}
        {showDetails && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            className="border-r border-border bg-card p-6 overflow-y-auto hidden md:block"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Patient Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Age</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 25" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <Button
                      key={g}
                      variant={gender === g ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setGender(g)}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Medical History</label>
                <textarea 
                  className="w-full h-32 text-sm p-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="e.g. Diabetes, Hypertension..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message, idx) => {
            let parsedData = null;
            if (message.type === 'assistant') {
              try {
                parsedData = JSON.parse(message.content);
              } catch (e) {
                // not JSON, fallback to raw text
              }
            }

            return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground'
                }`}
              >
                {parsedData ? (
                  <div className="space-y-3 text-sm">
                    {parsedData.reasoning && <p><strong>Analysis:</strong> {parsedData.reasoning}</p>}
                    {parsedData.possible_conditions && parsedData.possible_conditions.length > 0 && (
                      <div>
                        <strong>Possible Conditions:</strong>
                        <ul className="list-disc pl-4 mt-1">
                          {parsedData.possible_conditions.map((cond: any, i: number) => (
                            <li key={i}>{cond.name} ({cond.probability})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {parsedData.recommended_action && <p><strong>Action:</strong> {parsedData.recommended_action}</p>}
                    {parsedData.government_schemes && parsedData.government_schemes.length > 0 && (
                      <div className="mt-3 bg-primary/10 p-3 rounded-lg border border-primary/20">
                        <strong className="text-primary flex items-center gap-1">💸 Government Schemes:</strong>
                        <ul className="space-y-2 mt-2">
                          {parsedData.government_schemes.map((scheme: any, i: number) => (
                            <li key={i} className="text-xs">
                              <strong>{scheme.scheme_name}:</strong> {scheme.benefits}
                              <br /><span className="opacity-80">Eligibility: {scheme.eligibility}</span>
                            </li>
                          ))}
                        </ul>
                        {parsedData.cost_saving_note && (
                          <p className="text-xs italic mt-2 text-primary font-medium">{parsedData.cost_saving_note}</p>
                        )}
                      </div>
                    )}
                    {parsedData.nearby_hospitals && parsedData.nearby_hospitals.length > 0 && (
                      <div className="mt-2">
                        <strong>Nearby Hospitals:</strong>
                        <ul className="list-disc pl-4 mt-1 text-xs">
                          {parsedData.nearby_hospitals.map((hosp: any, i: number) => (
                            <li key={i}>{hosp.name} {hosp.accepts_schemes ? '(Accepts Schemes)' : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {parsedData.urgency_level && (
                        <Badge variant="outline" className="bg-background">{parsedData.urgency_level} Urgency</Badge>
                      )}
                      {parsedData.doctor_type && (
                        <Badge variant="secondary" className="bg-secondary/50">{parsedData.doctor_type}</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </motion.div>
            </motion.div>
          )})}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="my-6"
            >
              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {result.condition}
                    </h3>
                    <Badge className={urgencyColors[result.urgency]}>
                      {result.urgency.charAt(0).toUpperCase() + result.urgency.slice(1)} Urgency
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Assessment</p>
                    <p className="text-sm font-semibold text-foreground">Preliminary</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{result.description}</p>

                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended Precautions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['Rest and Hydrate', 'Monitor Temperature', 'Avoid strenuous activity'].map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground bg-secondary/30 p-2 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> This is an AI assessment and not a substitute for professional medical advice. Please consult a healthcare provider for accurate diagnosis.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border px-4 py-3 rounded-lg flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-sm text-muted-foreground animate-pulse">SwasthyaAI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
          <Input
            type="text"
            placeholder="Describe your symptoms here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</div>
  )
}
