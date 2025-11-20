import type { Priority } from '@/types/index'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = {
    HIGH: {
      label: 'High Priority',
      className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
    },
    MEDIUM: {
      label: 'Medium Priority',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
    },
    LOW: {
      label: 'Low Priority',
      className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
    },
  }

  const { label, className: variantClass } = config[priority]

  return (
    <Badge className={cn(variantClass, className)}>
      {label}
    </Badge>
  )
}

