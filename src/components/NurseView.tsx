import { useState, useEffect } from 'react'
import type { Question, QuestionAnswer } from '@/types/index'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PriorityBadge } from './PriorityBadge'
import { PatientHeader } from './PatientHeader'
import { CheckCircle, Info, Loader2, RefreshCw, AlertCircle, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { webhookService } from '@/services/webhookService'
import { supabaseService, type PatientFile } from '@/services/supabaseService'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'

interface NurseViewProps {
  questions?: Question[]
  onSubmit?: (answers: QuestionAnswer[]) => void
  onDashboardReceived?: (dashboardData: any) => void
  onPatientDataReceived?: (patientData: any) => void
  patientData?: any
}

/**
 * Map webhook response to Question format
 */
function mapWebhookToQuestions(webhookResponse: any): Question[] {
  // Handle array response (n8n returns array with one object)
  const responseData = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse
  
  if (!responseData?.data?.questions) {
    console.warn('⚠️ No questions found in webhook response')
    return []
  }

  const { questions } = responseData.data
  
  return questions.map((q: any, index: number): Question => {
    // Map clinical criticality to priority
    let priority: Question['priority'] = 'MEDIUM'
    if (q.clinicalCriticality === 'High') priority = 'HIGH'
    else if (q.clinicalCriticality === 'Medium') priority = 'MEDIUM'
    else if (q.clinicalCriticality === 'Low') priority = 'LOW'

    // Map field type
    let inputType: Question['inputType'] = 'yes_no'
    if (q.fieldType === 'date') {
      inputType = 'date'
    } else if (q.fieldType === 'number') {
      inputType = 'number'
    } else if (q.fieldType === 'dropdown' || q.fieldType === 'select') {
      inputType = 'dropdown'
    } else if (q.fieldType === 'radio') {
      inputType = 'yes_no'
    }

    // Extract options if available
    let options: string[] | undefined
    if (q.fieldOptions?.values) {
      options = q.fieldOptions.values.map((v: any) => v.option || v)
    }

    return {
      id: q.ruleId || `q${index + 1}`,
      question: q.fieldLabel || q.label || 'Question',
      inputType,
      priority,
      gapId: q.ruleId || `gap${index + 1}`,
      options,
      helpText: q.guideline ? `${q.guideline} (${q.category})` : undefined
    }
  })
}

export function NurseView({ questions: propQuestions, onSubmit, onDashboardReceived, onPatientDataReceived, patientData }: NurseViewProps) {
  // Patient selection state
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [patientsError, setPatientsError] = useState<string | null>(null)

  // Questionnaire state
  const [questions, setQuestions] = useState<Question[]>(propQuestions || [])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [webhookData, setWebhookData] = useState<any>(null)

  // Load patient files on mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true)
        setPatientsError(null)

        console.log('👥 Loading patient files from Supabase...')
        const files = await supabaseService.getPatientFiles()
        console.log('✅ Patient files loaded:', files)

        setPatientFiles(files)
      } catch (error) {
        console.error('❌ Failed to load patients:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setPatientsError(errorMessage)
      } finally {
        setLoadingPatients(false)
      }
    }

    loadPatients()
  }, [])

  // Handle patient selection
  const handlePatientSelect = async (patientPath: string) => {
    // Reset all state when selecting a new patient
    setSelectedPatient(patientPath)
    setLoading(true)
    setFetchError(null)
    setWebhookData(null)
    setQuestions([])
    setAnswers({})
    setErrors({})
    setSubmitted(false)

    try {
      console.log('👤 Patient selected:', patientPath)

      // Get the selected patient file
      const patientFile = patientFiles.find(p => p.path === patientPath)
      if (!patientFile) {
        throw new Error('Patient file not found')
      }

      // Fetch file content from Supabase
      console.log('📄 Fetching patient data...')
      const fileContent = await supabaseService.getPatientFileContent(patientFile.path, patientFile.bucket)
      console.log('✅ Patient data retrieved')

      // Post to n8n webhook
      console.log('📤 Sending patient data to n8n...')
      const response = await webhookService.fetchQuestionnaire(fileContent)
      console.log('✅ Questionnaire received from n8n:', response)

      // Check if response is empty
      if (!response || Object.keys(response).length === 0) {
        throw new Error('n8n returned an empty response')
      }

        setWebhookData(response)

        // Extract patient data from response
        const responseData = Array.isArray(response) ? response[0] : response
        if (responseData?.data?.patient && onPatientDataReceived) {
          const patientInfo = responseData.data.patient
          const patient = {
            id: patientInfo.patientId,
            name: patientInfo.patientName,
            dateOfBirth: patientInfo.dob || `${patientInfo.age} years old`,
            mrn: patientInfo.patientId,
            insurance: patientInfo.gender ? `${patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1)}` : 'Unknown'
          }
          onPatientDataReceived(patient)
        }

        // Map webhook data to Question[] format
        const mappedQuestions = mapWebhookToQuestions(response)
        console.log('📋 Mapped questions:', mappedQuestions)
        setQuestions(mappedQuestions)
    } catch (error) {
      console.error('❌ Failed to load questionnaire:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setFetchError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateAnswers = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    questions.forEach(question => {
      const answer = answers[question.id]
      if (!answer || answer.trim() === '') {
        newErrors[question.id] = 'This field is required'
      } else if (question.inputType === 'date') {
        const date = new Date(answer)
        if (isNaN(date.getTime())) {
          newErrors[question.id] = 'Please enter a valid date'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      return
    }

    const questionAnswers: QuestionAnswer[] = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id],
      answeredBy: 'Nurse',
      answeredAt: new Date().toISOString()
    }))

    // If using webhook, submit to webhook
    if (!propQuestions && webhookData) {
      try {
        setSubmitting(true)

        // Extract sessionId and resumeUrl from webhook response
        const responseData = Array.isArray(webhookData) ? webhookData[0] : webhookData
        const sessionId = responseData?.sessionId
        const resumeUrl = responseData?.resumeUrl

        // Format answers for n8n
        const formattedAnswers = questionAnswers.map((qa, index) => ({
          questionId: qa.questionId,
          question: questions[index]?.question || '',
          answer: qa.answer,
          answeredAt: qa.answeredAt
        }))

        const responsePayload = {
          action: 'submit_answers',
          sessionId: sessionId,
          answers: formattedAnswers,
          completed: true,
          completedAt: new Date().toISOString(),
          completedBy: 'Nurse',
          resumeUrl: resumeUrl
        }

        console.log('📤 Submitting to resumeUrl:', resumeUrl)
        const submitResponse = await webhookService.submitResponses(responsePayload, resumeUrl)
        console.log('✅ Submitted to webhook successfully')

        // Check if response contains dashboard data
        const dashboardResponse = Array.isArray(submitResponse) ? submitResponse[0] : submitResponse
        if (dashboardResponse?.action === 'display_dashboard' && dashboardResponse?.data) {
          console.log('📊 Dashboard data received from n8n')
          if (onDashboardReceived) {
            onDashboardReceived(dashboardResponse.data)
          }
        }
      } catch (error) {
        console.error('❌ Failed to submit to webhook:', error)
        alert('Failed to submit questionnaire. Check console for details.')
        setSubmitting(false)
        return
      } finally {
        setSubmitting(false)
      }
    }

    // If using prop callback, call it
    if (onSubmit) {
      onSubmit(questionAnswers)
    }

    setSubmitted(true)
  }

  const handleCancel = () => {
    setAnswers({})
    setErrors({})
  }

  // Loading patients state
  if (loadingPatients) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading patients from Supabase...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error loading patients
  if (patientsError) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<AlertCircle className="h-10 w-10 text-red-500" />}
            title="Failed to Load Patients"
            description={patientsError}
            action={
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  // Patient selector (no patient selected yet)
  if (!selectedPatient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-[#1e2951]" />
            Select Patient
          </CardTitle>
          <CardDescription>
            Choose a patient to load their questionnaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="patient-select" className="text-sm font-medium">Patient</label>
              <Select 
                id="patient-select"
                onChange={(e) => handlePatientSelect(e.target.value)} 
                value={selectedPatient}
                disabled={patientFiles.length === 0}
              >
                <option value="">Select a patient...</option>
                {patientFiles.map(patient => (
                  <option key={patient.path} value={patient.path}>
                    {patient.name}
                  </option>
                ))}
              </Select>
            </div>

            {patientFiles.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No patient files found in Supabase storage.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading questionnaire
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading questionnaire from n8n...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error loading questionnaire
  if (fetchError) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<AlertCircle className="h-10 w-10 text-red-500" />}
            title="Failed to Load Questionnaire"
            description={fetchError}
            action={
              <div className="flex gap-2">
                <Button onClick={() => setSelectedPatient('')} variant="outline">
                  Back to Patient Selection
                </Button>
                <Button onClick={() => handlePatientSelect(selectedPatient)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    )
  }

  // Show raw webhook data if no questions mapped yet
  if (!propQuestions && webhookData && questions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire Data from n8n</CardTitle>
            <CardDescription>
              Raw data received. Share this structure so we can format it properly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg overflow-auto max-h-96 border border-border">
              <pre className="text-xs text-foreground">{JSON.stringify(webhookData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={() => setSelectedPatient('')} variant="outline">
            Back to Patient Selection
          </Button>
          <Button onClick={() => handlePatientSelect(selectedPatient)} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Questionnaire Submitted Successfully!
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Your answers have been recorded and sent to n8n for processing.
        </p>
        <Button onClick={() => {
          setSelectedPatient('')
          setSubmitted(false)
          setAnswers({})
          setQuestions([])
          setWebhookData(null)
        }} variant="outline">
          Select Another Patient
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Patient Header */}
      {patientData && (
        <div className="mb-6 animate-slide-in">
          <PatientHeader patient={patientData} />
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Care Gap Questionnaire</CardTitle>
          <CardDescription>
            {questions.length} Priority Questions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id} className="border-l-4 border-l-primary/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Question {index + 1} of {questions.length}
                    </span>
                    <PriorityBadge priority={question.priority} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {question.question}
                  </h3>
                </div>
              </div>

              <div className="mb-4">
                {question.inputType === 'date' && (
                  <div>
                    <Input
                      type="date"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className={cn(
                        "max-w-md",
                        errors[question.id] && "border-red-500 focus-visible:ring-red-500"
                      )}
                      aria-label={question.question}
                      aria-invalid={!!errors[question.id]}
                      aria-describedby={errors[question.id] ? `error-${question.id}` : undefined}
                    />
                    {errors[question.id] && (
                      <p id={`error-${question.id}`} className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <span className="sr-only">Error:</span>
                        {errors[question.id]}
                      </p>
                    )}
                  </div>
                )}

                {question.inputType === 'yes_no' && (
                  <div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value="Yes"
                          checked={answers[question.id] === 'Yes'}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="h-5 w-5 cursor-pointer"
                          aria-label="Yes"
                        />
                        <span className="text-sm font-medium">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value="No"
                          checked={answers[question.id] === 'No'}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="h-5 w-5 cursor-pointer"
                          aria-label="No"
                        />
                        <span className="text-sm font-medium">No</span>
                      </label>
                    </div>
                    {errors[question.id] && (
                      <p id={`error-${question.id}`} className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <span className="sr-only">Error:</span>
                        {errors[question.id]}
                      </p>
                    )}
                  </div>
                )}

                {question.inputType === 'number' && (
                  <div>
                    <Input
                      type="number"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className={cn(
                        "max-w-md",
                        errors[question.id] && "border-red-500 focus-visible:ring-red-500"
                      )}
                      aria-label={question.question}
                      aria-invalid={!!errors[question.id]}
                    />
                    {errors[question.id] && (
                      <p className="text-sm text-red-600 mt-2">{errors[question.id]}</p>
                    )}
                  </div>
                )}

                {question.inputType === 'dropdown' && question.options && (
                  <div>
                    <select
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className={cn(
                        "flex h-10 w-full max-w-md rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        errors[question.id] && "border-red-500 focus-visible:ring-red-500"
                      )}
                      aria-label={question.question}
                    >
                      <option value="">Select an option</option>
                      {question.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors[question.id] && (
                      <p className="text-sm text-red-600 mt-2">{errors[question.id]}</p>
                    )}
                  </div>
                )}
              </div>

              {question.helpText && (
                <div className="flex items-start gap-2 text-sm p-3 rounded-md bg-blue-50 border border-blue-200">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-blue-900">Guideline:</p>
                    <p className="text-blue-700">{question.helpText}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8 gap-4">
        <Button variant="outline" onClick={handleCancel} size="lg">
          Cancel
        </Button>
        <Button onClick={handleSubmit} size="lg" className="min-w-[200px]" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Answers'
          )}
        </Button>
      </div>
    </div>
  )
}
