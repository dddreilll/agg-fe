import { useCallback, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import type { CanonicalOrderStatus, IncomingOrderEvent, Order, StatusUpdateEvent } from '@/types/order'
import { fetchOrders, updateOrderStatus } from '@/lib/api'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface UseOrdersResult {
  orders: Order[]
  status: ConnectionStatus
  updateStatus: (orderId: string, status: CanonicalOrderStatus) => Promise<void>
  clear: () => void
}

export function useOrders(apiUrl: string, storeId: string): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  // Reset board when connection target changes
  const connKey = `${apiUrl}|${storeId}`
  const [prevKey, setPrevKey] = useState(connKey)
  if (connKey !== prevKey) {
    setPrevKey(connKey)
    setOrders([])
    setStatus('connecting')
  }

  // Hydrate from REST on mount so the board survives page refresh
  useEffect(() => {
    if (!apiUrl || !storeId) return
    fetchOrders(apiUrl, storeId, { limit: 50 })
      .then((res) => setOrders(res.data))
      .catch(() => {})
  }, [apiUrl, storeId])

  // WebSocket — new orders + status patches
  useEffect(() => {
    if (!apiUrl) return
    const socket = io(`${apiUrl}/kitchen`, {
      query: { storeId },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => setStatus('connected'))
    socket.on('disconnect', () => setStatus('disconnected'))
    socket.on('connect_error', () => setStatus('disconnected'))

    socket.on('order.incoming', (event: IncomingOrderEvent) => {
      setOrders((prev) => (prev.some((o) => o.id === event.id) ? prev : [event, ...prev]))
    })

    socket.on('order.status_updated', (event: StatusUpdateEvent) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === event.orderId ? { ...o, status: event.status } : o)),
      )
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [apiUrl, storeId])

  const updateStatus = useCallback(
    async (orderId: string, nextStatus: CanonicalOrderStatus) => {
      const updated = await updateOrderStatus(apiUrl, orderId, nextStatus)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    },
    [apiUrl],
  )

  return { orders, status, updateStatus, clear: () => setOrders([]) }
}
