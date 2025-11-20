import type { Patient } from '@/types/index'
import { Card, CardContent } from '@/components/ui/card'
import { User, Calendar, FileText, Shield } from 'lucide-react'

interface PatientHeaderProps {
  patient: Patient
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <Card className="mb-6 border-l-4 border-l-[#1e2951] shadow-lg bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e2951]/10 text-[#1e2951]">
              <User className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {patient.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Primary Care Provider: {patient.primaryCareProvider}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium text-foreground">{patient.dateOfBirth} ({patient.age}y)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">MRN</p>
                <p className="font-medium text-foreground">{patient.medicalRecordNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">Insurance</p>
                <p className="font-medium text-foreground">{patient.insurancePlan}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

