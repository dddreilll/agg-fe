import type { CanonicalOrderStatus, Order, PaginatedOrders } from '@/types/order'
import type { Category, Platform, PlatformLink, Product } from '@/types/catalog'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function fetchOrders(
  apiUrl: string,
  storeId: string,
  params: { status?: CanonicalOrderStatus; page?: number; limit?: number } = {},
): Promise<PaginatedOrders> {
  const q = new URLSearchParams({ storeId, limit: String(params.limit ?? 50) })
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', String(params.page))
  return request<PaginatedOrders>(`${apiUrl}/orders?${q}`)
}

export function fetchOrder(apiUrl: string, orderId: string): Promise<Order> {
  return request<Order>(`${apiUrl}/orders/${orderId}`)
}

export function updateOrderStatus(
  apiUrl: string,
  orderId: string,
  status: CanonicalOrderStatus,
): Promise<Order> {
  return request<Order>(`${apiUrl}/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ── Categories ────────────────────────────────────────────────────────────────

export function fetchCategories(apiUrl: string, storeId?: string): Promise<Category[]> {
  const q = storeId ? `?storeId=${storeId}` : ''
  return request<Category[]>(`${apiUrl}/catalog/categories${q}`)
}

export function createCategory(
  apiUrl: string,
  dto: { storeId: string; name: string; description?: string; sortOrder?: number; isVisible?: boolean },
): Promise<Category> {
  return request<Category>(`${apiUrl}/catalog/categories`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

// ── Products ──────────────────────────────────────────────────────────────────

export function fetchProducts(apiUrl: string, categoryId?: string): Promise<Product[]> {
  const q = categoryId ? `?categoryId=${categoryId}` : ''
  return request<Product[]>(`${apiUrl}/catalog/products${q}`)
}

export function createProduct(
  apiUrl: string,
  dto: {
    categoryId?: string
    sku?: string
    name: string
    description?: string
    basePriceCents: number
    imageUrl?: string
    isAvailable?: boolean
  },
): Promise<Product> {
  return request<Product>(`${apiUrl}/catalog/products`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export function updateProduct(
  apiUrl: string,
  id: string,
  dto: Partial<{
    categoryId: string | null
    sku: string | null
    name: string
    description: string | null
    basePriceCents: number
    imageUrl: string | null
    isAvailable: boolean
  }>,
): Promise<Product> {
  return request<Product>(`${apiUrl}/catalog/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}

export function deleteProduct(apiUrl: string, id: string): Promise<void> {
  return request<void>(`${apiUrl}/catalog/products/${id}`, { method: 'DELETE' })
}

export function setProductAvailability(
  apiUrl: string,
  id: string,
  isAvailable: boolean,
  platform?: Platform,
): Promise<Product> {
  return request<Product>(`${apiUrl}/catalog/products/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable, ...(platform ? { platform } : {}) }),
  })
}

export function linkProductToPlatform(
  apiUrl: string,
  id: string,
  dto: { storeId: string; platform: Platform; platformMetadata: { external_id: string } },
): Promise<PlatformLink> {
  return request<PlatformLink>(`${apiUrl}/catalog/products/${id}/platforms`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export function fetchPlatformLinks(apiUrl: string, productId: string): Promise<PlatformLink[]> {
  return request<PlatformLink[]>(`${apiUrl}/catalog/products/${productId}/platforms`)
}
