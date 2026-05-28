import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCents, formatTime } from '@/lib/format'
import { platformStyle } from '@/lib/platform'
import { Elapsed } from '@/components/Elapsed'
import type { CanonicalOrder } from '@/types/order'

const PAYMENT_LABEL: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on delivery',
  ONLINE_PAYMENT: 'Paid online',
}

export function OrderCard({ order }: { order: CanonicalOrder }) {
  const { meta, order_details } = order
  const platform = platformStyle(meta.platform)
  const { financials, items, payment_method } = order_details

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="flex items-start justify-between gap-2 border-b bg-muted/40 px-4 py-3 [.border-b]:pb-3">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              'w-fit rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
              platform.className,
            )}
          >
            {platform.label}
          </span>
          <span className="font-mono text-lg font-bold leading-none">
            #{meta.short_order_id}
          </span>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{formatTime(meta.received_at)}</div>
          <div><Elapsed iso={meta.received_at} /></div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 px-4 py-3">
        {items.map((item, i) => (
          <div key={`${item.internal_product_id}-${i}`} className="text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">
                <span className="text-muted-foreground">{item.quantity}×</span>{' '}
                {item.product_name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatCents(item.unit_price_cents)}
              </span>
            </div>
            {item.customizations.map((c) => (
              <div
                key={c.internal_modifier_id}
                className="flex justify-between gap-2 pl-5 text-xs text-muted-foreground"
              >
                <span>+ {c.modifier_name}</span>
                {c.added_price_cents > 0 && (
                  <span className="tabular-nums">{formatCents(c.added_price_cents)}</span>
                )}
              </div>
            ))}
            {item.notes && (
              <div className="pl-5 text-xs italic text-amber-600 dark:text-amber-400">
                “{item.notes}”
              </div>
            )}
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-1 border-t px-4 py-3 text-sm [.border-t]:pt-3">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCents(financials.subtotal_cents)}</span>
        </div>
        {financials.modifier_total_cents > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Add-ons</span>
            <span className="tabular-nums">{formatCents(financials.modifier_total_cents)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatCents(financials.grand_total_cents)}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {PAYMENT_LABEL[payment_method] ?? payment_method}
        </div>
      </CardFooter>
    </Card>
  )
}
