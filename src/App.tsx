import { useState } from 'react'
import { NurseView } from './components/NurseView'
import { DoctorView } from './components/DoctorView'
import { MobileWarning } from './components/MobileWarning'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'

function App() {
  const [activeTab, setActiveTab] = useState<string>('nurse')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [patientData, setPatientData] = useState<any>(null)

  const handleDashboardReceived = (data: any) => {
    console.log('📊 Dashboard data received in App:', data)
    setDashboardData(data)
    // Automatically switch to doctor view when dashboard data is received
    setActiveTab('doctor')
  }

  const handlePatientDataReceived = (data: any) => {
    console.log('👤 Patient data received in App:', data)
    setPatientData(data)
  }

  const handleReviewComplete = () => {
    console.log('✅ Review complete, returning to nurse view')
    // Reset data and return to nurse view
    setDashboardData(null)
    setPatientData(null)
    setActiveTab('nurse')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#1e2951] shadow-lg border-b border-gray-300">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xl text-white">
                iO
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Care Gap Management</h1>
                <p className="text-xs text-white/90">Healthcare Quality & Performance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Skip Links for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>

        {/* Mobile Warning */}
        <MobileWarning />

        {/* Main Content - Tabs at the top */}
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
                  onDashboardReceived={handleDashboardReceived}
                  onPatientDataReceived={handlePatientDataReceived}
                  patientData={patientData}
                />
              </div>
            </TabsContent>

            <TabsContent value="doctor">
              <div role="region" aria-label="Doctor care gap management view">
                <DoctorView 
                  dashboardData={dashboardData}
                  patientData={patientData}
                  onReviewComplete={handleReviewComplete}
                />
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
