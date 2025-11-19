import type { Coverage } from '@/types/index'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

interface CoverageBadgeProps {
  coverage: Coverage
  cost?: number
  className?: string
}

export function CoverageBadge({ coverage, cost, className }: CoverageBadgeProps) {
  if (coverage === 'COVERED') {
    return (
      <Badge variant="success" className={className}>
        <Check className="h-3 w-3 mr-1" aria-hidden="true" />
        Covered
      </Badge>
    )
  }

  return (
    <Badge variant="error" className={className}>
      <X className="h-3 w-3 mr-1" aria-hidden="true" />
      Not Covered {cost ? `($${cost})` : ''}
    </Badge>
  )
}

