import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { Elapsed } from '@/components/Elapsed'
import { cn } from '@/lib/utils'
import { formatCents, formatTime } from '@/lib/format'
import { platformStyle } from '@/lib/platform'
import type { CanonicalOrderStatus, Order } from '@/types/order'

const PAYMENT_LABEL: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on delivery',
  ONLINE_PAYMENT: 'Paid online',
}

// Primary + optional secondary action per status. Terminal statuses have no entry.
const STATUS_ACTIONS: Partial<
  Record<CanonicalOrderStatus, { primary: [CanonicalOrderStatus, string]; secondary?: [CanonicalOrderStatus, string] }>
> = {
  PENDING_ACCEPTANCE: { primary: ['ACCEPTED', 'Accept'], secondary: ['REJECTED', 'Reject'] },
  ACCEPTED:           { primary: ['PREPARING', 'Start Preparing'], secondary: ['CANCELLED', 'Cancel'] },
  PREPARING:          { primary: ['READY_FOR_PICKUP', 'Ready for Pickup'], secondary: ['CANCELLED', 'Cancel'] },
  READY_FOR_PICKUP:   { primary: ['COMPLETED', 'Complete'], secondary: ['CANCELLED', 'Cancel'] },
}

interface OrderCardProps {
  order: Order
  onStatusChange: (orderId: string, status: CanonicalOrderStatus) => Promise<void>
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [busy, setBusy] = useState(false)
  const { id, platform, shortOrderId, receivedAt, status, paymentMethod,
          subtotalCents, grandTotalCents, items } = order
  const p = platformStyle(platform)
  const actions = STATUS_ACTIONS[status]
  const isTerminal = !actions

  async function handleAction(next: CanonicalOrderStatus) {
    setBusy(true)
    try { await onStatusChange(id, next) }
    finally { setBusy(false) }
  }

  return (
    <Card className={cn('flex flex-col gap-0 overflow-hidden py-0', isTerminal && 'opacity-60')}>
      <CardHeader className="flex items-start justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <span className={cn('w-fit rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide', p.className)}>
            {p.label}
          </span>
          <span className="font-mono text-lg font-bold leading-none">#{shortOrderId}</span>
          <StatusBadge status={status} />
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{formatTime(receivedAt)}</div>
          <div><Elapsed iso={receivedAt} /></div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 px-4 py-3">
        {items
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((item, i) => (
            <div key={`${item.id}-${i}`} className="text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">
                  <span className="text-muted-foreground">{item.quantity}×</span>{' '}
                  {item.productName}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCents(item.unitPriceCents)}
                </span>
              </div>
              {item.notes && (
                <div className="pl-5 text-xs italic text-amber-600 dark:text-amber-400">
                  &quot;{item.notes}&quot;
                </div>
              )}
            </div>
          ))}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-1 border-t px-4 py-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCents(subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatCents(grandTotalCents)}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {PAYMENT_LABEL[paymentMethod] ?? paymentMethod}
        </div>

        {actions && (
          <div className="mt-3 flex flex-col gap-2">
            <Button size="sm" disabled={busy} onClick={() => handleAction(actions.primary[0])}>
              {busy ? '…' : actions.primary[1]}
            </Button>
            {actions.secondary && (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => handleAction(actions.secondary![0])}>
                {actions.secondary[1]}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
