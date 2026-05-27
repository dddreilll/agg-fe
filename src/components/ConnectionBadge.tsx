import { cn } from '@/lib/utils'
import type { ConnectionStatus } from '@/hooks/useKitchenSocket'

const STATUS: Record<ConnectionStatus, { label: string; dot: string }> = {
  connecting: { label: 'Connecting…', dot: 'bg-amber-500 animate-pulse' },
  connected: { label: 'Live', dot: 'bg-green-500' },
  disconnected: { label: 'Disconnected', dot: 'bg-red-500' },
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const s = STATUS[status]
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      <span className={cn('size-2 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}
