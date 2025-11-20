import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatientHeader } from './PatientHeader'
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
  patientData?: any
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

export function DoctorView({ dashboardData: propDashboardData, patientData }: DoctorViewProps) {
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

  const renderGapRow = (gap: GapData) => {
    const isExpanded = expandedGaps.has(gap.ruleId)
    const status = gap.nurseQuestionnaire.status
    const wasClosed = status === 'CLOSED_BY_NURSE'

    return (
      <>
        {/* Main Row */}
        <tr 
          key={gap.ruleId}
          className={`border-b border-border hover:bg-muted/50 cursor-pointer ${wasClosed ? 'bg-green-50' : 'bg-card'}`}
          onClick={() => toggleGap(gap.ruleId)}
        >
          <td className="p-4">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div>
                <p className="font-semibold text-sm text-foreground">{gap.guideline}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={gap.clinicalCriticality === 'High' ? 'destructive' : gap.clinicalCriticality === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                    {gap.clinicalCriticality}
                  </Badge>
                  {wasClosed && (
                    <Badge className="bg-green-600 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Closed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="p-4 text-center">
            {gap.isCovered ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✓ Covered
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not Covered
              </Badge>
            )}
          </td>
          <td className="p-4 text-sm text-muted-foreground">
            {gap.essentialPlanCover}
          </td>
          <td className="p-4" onClick={(e) => e.stopPropagation()}>
            {!wasClosed && (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction(gap.ruleId, 'mark_complete')}
                  title="Mark Complete"
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction(gap.ruleId, 'schedule_appointment')}
                  title="Schedule"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction(gap.ruleId, 'defer')}
                  title="Defer"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                {gap.requiresReferral && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleAction(gap.ruleId, 'request_referral')}
                    title="Request Referral"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </td>
        </tr>

        {/* Expanded Details Row */}
        {isExpanded && (
          <tr key={`${gap.ruleId}-details`} className="border-b border-border bg-muted/30">
            <td colSpan={4} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Gap Description</h4>
                    <p className="text-sm text-muted-foreground">{gap.gap}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">Recommended Action</h4>
                    <p className="text-sm text-muted-foreground">{gap.recommendedAction}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm text-foreground">
                  <div>
                    <span className="font-semibold">Primary:</span> {gap.primarySpeciality}
                  </div>
                  <div>
                    <span className="font-semibold">Supporting:</span> {gap.supportingSpeciality}
                  </div>
                  <div>
                    <span className="font-semibold">Category:</span> {gap.category}
                  </div>
                  <div>
                    <span className="font-semibold">Referral:</span> {gap.requiresReferral ? 'Yes' : 'No'}
                  </div>
                </div>

                {gap.nurseQuestionnaire.wasAsked && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="font-semibold text-sm mb-1 text-green-900">Nurse Response:</p>
                    <p className="text-sm text-green-700">
                      {gap.nurseQuestionnaire.patientAnswer} - {gap.nurseQuestionnaire.closureReason}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded text-sm border border-blue-200">
                  <p className="font-semibold mb-1 text-blue-900">Notes:</p>
                  <p className="text-blue-800">{gap.notesTOB}</p>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    )
  }

  const renderTable = (title: string, gaps: GapData[]) => {
    if (gaps.length === 0) return null

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
          {title}
          <Badge variant="outline">{gaps.length} gaps</Badge>
        </h2>

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm text-foreground">Gap / Guideline</th>
                <th className="text-center p-4 font-semibold text-sm w-32 text-foreground">Covered</th>
                <th className="text-left p-4 font-semibold text-sm w-48 text-foreground">Practice Standard</th>
                <th className="text-left p-4 font-semibold text-sm w-40 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {gaps.map(gap => renderGapRow(gap))}
            </tbody>
          </table>
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
            icon={<Inbox className="h-10 w-10 text-[#1e2951]" />}
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
      {/* Patient Header */}
      {patientData && (
        <div className="animate-slide-in">
          <PatientHeader patient={patientData} />
        </div>
      )}

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
              <p className="text-3xl font-bold text-foreground">{dashboardData.summary.total}</p>
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

      {/* Primary Care Section */}
      {renderTable(
        'Primary Care',
        [
          ...dashboardData.covered.primaryCare.gaps,
          ...dashboardData.notCovered.primaryCare.gaps
        ]
      )}

      {/* Referrals Section */}
      {renderTable(
        'Referrals',
        [
          ...dashboardData.covered.specialist.gaps,
          ...dashboardData.notCovered.specialist.gaps
        ]
      )}
    </div>
  )
}
