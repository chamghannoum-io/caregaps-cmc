import { useState } from 'react'
import type { Question, QuestionAnswer } from '@/types/index'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PriorityBadge } from './PriorityBadge'
import { CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NurseViewProps {
  questions: Question[]
  onSubmit: (answers: QuestionAnswer[]) => void
}

export function NurseView({ questions, onSubmit }: NurseViewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = () => {
    if (!validateAnswers()) {
      return
    }

    const questionAnswers: QuestionAnswer[] = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id],
      answeredBy: 'Nurse',
      answeredAt: new Date().toISOString()
    }))

    onSubmit(questionAnswers)
    setSubmitted(true)
  }

  const handleCancel = () => {
    setAnswers({})
    setErrors({})
  }

  if (submitted) {
    const closedCount = questions.filter(q => answers[q.id] === 'Yes' || answers[q.id]).length
    const openCount = questions.filter(q => answers[q.id] === 'No').length

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Questionnaire Submitted Successfully!
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Your answers have been recorded and the care gaps have been updated.
        </p>
        <div className="flex gap-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{closedCount}</p>
            <p className="text-sm text-muted-foreground">Gaps Closed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{openCount}</p>
            <p className="text-sm text-muted-foreground">Still Open</p>
          </div>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          View Updated Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
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
                        "flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
                <div className="flex items-start gap-2 text-sm p-3 rounded-md" style={{ backgroundColor: '#f0fdfa', color: '#0f766e' }}>
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#14b8a6' }} aria-hidden="true" />
                  <p>{question.helpText}</p>
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
        <Button onClick={handleSubmit} size="lg" className="min-w-[200px]">
          Submit Answers
        </Button>
      </div>
    </div>
  )
}

