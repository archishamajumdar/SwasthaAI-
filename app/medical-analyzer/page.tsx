'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { apiRequest, uploadFile } from '@/lib/api'

interface DocumentAnalysis {
  fileName: string
  type: string
  uploadDate: Date
  status: 'processing' | 'completed' | 'error'
  analysis: {
    findings: string[]
    values: Array<{ label: string; value: string; status: 'normal' | 'abnormal' | 'warning' }>
    recommendations: string[]
    handwritten_transcript?: string
    government_schemes?: any[]
    treatment_estimates?: any[]
  }
}

export default function MedicalAnalyzerPage() {
  const [documents, setDocuments] = useState<DocumentAnalysis[]>([
    {
      fileName: 'Blood Test Report - March 2026.pdf',
      type: 'Laboratory Report',
      uploadDate: new Date('2026-03-15'),
      status: 'completed',
      analysis: {
        findings: [
          'Slightly elevated cholesterol levels',
          'Blood glucose within normal range',
          'Thyroid function normal',
        ],
        values: [
          { label: 'Total Cholesterol', value: '220 mg/dL', status: 'abnormal' },
          { label: 'HDL Cholesterol', value: '45 mg/dL', status: 'warning' },
          { label: 'Blood Glucose', value: '98 mg/dL', status: 'normal' },
          { label: 'TSH Level', value: '2.5 mIU/L', status: 'normal' },
        ],
        recommendations: [
          'Increase physical activity to at least 150 minutes per week',
          'Reduce saturated fat intake',
          'Schedule follow-up test in 3 months',
        ],
      },
    },
    {
      fileName: 'ECG Report - February 2026.pdf',
      type: 'Cardiac Report',
      uploadDate: new Date('2026-02-28'),
      status: 'completed',
      analysis: {
        findings: ['Normal sinus rhythm', 'No significant arrhythmia detected'],
        values: [
          { label: 'Heart Rate', value: '72 bpm', status: 'normal' },
          { label: 'QT Interval', value: '420 ms', status: 'normal' },
        ],
        recommendations: ['Continue current routine', 'Annual follow-up recommended'],
      },
    },
  ])

  const [expandedDoc, setExpandedDoc] = useState<number | null>(0)
  const [docType, setDocType] = useState<'report' | 'prescription'>('report')

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const newDoc: DocumentAnalysis = {
      fileName: file.name,
      type: docType === 'prescription' ? 'Prescription' : 'Laboratory Report',
      uploadDate: new Date(),
      status: 'processing',
      analysis: { findings: [], values: [], recommendations: [] },
    }
    setDocuments([newDoc, ...documents])

    try {
      let result;
      if (docType === 'prescription') {
        result = await uploadFile('/medical/analyze-prescription', file)
        // Map backend prescription result to UI format
        newDoc.analysis.handwritten_transcript = result.handwritten_text_summary
        newDoc.analysis.findings = result.instructions ? [`Usage instructions: ${result.instructions}`] : []
        
        newDoc.analysis.values = (result.medications || []).map((m: any) => ({
          label: m.name,
          value: m.dosage,
          status: 'normal'
        }))
        newDoc.analysis.recommendations = result.doctor_notes ? [result.doctor_notes] : []
        newDoc.analysis.government_schemes = result.government_schemes || []
        newDoc.analysis.treatment_estimates = result.treatment_estimates || []
      } else {
        result = await uploadFile('/medical/analyze-report', file)
        // Map backend report result to UI format
        newDoc.analysis.findings = [result.summary]
        newDoc.analysis.values = (result.parameters || []).map((v: any) => ({
          label: v.name,
          value: `${v.value} ${v.unit}`,
          status: v.status.toLowerCase() as any
        }))
        newDoc.analysis.recommendations = [result.recommendations]
      }
      
      setDocuments(docs => docs.map(doc => 
        doc.fileName === file.name ? { ...newDoc, status: 'completed' } : doc
      ))
    } catch (error) {
      console.error('Analysis failed:', error)
      setDocuments(docs => docs.map(doc => 
        doc.fileName === file.name ? { ...doc, status: 'error' } : doc
      ))
    }
  }

  const getStatusColor = (status: DocumentAnalysis['analysis']['values'][0]['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'abnormal':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return ''
    }
  }

  return (
    <div className="w-full bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Medical Document Analyzer</h1>
          <p className="text-muted-foreground">
            Upload and analyze your medical reports with AI-powered insights
          </p>
        </div>

        {/* Selector Header */}
        <div className="flex justify-center gap-4 mb-6">
          <Button 
            variant={docType === 'report' ? 'default' : 'outline'}
            onClick={() => setDocType('report')}
            className="flex-1 max-w-[200px]"
          >
            Lab Report
          </Button>
          <Button 
            variant={docType === 'prescription' ? 'default' : 'outline'}
            onClick={() => setDocType('prescription')}
            className="flex-1 max-w-[200px]"
          >
            Prescription
          </Button>
        </div>

        {/* Upload Card */}
        <Card className="p-8 mb-8 border-2 border-dashed border-primary/30 bg-primary/5">
          <div className="text-center">
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Medical Documents</h3>
            <p className="text-sm text-muted-foreground mb-6">
              PDF, JPG, or PNG files. Maximum 10 MB per file.
            </p>
            <div className="flex flex-col items-center gap-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleUpload}
                accept=".pdf,.jpg,.png"
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()} size="lg" className="gap-2">
                <Upload className="w-4 h-4" />
                Select Files
              </Button>
            </div>
          </div>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card
                className="p-6 border border-border cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setExpandedDoc(expandedDoc === idx ? null : idx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{doc.fileName}</h3>
                        {doc.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {doc.status === 'processing' && (
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {doc.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{doc.status.toUpperCase()}</Badge>
                </div>
              </Card>

              {/* Expanded Content */}
              {expandedDoc === idx && doc.status === 'completed' && (
                <Card className="mt-4 p-6 border border-border bg-card/50">
                  {/* Decoded Handwriting */}
                  {doc.analysis.handwritten_transcript && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Decoded Doctor's Handwriting
                      </h4>
                      <p className="text-sm text-foreground whitespace-pre-line leading-relaxed italic">
                        "{doc.analysis.handwritten_transcript}"
                      </p>
                    </div>
                  )}

                  {/* Values Table */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-4">Test Values</h4>
                    <div className="space-y-3">
                      {doc.analysis.values.map((val, vidx) => (
                        <div key={vidx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <span className="text-sm text-muted-foreground">{val.label}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(val.status)}>
                              {val.value}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Key Findings</h4>
                    <ul className="space-y-2">
                      {doc.analysis.findings.map((finding, fidx) => (
                        <li key={fidx} className="flex gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {doc.analysis.recommendations.map((rec, ridx) => (
                        <li key={ridx} className="flex gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Government Schemes */}
                  {doc.analysis.government_schemes && doc.analysis.government_schemes.length > 0 && (
                    <div className="mb-6 border-t pt-4 border-border/40">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-primary">
                         Applicable Government Healthcare Schemes
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {doc.analysis.government_schemes.map((scheme: any, sidx: number) => (
                          <div key={sidx} className="p-4 bg-primary/5 rounded-xl border border-primary/10 hover:shadow-md transition-all">
                            <div className="font-semibold text-foreground text-sm mb-1">{scheme.scheme_name}</div>
                            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                              {scheme.benefits}
                            </p>
                            <p className="text-xs text-foreground/80 font-medium">
                              Eligibility: {scheme.eligibility}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
