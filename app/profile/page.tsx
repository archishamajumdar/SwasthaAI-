'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { apiRequest } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Activity, Pill, Thermometer, User as UserIcon, Calendar, Droplets, Footprints } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Questionnaire States
  const [showQuiz, setShowQuiz] = useState(!!user && (!user.health_history || user.health_history.length === 0))
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const QUESTIONS = [
    { id: 1, text: "What is your approximate age range?", options: ["Below 18", "18-30", "31-50", "51-70", "70+"] },
    { id: 2, text: "What is your gender?", options: ["Male", "Female", "Other"] },
    { id: 3, text: "Do you have High Blood Pressure?", options: ["Yes", "No", "Not tested"], label: "High Blood Pressure" },
    { id: 4, text: "Do you have High Blood Sugar symptoms (Diabetes)?", options: ["Yes", "No", "Borderline"], label: "Diabetes" },
    { id: 5, text: "Any known heart condition or history of chest pain?", options: ["Yes", "No"], label: "Heart Condition" },
    { id: 6, text: "Do you experience shortness of breath or known Asthma?", options: ["Yes", "No"], label: "Asthma" },
    { id: 7, text: "Do you experience long-term joint/muscle or back pains?", options: ["Yes", "No"], label: "Joint Pain" },
    { id: 8, text: "Do you have any known Drug Allergies (e.g. penicillin)?", options: ["Yes", "No"], label: "Drug Allergy" },
    { id: 9, text: "How would you describe your daily exercise routine?", options: ["Sedentary", "Moderate activity", "Athletic"] },
    { id: 10, text: "Do you smoke or consume alcohol regularly?", options: ["Yes", "No", "Occasionally"] },
  ]

  const submitQuiz = async () => {
    let ageValue = 25;
    if (answers[1] === "Below 18") ageValue = 15;
    if (answers[1] === "18-30") ageValue = 25;
    if (answers[1] === "31-50") ageValue = 40;
    if (answers[1] === "51-70") ageValue = 60;
    if (answers[1] === "70+") ageValue = 75;

    const genderValue = answers[2] || "Not specified";
    
    const history: string[] = [];
    QUESTIONS.slice(2).forEach(q => {
      const ans = answers[q.id];
      if (ans === 'Yes' || ans === 'Borderline' || ans === 'Sedentary' || ans === 'Yes') {
         if (q.label) history.push(q.label);
      }
    });

    try {
      await apiRequest('/auth/update-profile', 'POST', {
        age: ageValue,
        gender: genderValue,
        health_history: history
      });
      setShowQuiz(false);
      refreshUser();
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
    
    if (user && (!user.health_history || user.health_history.length === 0)) {
      setShowQuiz(true);
    }

    if (user) {
      fetchProfileData()
    }
  }, [user, authLoading])

  const fetchProfileData = async () => {
    try {
      const [statsData, remindersData] = await Promise.all([
        apiRequest('/goals/stats'),
        apiRequest('/reminders/'),
      ])
      setStats(statsData)
      setReminders(remindersData)
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
            <p className="text-muted-foreground">{user.email} • {user.age ? `${user.age} yrs` : 'No age set'} • {user.gender || 'Not specified'}</p>
          </div>
        </div>
      </header>

      {/* Questionnaire Floating Banner */}
      {!showQuiz && (
        <Card className="p-6 bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Update Medical Profile</h3>
            <p className="text-sm text-muted-foreground">Answer 10 quick questions to sync diagnostics onto your digital health twin accuracy.</p>
          </div>
          <Button onClick={() => { setShowQuiz(true); setCurrentQuestion(0); }}>Retake Assessment</Button>
        </Card>
      )}

      {/* Questionnaire Modal Layout */}
      {showQuiz && (
        <Card className="p-6 border-2 border-primary bg-primary/5 animate-in slide-in-from-top-4 duration-300">
          <div className="mb-4 flex justify-between items-center border-b pb-2 border-primary/20">
            <h3 className="text-xl font-bold text-foreground">Medical Questionnaire</h3>
            <Badge variant="outline">Q {currentQuestion + 1} / {QUESTIONS.length}</Badge>
          </div>
          <div className="space-y-4">
            <p className="text-lg font-medium text-foreground">{QUESTIONS[currentQuestion].text}</p>
            <div className="grid gap-2">
              {QUESTIONS[currentQuestion].options.map((opt, id) => (
                <Button 
                  key={id} 
                  variant={answers[QUESTIONS[currentQuestion].id] === opt ? 'default' : 'outline'}
                  onClick={() => setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: opt })}
                  className="justify-start text-left h-auto py-3 px-4 font-normal"
                >
                  {opt}
                </Button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="ghost" 
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(prev => prev - 1)}
              >
                Previous
              </Button>
              {currentQuestion < QUESTIONS.length - 1 ? (
                <Button 
                  disabled={!answers[QUESTIONS[currentQuestion].id]}
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={submitQuiz}
                  disabled={!answers[QUESTIONS[currentQuestion].id]}
                >
                  Submit & Save
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Progress Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Daily Progress
            </CardTitle>
            <CardDescription>Your health activity today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1"><Footprints className="w-4 h-4" /> Steps</span>
                <span className="font-medium">{stats?.steps || 0} / 10000</span>
              </div>
              <Progress value={((stats?.steps || 0) / 10000) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1"><Droplets className="w-4 h-4" /> Water</span>
                <span className="font-medium">{stats?.water_ml || 0} / 3000 ml</span>
              </div>
              <Progress value={((stats?.water_ml || 0) / 3000) * 100} className="bg-blue-100 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Medicines/Reminders Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Pill className="w-12 h-12" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Medicines
            </CardTitle>
            <CardDescription>Scheduled medications and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length > 0 ? (
              <ul className="space-y-3">
                {reminders.slice(0, 5).map((reminder) => (
                  <li key={reminder.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{reminder.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {reminder.active && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No active medicines or reminders.</p>
            )}
          </CardContent>
        </Card>

        {/* Medical History / Diseases Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Thermometer className="w-12 h-12" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              Health History
            </CardTitle>
            <CardDescription>Known conditions and diseases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.health_history && user.health_history.length > 0 ? (
                user.health_history.map((disease, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1">
                    {disease}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 w-full text-center">No recorded medical conditions.</p>
              )}
            </div>
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <Heart className="w-3 h-3" /> Digital Twin Status
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your digital twin is syncronized with your latest data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
