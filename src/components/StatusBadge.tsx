import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CanonicalOrderStatus } from '@/types/order'

const CONFIG: Record<CanonicalOrderStatus, { label: string; className: string }> = {
  PENDING_ACCEPTANCE: { label: 'Pending',  className: 'border-amber-300  bg-amber-100  text-amber-800  dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  ACCEPTED:           { label: 'Accepted', className: 'border-blue-300   bg-blue-100   text-blue-800   dark:border-blue-700  dark:bg-blue-900/40  dark:text-blue-300' },
  REJECTED:           { label: 'Rejected', className: 'border-red-300    bg-red-100    text-red-800    dark:border-red-700   dark:bg-red-900/40   dark:text-red-300' },
  PREPARING:          { label: 'Preparing',className: 'border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  READY_FOR_PICKUP:   { label: 'Ready',    className: 'border-green-300  bg-green-100  text-green-800  dark:border-green-700 dark:bg-green-900/40 dark:text-green-300' },
  COMPLETED:          { label: 'Completed',className: 'border-border     bg-muted      text-muted-foreground' },
  CANCELLED:          { label: 'Cancelled',className: 'border-border     bg-muted      text-muted-foreground line-through' },
}

export function StatusBadge({ status }: { status: CanonicalOrderStatus }) {
  const c = CONFIG[status] ?? { label: status, className: 'border-border bg-muted text-muted-foreground' }
  return (
    <Badge variant="outline" className={cn('font-semibold', c.className)}>
      {c.label}
    </Badge>
  )
}
