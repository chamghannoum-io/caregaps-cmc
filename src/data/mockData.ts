import type { Patient, Question, CareGap } from '@/types/index'

export const mockPatient: Patient = {
  id: 'P001',
  name: 'Sarah Johnson',
  dateOfBirth: '1965-05-15',
  age: 58,
  medicalRecordNumber: 'MRN-2024-001',
  insurancePlan: 'Medicare Advantage',
  primaryCareProvider: 'Dr. Emily Chen'
}

export const mockQuestions: Question[] = [
  {
    id: 'Q1',
    question: 'When was your last blood pressure check?',
    priority: 'HIGH',
    inputType: 'date',
    helpText: 'This helps us track your cardiovascular health',
    gapId: 'G3'
  },
  {
    id: 'Q2',
    question: 'Have you been screened for hepatitis C?',
    priority: 'MEDIUM',
    inputType: 'yes_no',
    helpText: 'One-time screening is recommended for adults born 1945-1965',
    gapId: 'G2'
  },
  {
    id: 'Q3',
    question: 'Did you receive a flu shot this season?',
    priority: 'HIGH',
    inputType: 'yes_no',
    helpText: 'Annual flu vaccination is recommended for all adults',
    gapId: 'G1'
  }
]

export const mockCareGaps: CareGap[] = [
  {
    id: 'G1',
    title: 'Flu Shot',
    guideline: 'Annual influenza vaccination',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'COVERED',
    referralRequired: false,
    status: 'CLOSED',
    priority: 'HIGH',
    nurseStatus: 'CLOSED',
    nurseAnswer: 'Yes',
    recommendedAction: 'Annual flu vaccination completed',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G2',
    title: 'Hep C Screening',
    guideline: 'One-time hepatitis C screening',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'COVERED',
    referralRequired: false,
    status: 'CLOSED',
    priority: 'MEDIUM',
    nurseStatus: 'CLOSED',
    nurseAnswer: 'Yes',
    recommendedAction: 'Screening completed',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G3',
    title: 'BP Check',
    guideline: 'Blood pressure screening',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'COVERED',
    referralRequired: false,
    status: 'OPEN',
    priority: 'HIGH',
    nurseStatus: 'ASKED_OPEN',
    nurseAnswer: '2020-01-15 (too old)',
    recommendedAction: 'Schedule BP check - last check over 3 years ago',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G4',
    title: 'Diabetes Screening',
    guideline: 'Screen for Type 2 Diabetes',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'NOT_COVERED',
    estimatedCost: 75,
    referralRequired: false,
    status: 'PRIORITY',
    priority: 'HIGH',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'Screen using FPG, 2-hour postload, or HbA1c',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G5',
    title: 'Lipid Panel',
    guideline: 'Cholesterol screening',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'NOT_COVERED',
    estimatedCost: 50,
    referralRequired: false,
    status: 'PRIORITY',
    priority: 'HIGH',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'Order lipid panel for cardiovascular risk assessment',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G6',
    title: 'Preventive Visit',
    guideline: 'Annual wellness visit',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'NOT_COVERED',
    estimatedCost: 150,
    referralRequired: false,
    status: 'OPEN',
    priority: 'MEDIUM',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'Schedule annual wellness visit',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G7',
    title: 'Pap Test',
    guideline: 'Cervical cancer screening',
    category: 'Womens Health',
    specialty: 'OB_GYN',
    coverage: 'NOT_COVERED',
    estimatedCost: 85,
    referralRequired: true,
    status: 'PRIORITY',
    priority: 'HIGH',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'Schedule Pap test with OB/GYN',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G8',
    title: 'HPV Test',
    guideline: 'HPV screening',
    category: 'Womens Health',
    specialty: 'OB_GYN',
    coverage: 'NOT_COVERED',
    estimatedCost: 95,
    referralRequired: true,
    status: 'PRIORITY',
    priority: 'HIGH',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'HPV testing for cervical cancer prevention',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G9',
    title: 'Colonoscopy',
    guideline: 'Colorectal cancer screening',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'NOT_COVERED',
    estimatedCost: 2500,
    referralRequired: true,
    status: 'OPEN',
    priority: 'HIGH',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'Schedule colonoscopy screening',
    lastUpdated: '2025-11-19'
  },
  {
    id: 'G10',
    title: 'Bone Density Scan',
    guideline: 'Osteoporosis screening',
    category: 'Adult Primary Care',
    specialty: 'PRIMARY_CARE',
    coverage: 'NOT_COVERED',
    estimatedCost: 200,
    referralRequired: false,
    status: 'OPEN',
    priority: 'MEDIUM',
    nurseStatus: 'NOT_ASKED',
    recommendedAction: 'DEXA scan for osteoporosis screening',
    lastUpdated: '2025-11-19'
  }
]

