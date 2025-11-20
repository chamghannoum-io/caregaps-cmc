import { Card, CardContent } from '@/components/ui/card'
import { User, Calendar, UserCircle } from 'lucide-react'

interface PatientHeaderProps {
  patient: {
    name?: string
    dateOfBirth?: string
    age?: number | string
    gender?: string
    [key: string]: any
  }
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <Card className="mb-6 border-l-4 border-l-[#1e2951] shadow-lg bg-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e2951]/10 text-[#1e2951]">
            <User className="h-8 w-8" aria-hidden="true" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {patient.name || 'Patient'}
            </h1>
            
            <div className="flex gap-6 text-sm">
              {(patient.dateOfBirth || patient.age) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age / DOB</p>
                    <p className="font-medium text-foreground">
                      {patient.age && `${patient.age} years`}
                      {patient.age && patient.dateOfBirth && ' • '}
                      {patient.dateOfBirth}
                    </p>
                  </div>
                </div>
              )}
              
              {patient.gender && (
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground capitalize">{patient.gender}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

