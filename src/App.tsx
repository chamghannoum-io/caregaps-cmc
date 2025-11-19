import { useState } from 'react'
import { PatientHeader } from './components/PatientHeader'
import { NurseView } from './components/NurseView'
import { DoctorView } from './components/DoctorView'
import { MobileWarning } from './components/MobileWarning'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { mockPatient, mockQuestions, mockCareGaps } from './data/mockData'
import type { QuestionAnswer, CareGap } from './types/index'

function App() {
  const [activeTab, setActiveTab] = useState<string>('nurse')
  const [careGaps, setCareGaps] = useState<CareGap[]>(mockCareGaps)

  const handleQuestionnaireSubmit = (answers: QuestionAnswer[]) => {
    // Update care gaps based on questionnaire answers
    const updatedGaps = careGaps.map(gap => {
      const relatedAnswer = answers.find(a => 
        mockQuestions.find(q => q.id === a.questionId && q.gapId === gap.id)
      )

      if (relatedAnswer) {
        // If answer is "Yes", close the gap
        if (relatedAnswer.answer === 'Yes') {
          return {
            ...gap,
            status: 'CLOSED' as const,
            nurseStatus: 'CLOSED' as const,
            nurseAnswer: 'Yes'
          }
        } else {
          // If answer is "No" or a date, mark as asked but open
          return {
            ...gap,
            status: 'OPEN' as const,
            nurseStatus: 'ASKED_OPEN' as const,
            nurseAnswer: typeof relatedAnswer.answer === 'string' ? relatedAnswer.answer : JSON.stringify(relatedAnswer.answer)
          }
        }
      }

      return gap
    })

    setCareGaps(updatedGaps)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB', backgroundImage: 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Skip Links for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>

        {/* Patient Header */}
        <header className="animate-slide-in">
          <PatientHeader patient={mockPatient} />
        </header>

        {/* Mobile Warning */}
        <MobileWarning />

        {/* Main Content */}
        <main id="main-content" className="animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="nurse" className="px-6">
                Nurse View
              </TabsTrigger>
              <TabsTrigger value="doctor" className="px-6">
                Doctor View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nurse">
              <div role="region" aria-label="Nurse questionnaire view">
                <NurseView
                  questions={mockQuestions}
                  onSubmit={handleQuestionnaireSubmit}
                />
              </div>
            </TabsContent>

            <TabsContent value="doctor">
              <div role="region" aria-label="Doctor care gap management view">
                <DoctorView gaps={careGaps} />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Care Gap Management System © 2025</p>
        </footer>
      </div>
    </div>
  )
}

export default App
