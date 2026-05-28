export type Platform = 'GRABFOOD' | 'FOODPANDA'
export const PLATFORMS: Platform[] = ['GRABFOOD', 'FOODPANDA']

export interface Category {
  id: string
  storeId: string
  name: string
  description: string | null
  sortOrder: number
  isVisible: boolean
  createdAt: string
}

export interface Product {
  id: string
  categoryId: string | null
  sku: string | null
  name: string
  description: string | null
  basePriceCents: number
  isAvailable: boolean
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface PlatformLink {
  id: string
  storeId: string | null
  entityType: string
  internalEntityId: string
  platformName: Platform
  platformMetadata: Record<string, unknown>
  isSynced: boolean
  lastSyncedAt: string | null
}
