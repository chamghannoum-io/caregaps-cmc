import { FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
        {icon || <FileQuestion className="h-10 w-10 text-muted-foreground" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

