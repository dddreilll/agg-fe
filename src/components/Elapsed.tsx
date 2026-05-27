import { useEffect, useState } from 'react'
import { formatElapsed } from '@/lib/format'

/**
 * Live "time since" label that ticks every second. Each instance owns its own
 * timer so only the label re-renders, not the surrounding card or order board.
 */
export function Elapsed({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return <>{formatElapsed(iso, now)} ago</>
}
