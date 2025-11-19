import { useState, useMemo } from 'react'
import type { CareGap, Coverage, GapStatus } from '@/types/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { CoverageBadge } from './CoverageBadge'
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Calendar, 
  FileDown, 
  Mail,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DoctorViewProps {
  gaps: CareGap[]
}

interface FilterState {
  coverage: 'ALL' | Coverage
  specialty: string
  status: 'ALL' | GapStatus
}

export function DoctorView({ gaps }: DoctorViewProps) {
  const [filters, setFilters] = useState<FilterState>({
    coverage: 'ALL',
    specialty: 'ALL',
    status: 'ALL'
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['covered-primary', 'notcovered-primary']))
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set())

  // Calculate statistics
  const stats = useMemo(() => {
    const total = gaps.length
    const closed = gaps.filter(g => g.status === 'CLOSED').length
    const open = gaps.filter(g => g.status === 'OPEN' || g.status === 'PRIORITY').length
    const priority = gaps.filter(g => g.priority === 'HIGH').length
    
    return { total, closed, open, priority }
  }, [gaps])

  // Filter gaps
  const filteredGaps = useMemo(() => {
    return gaps.filter(gap => {
      if (filters.coverage !== 'ALL' && gap.coverage !== filters.coverage) return false
      if (filters.specialty !== 'ALL' && gap.specialty !== filters.specialty) return false
      if (filters.status !== 'ALL' && gap.status !== filters.status) return false
      return true
    })
  }, [gaps, filters])

  // Group gaps by coverage and specialty
  const groupedGaps = useMemo(() => {
    const groups: Record<string, { title: string; coverage: Coverage; gaps: CareGap[] }> = {}
    
    filteredGaps.forEach(gap => {
      const key = `${gap.coverage.toLowerCase()}-${gap.specialty.toLowerCase()}`
      
      if (!groups[key]) {
        groups[key] = {
          title: formatSpecialty(gap.specialty),
          coverage: gap.coverage,
          gaps: []
        }
      }
      
      groups[key].gaps.push(gap)
    })
    
    return groups
  }, [filteredGaps])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const toggleGap = (gapId: string) => {
    setExpandedGaps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gapId)) {
        newSet.delete(gapId)
      } else {
        newSet.add(gapId)
      }
      return newSet
    })
  }

  const coveredGroups = Object.entries(groupedGaps).filter(([_, group]) => group.coverage === 'COVERED')
  const notCoveredGroups = Object.entries(groupedGaps).filter(([_, group]) => group.coverage === 'NOT_COVERED')

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Gaps</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
              <p className="text-sm text-muted-foreground mt-1">Closed by Nurse</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.open}</p>
              <p className="text-sm text-muted-foreground mt-1">Requires Action</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.priority}</p>
              <p className="text-sm text-muted-foreground mt-1">High Priority</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.coverage}
                onChange={(e) => setFilters(prev => ({ ...prev, coverage: e.target.value as FilterState['coverage'] }))}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Filter by coverage"
              >
                <option value="ALL">All Coverage</option>
                <option value="COVERED">Covered</option>
                <option value="NOT_COVERED">Not Covered</option>
              </select>

              <select
                value={filters.specialty}
                onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Filter by specialty"
              >
                <option value="ALL">All Specialties</option>
                <option value="PRIMARY_CARE">Primary Care</option>
                <option value="SPECIALIST">Specialist</option>
                <option value="OB_GYN">OB/GYN</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Filter by status"
              >
                <option value="ALL">All Status</option>
                <option value="CLOSED">Closed</option>
                <option value="OPEN">Open</option>
                <option value="PRIORITY">Priority</option>
                <option value="PENDING">Pending</option>
              </select>

              {(filters.coverage !== 'ALL' || filters.specialty !== 'ALL' || filters.status !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ coverage: 'ALL', specialty: 'ALL', status: 'ALL' })}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {filteredGaps.length !== gaps.length && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredGaps.length} of {gaps.length} gaps
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Covered Services */}
      {coveredGroups.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Covered Services</span>
              <Badge variant="success">{coveredGroups.reduce((acc, [_, g]) => acc + g.gaps.length, 0)} gaps</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coveredGroups.map(([key, group]) => (
              <GapGroup
                key={key}
                groupKey={key}
                title={group.title}
                gaps={group.gaps}
                isExpanded={expandedGroups.has(key)}
                onToggle={() => toggleGroup(key)}
                expandedGaps={expandedGaps}
                onToggleGap={toggleGap}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Not Covered Services */}
      {notCoveredGroups.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Not Covered Services</span>
              <Badge variant="error">{notCoveredGroups.reduce((acc, [_, g]) => acc + g.gaps.length, 0)} gaps</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notCoveredGroups.map(([key, group]) => (
              <GapGroup
                key={key}
                groupKey={key}
                title={group.title}
                gaps={group.gaps}
                isExpanded={expandedGroups.has(key)}
                onToggle={() => toggleGroup(key)}
                expandedGaps={expandedGaps}
                onToggleGap={toggleGap}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Create Care Plan
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Appointments
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface GapGroupProps {
  groupKey: string
  title: string
  gaps: CareGap[]
  isExpanded: boolean
  onToggle: () => void
  expandedGaps: Set<string>
  onToggleGap: (gapId: string) => void
}

function GapGroup({ groupKey, title, gaps, isExpanded, onToggle, expandedGaps, onToggleGap }: GapGroupProps) {
  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`group-${groupKey}`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="font-semibold">{title}</span>
          <Badge variant="outline">{gaps.length}</Badge>
        </div>
      </button>

      {isExpanded && (
        <div id={`group-${groupKey}`} className="p-4 pt-0 space-y-3">
          {gaps.map(gap => (
            <GapCard
              key={gap.id}
              gap={gap}
              isExpanded={expandedGaps.has(gap.id)}
              onToggle={() => onToggleGap(gap.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface GapCardProps {
  gap: CareGap
  isExpanded: boolean
  onToggle: () => void
}

function GapCard({ gap, isExpanded, onToggle }: GapCardProps) {
  return (
    <div className={cn(
      "border rounded-lg transition-all",
      gap.status === 'CLOSED' && "bg-green-50/50",
      gap.status === 'PRIORITY' && "bg-orange-50/50"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
        aria-expanded={isExpanded}
        aria-controls={`gap-${gap.id}`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{gap.title}</h4>
              <StatusBadge status={gap.status} />
              <PriorityBadge priority={gap.priority} />
            </div>
            {gap.nurseStatus !== 'NOT_ASKED' && (
              <p className="text-sm text-muted-foreground">
                Asked by Nurse: {gap.nurseAnswer}
              </p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div id={`gap-${gap.id}`} className="px-4 pb-4 space-y-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Guideline</p>
              <p className="text-sm">{gap.guideline}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
              <p className="text-sm">{gap.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Specialty</p>
              <p className="text-sm">{formatSpecialty(gap.specialty)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Coverage</p>
              <CoverageBadge coverage={gap.coverage} cost={gap.estimatedCost} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Referral Required</p>
              <p className="text-sm">{gap.referralRequired ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Nurse Status</p>
              <Badge variant={gap.nurseStatus === 'CLOSED' ? 'success' : 'secondary'}>
                {formatNurseStatus(gap.nurseStatus)}
              </Badge>
            </div>
          </div>

          <div className="p-3 rounded-md border" style={{ backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#134e4a' }}>Recommended Action</p>
            <p className="text-sm" style={{ color: '#115e59' }}>{gap.recommendedAction}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="default">
              <Plus className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
            <Button size="sm" variant="outline">
              Add Note
            </Button>
            <Button size="sm" variant="outline">
              Defer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatSpecialty(specialty: string): string {
  const map: Record<string, string> = {
    PRIMARY_CARE: 'Primary Care',
    SPECIALIST: 'Specialist',
    OB_GYN: 'OB/GYN',
    ENDOCRINOLOGY: 'Endocrinology'
  }
  return map[specialty] || specialty
}

function formatNurseStatus(status: string): string {
  const map: Record<string, string> = {
    NOT_ASKED: 'Not Asked',
    ASKED_OPEN: 'Asked but Open',
    CLOSED: 'Closed by Nurse'
  }
  return map[status] || status
}

