'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Clock, CheckCircle2, AlertCircle, Pill } from 'lucide-react'

interface Medicine {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  reason: string
  sideEffects: string
  status: 'taken' | 'pending' | 'missed'
  nextDose: Date
  refillDate: Date
  refillsRemaining: number
}

export default function RemindersPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      times: ['08:00 AM'],
      reason: 'Blood Pressure Management',
      sideEffects: 'Dizziness, dry cough',
      status: 'taken',
      nextDose: new Date(new Date().setHours(8, 0, 0)),
      refillDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      refillsRemaining: 3,
    },
    {
      id: '2',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      times: ['08:00 PM'],
      reason: 'Cholesterol Control',
      sideEffects: 'Muscle pain, headache',
      status: 'pending',
      nextDose: new Date(new Date().setHours(20, 0, 0)),
      refillDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      refillsRemaining: 2,
    },
    {
      id: '3',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      times: ['08:00 AM', '08:00 PM'],
      reason: 'Diabetes Management',
      sideEffects: 'Nausea, upset stomach',
      status: 'missed',
      nextDose: new Date(new Date().setHours(8, 0, 0)),
      refillDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      refillsRemaining: 1,
    },
    {
      id: '4',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      times: ['08:00 AM'],
      reason: 'Heart Health',
      sideEffects: 'Mild stomach upset',
      status: 'taken',
      nextDose: new Date(new Date().setHours(8, 0, 0)),
      refillDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      refillsRemaining: 5,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)

  const getStatusColor = (status: Medicine['status']) => {
    switch (status) {
      case 'taken':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'missed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: Medicine['status']) => {
    switch (status) {
      case 'taken':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'missed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const toggleStatus = (id: string) => {
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          return {
            ...med,
            status: med.status === 'taken' ? 'pending' : 'taken',
          }
        }
        return med
      })
    )
  }

  const pendingMedicines = medicines.filter((m) => m.status === 'pending')
  const takenToday = medicines.filter((m) => m.status === 'taken').length
  const missedDoses = medicines.filter((m) => m.status === 'missed').length
  const needsRefill = medicines.filter((m) => m.refillsRemaining <= 1).length

  return (
    <div className="w-full bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Medicine Reminders</h1>
          <p className="text-muted-foreground">
            Track your medications and never miss a dose
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Pending Today</p>
            <p className="text-2xl font-bold text-primary">{pendingMedicines.length}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Taken Today</p>
            <p className="text-2xl font-bold text-green-600">{takenToday}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Missed Doses</p>
            <p className="text-2xl font-bold text-red-600">{missedDoses}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Need Refill</p>
            <p className="text-2xl font-bold text-yellow-600">{needsRefill}</p>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Today's Schedule</h2>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-6 mb-6 border-2 border-primary/20 bg-primary/5">
              <div className="space-y-4">
                <Input placeholder="Medicine name" className="w-full" />
                <Input placeholder="Dosage (e.g., 10mg)" className="w-full" />
                <Input placeholder="Frequency (e.g., Once daily)" className="w-full" />
                <Input placeholder="Reason for taking" className="w-full" />
                <div className="flex gap-2">
                  <Button className="flex-1">Add Medicine</Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Medicines List */}
          <div className="space-y-4">
            {medicines.map((medicine, idx) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card
                  className="p-6 border border-border cursor-pointer hover:shadow-lg transition-all"
                >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <button
                    onClick={() => toggleStatus(medicine.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {getStatusIcon(medicine.status)}
                  </button>

                  {/* Medicine Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {medicine.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {medicine.dosage} • {medicine.frequency}
                        </p>
                      </div>
                      <Badge className={getStatusColor(medicine.status)}>
                        {medicine.status.charAt(0).toUpperCase() +
                          medicine.status.slice(1)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      Reason: {medicine.reason}
                    </p>

                    {/* Times */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {medicine.times.map((time, idx) => (
                        <Badge key={idx} variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {time}
                        </Badge>
                      ))}
                    </div>

                    {/* Details */}
                    <details className="group">
                      <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                        <span className="group-open:rotate-180 transition-transform">▶</span>
                        More Details
                      </summary>
                      <div className="mt-4 ml-6 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Side Effects</p>
                          <p className="text-sm text-foreground">{medicine.sideEffects}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Refill in {Math.ceil((medicine.refillDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days ({medicine.refillsRemaining} refills remaining)
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <Card className="p-6 border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Emergency Support
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                If you experience severe side effects, call emergency services or visit the nearest hospital. Keep this number handy: 911 (US) or your local emergency number.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
