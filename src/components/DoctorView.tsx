import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckSquare,
  FileText,
  RefreshCw,
  Inbox
} from 'lucide-react'
import { EmptyState } from './EmptyState'

interface DoctorViewProps {
  dashboardData?: DashboardData | null
}

interface GapData {
  ruleId: string
  guideline: string
  category: string
  gap: string
  questionText: string
  responseFormat: string
  expectedAnswer: string
  clinicalCriticality: 'High' | 'Medium' | 'Low'
  recommendedAction: string
  notesTOB: string
  essentialPlanCover: string
  isCovered: boolean
  primarySpeciality: string
  supportingSpeciality: string
  requiresReferral: boolean
  nurseQuestionnaire: {
    wasAsked: boolean
    wasClosed: boolean
    askedBy: string | null
    patientAnswer: string | null
    closureReason: string | null
    status: string
  }
}

interface DashboardData {
  patientId: string
  summary: {
    total: number
    closedByNurse: number
    requiresAction: number
    highPriority: number
  }
  covered: {
    primaryCare: { count: number; gaps: GapData[] }
    specialist: { count: number; gaps: GapData[] }
  }
  notCovered: {
    primaryCare: { count: number; gaps: GapData[] }
    specialist: { count: number; gaps: GapData[] }
  }
}

export function DoctorView({ dashboardData: propDashboardData }: DoctorViewProps) {
  const [dashboardData] = useState<DashboardData | null>(propDashboardData || null)
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set())

  const toggleGap = (gapId: string) => {
    setExpandedGaps(prev => {
      const next = new Set(prev)
      if (next.has(gapId)) {
        next.delete(gapId)
      } else {
        next.add(gapId)
      }
      return next
    })
  }

  const handleAction = (gapId: string, action: string) => {
    console.log(`Action ${action} on gap ${gapId}`)
    
    const actionMessages: Record<string, string> = {
      mark_complete: '✓ Gap marked as complete',
      schedule_appointment: '📅 Appointment scheduled',
      defer: '⏰ Gap deferred for later review',
      request_referral: '📄 Referral request submitted'
    }

    // TODO: Send action back to n8n for logging
    alert(actionMessages[action] || 'Action recorded')
  }

  const renderGapCard = (gap: GapData) => {
    const isExpanded = expandedGaps.has(gap.ruleId)
    const status = gap.nurseQuestionnaire.status
    const wasClosed = status === 'CLOSED_BY_NURSE'

    return (
      <Card 
        key={gap.ruleId} 
        className={`mb-3 ${wasClosed ? 'border-green-200 bg-green-50' : ''}`}
      >
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors pb-4"
          onClick={() => toggleGap(gap.ruleId)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <CardTitle className="text-base">{gap.guideline}</CardTitle>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={gap.clinicalCriticality === 'High' ? 'destructive' : gap.clinicalCriticality === 'Medium' ? 'default' : 'secondary'}>
                  {gap.clinicalCriticality}
                </Badge>
                
                {wasClosed ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Closed by Nurse
                  </Badge>
                ) : status === 'NOT_ASKED' ? (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Requires Action
                  </Badge>
                ) : null}

                <Badge variant="outline">{gap.category}</Badge>
              </div>

              {wasClosed && gap.nurseQuestionnaire.patientAnswer && (
                <p className="text-sm text-green-700 mt-2">
                  Nurse: {gap.nurseQuestionnaire.patientAnswer} - {gap.nurseQuestionnaire.closureReason}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 border-t">
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Gap Description</h4>
                <p className="text-sm text-muted-foreground">{gap.gap}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Recommended Action</h4>
                <p className="text-sm text-muted-foreground">{gap.recommendedAction}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Primary Specialty:</span> {gap.primarySpeciality}
                </div>
                <div>
                  <span className="font-semibold">Supporting:</span> {gap.supportingSpeciality}
                </div>
                <div>
                  <span className="font-semibold">Referral Required:</span> {gap.requiresReferral ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-semibold">Coverage:</span> {gap.essentialPlanCover}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm">
                <p className="font-semibold mb-1">Notes:</p>
                <p className="text-muted-foreground">{gap.notesTOB}</p>
              </div>

              {!wasClosed && (
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleAction(gap.ruleId, 'mark_complete')}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAction(gap.ruleId, 'schedule_appointment')}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAction(gap.ruleId, 'defer')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Defer
                  </Button>
                  {gap.requiresReferral && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAction(gap.ruleId, 'request_referral')}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Request Referral
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  const renderSection = (title: string, primaryGaps: GapData[], specialistGaps: GapData[]) => {
    if (primaryGaps.length === 0 && specialistGaps.length === 0) return null

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          {title}
          <Badge variant="outline">{primaryGaps.length + specialistGaps.length} gaps</Badge>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Care Column */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-teal-700">
              Primary Care ({primaryGaps.length})
            </h3>
            {primaryGaps.length > 0 ? (
              <div>{primaryGaps.map(gap => renderGapCard(gap))}</div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No primary care gaps</p>
            )}
          </div>

          {/* Specialist Column */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-700">
              Specialist ({specialistGaps.length})
            </h3>
            {specialistGaps.length > 0 ? (
              <div>{specialistGaps.map(gap => renderGapCard(gap))}</div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specialist gaps</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Waiting for dashboard data
  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<Inbox className="h-10 w-10 text-teal-500" />}
            title="Waiting for Questionnaire Data"
            description="The dashboard will automatically populate after the nurse completes and submits a patient questionnaire."
            action={
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Care Gap Dashboard</CardTitle>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{dashboardData.summary.total}</p>
              <p className="text-sm text-muted-foreground">Total Gaps</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{dashboardData.summary.closedByNurse}</p>
              <p className="text-sm text-muted-foreground">Closed by Nurse</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{dashboardData.summary.requiresAction}</p>
              <p className="text-sm text-muted-foreground">Requires Action</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{dashboardData.summary.highPriority}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Essential Plan Covered Section */}
      {renderSection(
        '✓ Essential Plan Covered',
        dashboardData.covered.primaryCare.gaps,
        dashboardData.covered.specialist.gaps
      )}

      {/* Best Practice Standards Section */}
      {renderSection(
        '◆ Best Practice Standards',
        dashboardData.notCovered.primaryCare.gaps,
        dashboardData.notCovered.specialist.gaps
      )}
    </div>
  )
}
