import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import type { CanonicalOrder } from '@/types/order'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface KitchenSocket {
  orders: CanonicalOrder[]
  status: ConnectionStatus
  /** Manually clear the board (e.g. after a shift). */
  clear: () => void
}

/**
 * Connects to the backend `/kitchen` namespace and auto-joins `store:<storeId>`
 * via the handshake query. New orders (`order.incoming`) are prepended, newest
 * first, deduped by `meta.order_id` so a reconnect re-emit won't double up.
 *
 * Changing `apiUrl` or `storeId` tears down and re-establishes the connection
 * and clears the board, since a different store is a different room.
 */
export function useKitchenSocket(apiUrl: string, storeId: string): KitchenSocket {
  const [orders, setOrders] = useState<CanonicalOrder[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  // Reset the board when the target room changes. Done during render (React's
  // "adjust state on prop change" pattern) rather than in the effect, so we
  // don't trigger a cascading re-render from inside useEffect.
  const connKey = `${apiUrl}|${storeId}`
  const [prevKey, setPrevKey] = useState(connKey)
  if (connKey !== prevKey) {
    setPrevKey(connKey)
    setOrders([])
    setStatus('connecting')
  }

  useEffect(() => {
    const socket = io(`${apiUrl}/kitchen`, {
      query: { storeId },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => setStatus('connected'))
    socket.on('disconnect', () => setStatus('disconnected'))
    socket.on('connect_error', () => setStatus('disconnected'))

    socket.on('order.incoming', (order: CanonicalOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o.meta.order_id === order.meta.order_id)) return prev
        return [order, ...prev]
      })
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [apiUrl, storeId])

  return { orders, status, clear: () => setOrders([]) }
}
