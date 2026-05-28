// Keep in sync with agg-be/src/translation/canonical.types.ts

export type CanonicalPaymentMethod = 'ONLINE_PAYMENT' | 'CASH_ON_DELIVERY'

export type CanonicalOrderStatus =
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'

// ── REST API shapes (matches OrderResponseDto) ─────────────────────────────────

export interface OrderModifier {
  id: string
  modifierId: string | null
  modifierName: string
  addedPriceCents: number
}

export interface OrderItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  unitPriceCents: number
  notes: string | null
  position: number
  modifiers: OrderModifier[]
}

export interface Order {
  id: string
  platform: string
  externalOrderId: string
  shortOrderId: string
  storeId: string
  status: CanonicalOrderStatus
  paymentMethod: CanonicalPaymentMethod
  subtotalCents: number
  modifierTotalCents: number
  grandTotalCents: number
  receivedAt: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface PaginatedOrders {
  data: Order[]
  meta: { total: number; page: number; limit: number; hasNextPage: boolean }
}

// ── WebSocket event shapes ─────────────────────────────────────────────────────

// order.incoming now carries the same shape as the REST OrderResponseDto
export type IncomingOrderEvent = Order

export interface StatusUpdateEvent {
  orderId: string
  status: CanonicalOrderStatus
}
