import { useState } from 'react'
import { PatientHeader } from './components/PatientHeader'
import { NurseView } from './components/NurseView'
import { DoctorView } from './components/DoctorView'
import { MobileWarning } from './components/MobileWarning'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { mockPatient } from './data/mockData'

function App() {
  const [activeTab, setActiveTab] = useState<string>('nurse')
  const [dashboardData, setDashboardData] = useState<any>(null)

  const handleDashboardReceived = (data: any) => {
    console.log('📊 Dashboard data received in App:', data)
    setDashboardData(data)
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
                        <NurseView onDashboardReceived={handleDashboardReceived} />
                      </div>
                    </TabsContent>

            <TabsContent value="doctor">
              <div role="region" aria-label="Doctor care gap management view">
                <DoctorView dashboardData={dashboardData} />
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
