const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

/** Format integer cents as Philippine pesos, e.g. 12500 → "₱125.00". */
export function formatCents(cents: number): string {
  return peso.format(cents / 100)
}

const time = new Intl.DateTimeFormat('en-PH', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

/** Wall-clock time an order was received, e.g. "07:42 PM". */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : time.format(d)
}

/** Compact elapsed time since `iso`, e.g. "12s", "3m", "1h 5m". */
export function formatElapsed(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(0, Math.floor((now - then) / 1000))
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}
