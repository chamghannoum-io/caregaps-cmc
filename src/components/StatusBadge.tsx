import type { GapStatus } from '@/types/index'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react'

interface StatusBadgeProps {
  status: GapStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    CLOSED: {
      icon: CheckCircle,
      label: 'Closed',
      variant: 'success' as const,
    },
    OPEN: {
      icon: AlertCircle,
      label: 'Open',
      variant: 'error' as const,
    },
    PRIORITY: {
      icon: AlertTriangle,
      label: 'Priority',
      variant: 'warning' as const,
    },
    PENDING: {
      icon: Clock,
      label: 'Pending',
      variant: 'secondary' as const,
    },
  }

  const { icon: Icon, label, variant } = config[status]

  return (
    <Badge variant={variant} className={className}>
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {label}
    </Badge>
  )
}

