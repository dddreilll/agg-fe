import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCents } from '@/lib/format'
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchPlatformLinks,
  fetchProducts,
  linkProductToPlatform,
  setProductAvailability,
  updateProduct,
} from '@/lib/api'
import type { Category, Platform, PlatformLink, Product } from '@/types/catalog'
import { PLATFORMS } from '@/types/catalog'

interface Props {
  apiUrl: string
  storeId: string
}

const PLATFORM_STYLE: Record<Platform, string> = {
  GRABFOOD: 'bg-green-600 text-white',
  FOODPANDA: 'bg-pink-600 text-white',
}

// ── Create / Edit form ─────────────────────────────────────────────────────────

interface ProductFormData {
  name: string
  sku: string
  basePriceCents: string
  description: string
  imageUrl: string
  categoryId: string
}

const emptyForm = (): ProductFormData => ({
  name: '', sku: '', basePriceCents: '', description: '', imageUrl: '', categoryId: '',
})

function formToDto(f: ProductFormData) {
  const cents = Math.round(parseFloat(f.basePriceCents) * 100)
  return {
    name: f.name.trim(),
    sku: f.sku.trim() || undefined,
    basePriceCents: Number.isNaN(cents) ? 0 : cents,
    description: f.description.trim() || undefined,
    imageUrl: f.imageUrl.trim() || undefined,
    categoryId: f.categoryId || undefined,
  }
}

interface ProductFormProps {
  initial?: ProductFormData
  categories: Category[]
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

function ProductForm({ initial, categories, onSubmit, onCancel, submitLabel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(initial ?? emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function field(key: keyof ProductFormData) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((p) => ({ ...p, [key]: e.target.value })),
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    const price = parseFloat(form.basePriceCents)
    if (Number.isNaN(price) || price < 0) { setError('Enter a valid price'); return }
    setSaving(true)
    setError('')
    try { await onSubmit(form) } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const inputCls = 'h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Name *</label>
          <input {...field('name')} placeholder="Product name" required className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">SKU</label>
          <input {...field('sku')} placeholder="e.g. BURGER-01" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Price (₱) *</label>
          <input {...field('basePriceCents')} placeholder="0.00" type="number" min="0" step="0.01" className={inputCls} />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea {...field('description')} placeholder="Optional description" rows={2}
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Image URL</label>
          <input {...field('imageUrl')} placeholder="https://…" className={inputCls} />
        </div>
        {categories.length > 0 && (
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select {...field('categoryId')} className={inputCls}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={saving} className="flex-1">
          {saving ? 'Saving…' : submitLabel}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ── Link to platform form ──────────────────────────────────────────────────────

interface LinkFormProps {
  productId: string
  storeId: string
  apiUrl: string
  existing: PlatformLink[]
  onDone: (links: PlatformLink[]) => void
}

function LinkForm({ productId, storeId, apiUrl, existing, onDone }: LinkFormProps) {
  const [platform, setPlatform] = useState<Platform>('GRABFOOD')
  const [externalId, setExternalId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    if (!externalId.trim()) { setError('External ID is required'); return }
    setSaving(true)
    setError('')
    try {
      await linkProductToPlatform(apiUrl, productId, {
        storeId,
        platform,
        platformMetadata: { external_id: externalId.trim() },
      })
      const links = await fetchPlatformLinks(apiUrl, productId)
      onDone(links)
      setExternalId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <p className="text-xs font-medium text-muted-foreground">Platform links</p>
      {existing.map((link) => (
        <div key={link.id} className="flex items-center gap-2 text-xs">
          <span className={cn('rounded px-1.5 py-0.5 font-semibold', PLATFORM_STYLE[link.platformName])}>
            {link.platformName}
          </span>
          <span className="font-mono text-muted-foreground">
            {String(link.platformMetadata.external_id ?? '—')}
          </span>
          {!link.isSynced && <span className="text-amber-500">unsynced</span>}
        </div>
      ))}
      <form onSubmit={handleLink} className="flex gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="h-9 rounded-md border bg-transparent px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
          placeholder="Platform product ID"
          className={cn(inputCls, 'flex-1 text-xs')}
        />
        <Button type="submit" size="sm" disabled={saving}>{saving ? '…' : 'Link'}</Button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ── Product card ───────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product
  categories: Category[]
  apiUrl: string
  storeId: string
  onUpdated: (p: Product) => void
  onDeleted: (id: string) => void
}

function ProductCard({ product, categories, apiUrl, storeId, onUpdated, onDeleted }: ProductCardProps) {
  const [editing, setEditing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [links, setLinks] = useState<PlatformLink[] | null>(null)
  const [toggling, setToggling] = useState(false)

  const category = categories.find((c) => c.id === product.categoryId)

  async function handleToggle() {
    setToggling(true)
    try {
      const updated = await setProductAvailability(apiUrl, product.id, !product.isAvailable)
      onUpdated(updated)
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"?`)) return
    await deleteProduct(apiUrl, product.id)
    onDeleted(product.id)
  }

  async function openLinks() {
    if (linking) { setLinking(false); return }
    if (!links) {
      const fetched = await fetchPlatformLinks(apiUrl, product.id)
      setLinks(fetched)
    }
    setLinking(true)
  }

  async function handleEdit(form: ProductFormData) {
    const updated = await updateProduct(apiUrl, product.id, formToDto(form))
    onUpdated(updated)
    setEditing(false)
  }

  return (
    <Card className="flex flex-col gap-0 py-0 overflow-hidden">
      <CardHeader className="flex items-start justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{product.name}</span>
            {product.sku && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {product.sku}
              </span>
            )}
          </div>
          {category && <p className="mt-0.5 text-xs text-muted-foreground">{category.name}</p>}
        </div>
        <span className="shrink-0 font-bold tabular-nums">{formatCents(product.basePriceCents)}</span>
      </CardHeader>

      {editing ? (
        <CardContent className="px-4 py-3">
          <ProductForm
            initial={{
              name: product.name,
              sku: product.sku ?? '',
              basePriceCents: (product.basePriceCents / 100).toFixed(2),
              description: product.description ?? '',
              imageUrl: product.imageUrl ?? '',
              categoryId: product.categoryId ?? '',
            }}
            categories={categories}
            onSubmit={handleEdit}
            onCancel={() => setEditing(false)}
            submitLabel="Save"
          />
        </CardContent>
      ) : (
        <>
          <CardContent className="px-4 py-3 text-sm">
            {product.description && (
              <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={cn(
                  'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors disabled:opacity-50',
                  product.isAvailable ? 'bg-green-500' : 'bg-muted',
                )}
                aria-label="Toggle availability"
              >
                <span className={cn(
                  'size-4 rounded-full bg-white shadow transition-transform',
                  product.isAvailable ? 'translate-x-4' : 'translate-x-0',
                )} />
              </button>
              <span className={cn('text-xs', product.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
                {product.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            {linking && links !== null && (
              <LinkForm
                productId={product.id}
                storeId={storeId}
                apiUrl={apiUrl}
                existing={links}
                onDone={setLinks}
              />
            )}
          </CardContent>
          <CardFooter className="flex gap-1 border-t px-4 py-2">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 size-3" />Edit
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={openLinks}>
              <Unlink className="mr-1 size-3" />{linking ? 'Hide' : 'Platforms'}
            </Button>
            <Button size="sm" variant="ghost" className="ml-auto h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="size-3" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────

export function CatalogView({ apiUrl, storeId }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!apiUrl) return
    setLoading(true)
    Promise.all([fetchProducts(apiUrl), fetchCategories(apiUrl, storeId)])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats) })
      .catch(() => setError('Failed to load catalog'))
      .finally(() => setLoading(false))
  }, [apiUrl, storeId])

  async function handleCreate(form: ProductFormData) {
    const product = await createProduct(apiUrl, formToDto(form))
    setProducts((prev) => [product, ...prev])
    setCreating(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Products</h2>
        <Button size="sm" onClick={() => setCreating((v) => !v)}>
          <Plus className="mr-1 size-4" />
          {creating ? 'Cancel' : 'New Product'}
        </Button>
      </div>

      {creating && (
        <Card className="mb-4 py-0">
          <CardContent className="px-4 py-4">
            <p className="mb-3 text-sm font-medium">New product</p>
            <ProductForm
              categories={categories}
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
              submitLabel="Create"
            />
          </CardContent>
        </Card>
      )}

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Loading products…
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <p className="font-medium">No products yet</p>
          <p className="text-sm">Click "New Product" to add your first item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              categories={categories}
              apiUrl={apiUrl}
              storeId={storeId}
              onUpdated={(updated) => setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
              onDeleted={(id) => setProducts((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
