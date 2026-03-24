'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Zap, Shield, TrendingUp, Droplets } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-background">
      {/* Hero Section */}
      <section className="pt-12 px-6 md:pt-20 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-pretty animate-fadeInUp">
            Predict. Prevent. Personalize Healthcare
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto animate-fadeInUp delay-100">
            SwasthyaAI Twin+ uses advanced AI to analyze your health data and create a digital twin that predicts health risks before they happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-200">
            <Link href="/symptom-checker">
              <Button size="lg" className="gap-2 hover-lift">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/digital-twin">
              <Button size="lg" variant="outline" className="hover-lift">
                View Your Digital Twin
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground animate-fadeInUp">
            Advanced Health Intelligence
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Analysis',
                description: 'Get real-time health risk assessments powered by machine learning algorithms.',
              },
              {
                icon: Shield,
                title: 'Preventive Care',
                description: 'Identify health risks early and take proactive steps to prevent future issues.',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                description: 'Monitor your health trends over time with interactive visualizations and insights.',
              },
              {
                icon: Droplets,
                title: 'Health Goals',
                description: 'Track your water intake, steps, and get AI nutritional analysis of your meals.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card
                  key={idx}
                  className={`p-6 bg-card hover:shadow-lg transition-shadow border border-border hover-lift animate-scaleIn ${
                    idx === 0 ? 'delay-100' : idx === 1 ? 'delay-200' : 'delay-300'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 md:px-12 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'User Input', desc: 'Enter symptoms (text/voice) + basic details (age, gender, history).' },
              { step: '2', title: 'AI Processing', desc: 'LLM analyzes symptoms, predicts diseases, and assigns urgency levels.' },
              { step: '3', title: 'Digital Health Twin', desc: 'Stores data, tracks patterns, and predicts future health risks.' },
              { step: '4', title: 'Results Dashboard', desc: 'View likely diseases, urgency alerts, and precuations instantly.' },
              { step: '5', title: 'Doctor Recommendations', desc: 'Suggests nearby specialists filtered by experience and cost.' },
              { step: '6', title: 'Prescription Decoder', desc: 'OCR extracts medicines and instructions from prescription images.' },
              { step: '7', title: 'Affordable Care Layer', desc: 'Access Govt schemes and low-cost pharmacy/hospital alternatives.' },
              { step: '8', title: 'Continuous Monitoring', desc: 'Regular symptom logging for updated health predictions and alerts.' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Trusted by Healthcare Professionals
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '50K+', label: 'Active Users' },
              { stat: '98%', label: 'Accuracy Rate' },
              { stat: '2M+', label: 'Health Records' },
              { stat: '24/7', label: 'Available' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-card rounded-lg border border-border">
                <div className="text-3xl font-bold text-primary mb-2">{item.stat}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-primary/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your journey to preventive healthcare today.
          </p>
          <Link href="/symptom-checker">
            <Button size="lg" className="gap-2">
              Begin Assessment <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
