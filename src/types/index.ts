export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  age: number
  medicalRecordNumber: string
  insurancePlan: string
  primaryCareProvider: string
}

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type GapStatus = 'CLOSED' | 'OPEN' | 'PRIORITY' | 'PENDING'
export type Coverage = 'COVERED' | 'NOT_COVERED'
export type Specialty = 'PRIMARY_CARE' | 'SPECIALIST' | 'OB_GYN' | 'ENDOCRINOLOGY'

export interface Question {
  id: string
  question: string
  priority: Priority
  inputType: 'date' | 'yes_no' | 'number' | 'blood_pressure' | 'dropdown'
  options?: string[]
  helpText?: string
  gapId: string
}

export interface QuestionAnswer {
  questionId: string
  answer: string | { systolic: number; diastolic: number }
  answeredBy: string
  answeredAt: string
}

export interface CareGap {
  id: string
  title: string
  guideline: string
  category: string
  specialty: Specialty
  coverage: Coverage
  estimatedCost?: number
  referralRequired: boolean
  status: GapStatus
  priority: Priority
  nurseStatus: 'NOT_ASKED' | 'ASKED_OPEN' | 'CLOSED'
  nurseAnswer?: string
  recommendedAction: string
  lastUpdated: string
}

export interface GapGroup {
  specialty: string
  coverage: Coverage
  gaps: CareGap[]
}

