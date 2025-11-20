import { useState } from 'react'
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatientHeader } from './PatientHeader'
import { Toast } from './Toast'
import type { ToastType } from './Toast'
import { webhookService } from '@/services/webhookService'
import { 
  CheckCircle, 
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckSquare,
  FileText,
  RefreshCw,
  Inbox,
  Send,
  Loader2
} from 'lucide-react'
import { EmptyState } from './EmptyState'

interface DoctorViewProps {
  dashboardData?: any
  patientData?: any
  onReviewComplete?: () => void
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
  benefitsInfo?: {
    payerName: string
    memberId: string
    network: string
    classification: string
    benefitType: string
    benefitLabel: string
    isCovered: boolean
    accessMethod: string
    patientPays: string
    planPays: string
    coverageNotes: string
    requiresPreauth: boolean
    coverageStatus: string
    coverageLevel: 'FULL' | 'PARTIAL' | 'NONE'
    estimatedTotalCostAed: number
    estimatedPatientCostAed: number
  }
  nurseQuestionnaire: {
    wasAsked: boolean
    wasClosed: boolean
    askedBy: string | null
    patientAnswer: string | null
    closureReason: string | null
    status: string
  }
}

export function DoctorView({ dashboardData: propDashboardData, patientData, onReviewComplete }: DoctorViewProps) {
  const [dashboardData] = useState<any>(propDashboardData || null)
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ type: ToastType; title: string; description?: string } | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [actionsLog, setActionsLog] = useState<Array<{ gapId: string; action: string; timestamp: string }>>([])

  // Handle both data structures: direct data or nested under 'data' property
  const data = dashboardData?.data || dashboardData

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
    
    // Log the action
    setActionsLog(prev => [...prev, {
      gapId,
      action,
      timestamp: new Date().toISOString()
    }])
    
    const actionMessages: Record<string, { title: string; description: string }> = {
      mark_complete: { 
        title: 'Gap marked as complete',
        description: 'The care gap has been successfully marked as complete.'
      },
      schedule_appointment: { 
        title: 'Appointment scheduled',
        description: 'The appointment has been scheduled for this care gap.'
      },
      defer: { 
        title: 'Gap deferred',
        description: 'This care gap has been deferred for later review.'
      },
      request_referral: { 
        title: 'Referral request submitted',
        description: 'The referral request has been successfully submitted.'
      }
    }

    // Show toast notification
    const message = actionMessages[action] || { title: 'Action recorded', description: 'The action has been recorded.' }
    setToast({ type: 'success', ...message })
  }

  const handleCompleteReview = async () => {
    const sessionId = dashboardData?.sessionId
    const resumeUrl = dashboardData?.resumeUrl

    console.log('🔍 Debug - dashboardData:', dashboardData)
    console.log('🔍 Debug - sessionId:', sessionId)
    console.log('🔍 Debug - resumeUrl:', resumeUrl)

    if (!sessionId || !resumeUrl) {
      setToast({
        type: 'error',
        title: 'Cannot complete review',
        description: 'Missing session information. Please reload the page.'
      })
      return
    }

    try {
      setCompleting(true)

      // Prepare the review completion payload
      const completionPayload = {
        action: 'doctor_review_complete',
        sessionId: sessionId,
        reviewedBy: 'Doctor',
        reviewedAt: new Date().toISOString(),
        actionsLog: actionsLog,
        summary: {
          totalGaps: data?.summary?.total || 0,
          actionsPerformed: actionsLog.length,
          reviewCompleted: true
        },
        resumeUrl: resumeUrl
      }

      console.log('📤 Submitting doctor review to n8n:', completionPayload)
      await webhookService.submitResponses(completionPayload, resumeUrl)
      console.log('✅ Doctor review submitted successfully')

      setCompleted(true)
      setToast({
        type: 'success',
        title: 'Review Complete',
        description: 'Returning to nurse view for next patient...'
      })

      // Wait 2 seconds to show success message, then return to nurse view
      setTimeout(() => {
        if (onReviewComplete) {
          onReviewComplete()
        }
      }, 2000)
    } catch (error) {
      console.error('❌ Failed to submit doctor review:', error)
      setToast({
        type: 'error',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit review. Please try again.'
      })
    } finally {
      setCompleting(false)
    }
  }

  const renderGapRow = (gap: GapData) => {
    const isExpanded = expandedGaps.has(gap.ruleId)
    const status = gap.nurseQuestionnaire.status
    const wasClosed = status === 'CLOSED_BY_NURSE'
    const benefitsInfo = gap.benefitsInfo

    // Determine coverage badge
    const getCoverageBadge = () => {
      if (!benefitsInfo) {
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            No Info
          </Badge>
        )
      }

      if (benefitsInfo.coverageLevel === 'FULL') {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            ✓ Fully Covered
          </Badge>
        )
      } else if (benefitsInfo.coverageLevel === 'PARTIAL') {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
            Partial Coverage
          </Badge>
        )
      } else {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
            Not Covered
          </Badge>
        )
      }
    }

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
                    <Badge className="bg-green-600 text-white text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Closed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="p-4 text-center">
            {getCoverageBadge()}
          </td>
          <td className="p-4 text-sm text-foreground">
            {benefitsInfo?.benefitType || gap.essentialPlanCover}
          </td>
          <td className="p-4 text-sm">
            {benefitsInfo ? (
              <div className="space-y-1">
                <div className="text-green-700 font-medium">Plan: {benefitsInfo.planPays}</div>
                <div className="text-muted-foreground text-xs">Patient: {benefitsInfo.patientPays}</div>
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">N/A</span>
            )}
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
            <td colSpan={5} className="p-6">
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

                {benefitsInfo && (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-semibold text-sm mb-3 text-blue-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Insurance Coverage Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700"><span className="font-semibold">Network:</span> {benefitsInfo.network}</p>
                        <p className="text-blue-700"><span className="font-semibold">Payer:</span> {benefitsInfo.payerName}</p>
                        <p className="text-blue-700"><span className="font-semibold">Classification:</span> {benefitsInfo.classification}</p>
                      </div>
                      <div>
                        <p className="text-blue-700"><span className="font-semibold">Access Method:</span> {benefitsInfo.accessMethod}</p>
                        <p className="text-blue-700"><span className="font-semibold">Pre-auth Required:</span> {benefitsInfo.requiresPreauth ? 'Yes' : 'No'}</p>
                        <p className="text-blue-700"><span className="font-semibold">Benefit Label:</span> {benefitsInfo.benefitLabel}</p>
                        <p className="text-blue-700"><span className="font-semibold">Coverage Status:</span> {benefitsInfo.coverageStatus}</p>
                      </div>
                    </div>
                  </div>
                )}

                {gap.nurseQuestionnaire.wasAsked && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="font-semibold text-sm mb-1 text-green-900">Nurse Response:</p>
                    <p className="text-sm text-green-700">
                      {gap.nurseQuestionnaire.patientAnswer} - {gap.nurseQuestionnaire.closureReason}
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded text-sm border border-gray-200">
                  <p className="font-semibold mb-1 text-gray-900">Clinical Notes:</p>
                  <p className="text-gray-700">{gap.notesTOB}</p>
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
                <th className="text-center p-4 font-semibold text-sm w-40 text-foreground">Coverage</th>
                <th className="text-left p-4 font-semibold text-sm w-40 text-foreground">Benefit Type</th>
                <th className="text-left p-4 font-semibold text-sm w-32 text-foreground">Copay</th>
                <th className="text-left p-4 font-semibold text-sm w-40 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {gaps.map(gap => (
                <React.Fragment key={gap.ruleId}>
                  {renderGapRow(gap)}
                </React.Fragment>
              ))}
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
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      )}

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
              <p className="text-3xl font-bold text-foreground">{data?.summary?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Gaps</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{data?.summary?.closedByNurse || 0}</p>
              <p className="text-sm text-muted-foreground">Closed by Nurse</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{data?.summary?.requiresAction || 0}</p>
              <p className="text-sm text-muted-foreground">Requires Action</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{data?.summary?.highPriority || 0}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </div>
        </CardContent>
      </Card>

       {/* Benefits Summary */}
      {data?.benefitSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insurance Benefits Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-900">Fully Covered</span>
                  <span className="text-2xl font-bold text-green-600">{data.benefitSummary.fullyCovered}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-yellow-900">Partially Covered</span>
                  <span className="text-2xl font-bold text-yellow-600">{data.benefitSummary.partiallyCovered}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-red-900">Not Covered</span>
                  <span className="text-2xl font-bold text-red-600">{data.benefitSummary.notCovered}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">Insurance Network</p>
                  <p className="text-lg font-bold text-blue-900">{data.benefitSummary.network}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">Insurance Payer</p>
                  <p className="text-sm text-blue-900">{data.benefitSummary.payer}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

       {/* Primary Care Section */}
      {renderTable(
        'Primary Care',
        [
          ...(data?.covered?.primaryCare?.gaps || []),
          ...(data?.notCovered?.primaryCare?.gaps || [])
        ]
      )}

      {/* Referrals Section */}
      {renderTable(
        'Referrals',
        [
          ...(data?.covered?.specialist?.gaps || []),
          ...(data?.notCovered?.specialist?.gaps || [])
        ]
      )}

      {/* Complete Review Section */}
      {!completed && (
        <Card className="border-l-4 border-l-[#1e2951]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Complete Review</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your care gap review 
                  {actionsLog.length > 0 && ` • ${actionsLog.length} action${actionsLog.length > 1 ? 's' : ''} recorded`}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleCompleteReview}
                disabled={completing}
                className="min-w-[180px]"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Complete Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Confirmation */}
      {completed && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">Review Complete</h3>
                <p className="text-sm text-green-700">
                  Your care gap review has been successfully submitted and the workflow has been completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
