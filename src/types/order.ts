// Mirrors the backend canonical order shape emitted over the `/kitchen` WebSocket
// (`order.incoming`). Keep in sync with
// delivery-platform_backend/src/translation/canonical.types.ts
// All monetary values are integer cents.

export type CanonicalPaymentMethod = 'ONLINE_PAYMENT' | 'CASH_ON_DELIVERY'
export type CanonicalOrderStatus = 'PENDING_ACCEPTANCE'

export interface CanonicalCustomization {
  internal_modifier_id: string
  modifier_name: string
  added_price_cents: number
}

export interface CanonicalItem {
  internal_product_id: string
  product_name: string
  quantity: number
  unit_price_cents: number
  notes?: string
  customizations: CanonicalCustomization[]
}

export interface CanonicalFinancials {
  subtotal_cents: number
  modifier_total_cents: number
  grand_total_cents: number
}

export interface CanonicalOrder {
  event: 'order.incoming'
  meta: {
    platform: string
    order_id: string
    short_order_id: string
    idempotency_key: string
    received_at: string
  }
  order_details: {
    internal_store_id: string
    status: CanonicalOrderStatus
    payment_method: CanonicalPaymentMethod
    financials: CanonicalFinancials
    items: CanonicalItem[]
  }
}
