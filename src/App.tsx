import { useState } from 'react'
import { UtensilsCrossed, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectionBadge } from '@/components/ConnectionBadge'
import { OrderCard } from '@/components/OrderCard'
import { CatalogView } from '@/components/catalog/CatalogView'
import { useOrders } from '@/hooks/useOrders'

const BACKEND_KEY = 'agg_backend_url'
const STORE_KEY = 'agg_store_id'
const DEFAULT_STORE = import.meta.env.VITE_STORE_ID ?? 'd3b07384-d113-4c4e-9c8e-a20468307d14'

type Tab = 'kitchen' | 'catalog'
type TestState = 'idle' | 'testing' | 'ok' | 'error'

function cleanUrl(s: string) {
  return s.trim().replace(/\/+$/, '')
}

async function pingBackend(url: string): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`${url}/healthz`, { signal: controller.signal })
    if (!res.ok) throw new Error(`Server returned ${res.status}`)
  } finally {
    clearTimeout(timer)
  }
}

function App() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem(BACKEND_KEY) ?? '')
  const [storeId, setStoreId] = useState(() => localStorage.getItem(STORE_KEY) ?? DEFAULT_STORE)
  const [urlInput, setUrlInput] = useState(apiUrl)
  const [storeInput, setStoreInput] = useState(storeId)
  const [testState, setTestState] = useState<TestState>('idle')
  const [testError, setTestError] = useState('')
  const [tab, setTab] = useState<Tab>('kitchen')

  const { orders, status, updateStatus, clear } = useOrders(apiUrl, storeId)

  function resetSettings() {
    localStorage.removeItem(BACKEND_KEY)
    localStorage.removeItem(STORE_KEY)
    setApiUrl('')
    setStoreId(DEFAULT_STORE)
    setUrlInput('')
    setStoreInput(DEFAULT_STORE)
    setTestState('idle')
    setTestError('')
  }

  async function testAndApply(url: string, store: string) {
    const u = cleanUrl(url)
    const s = store.trim()
    if (!u || !s) return
    setTestState('testing')
    setTestError('')
    try {
      await pingBackend(u)
      localStorage.setItem(BACKEND_KEY, u)
      localStorage.setItem(STORE_KEY, s)
      setApiUrl(u)
      setStoreId(s)
      setUrlInput(u)
      setStoreInput(s)
      setTestState('ok')
    } catch (err) {
      const msg = err instanceof Error
        ? err.name === 'AbortError' ? 'Connection timed out — check the URL and network' : err.message
        : 'Unknown error'
      setTestError(msg)
      setTestState('error')
    }
  }

  // ── Setup screen ─────────────────────────────────────────────────────────────
  if (!apiUrl) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your backend details to start receiving orders.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); void testAndApply(urlInput, storeInput) }}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="setup-backend-url">Backend URL</label>
              <input
                id="setup-backend-url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setTestState('idle') }}
                required
                disabled={testState === 'testing'}
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="setup-store-id">Store ID</label>
              <input
                id="setup-store-id"
                value={storeInput}
                onChange={(e) => { setStoreInput(e.target.value); setTestState('idle') }}
                placeholder="store uuid"
                required
                disabled={testState === 'testing'}
                className="h-9 w-full rounded-md border bg-transparent px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
            {testState === 'error' && <p className="text-sm text-destructive">{testError}</p>}
            <Button type="submit" className="w-full" disabled={testState === 'testing'}>
              {testState === 'testing' ? 'Testing connection…' : 'Connect'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ── Main app ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="mr-auto flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              {tab === 'kitchen' ? 'Kitchen Display' : 'Catalog'}
            </h1>
            {tab === 'kitchen' && (
              <>
                <ConnectionBadge status={status} />
                <span className="text-sm text-muted-foreground">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void testAndApply(urlInput, storeInput) }}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setTestState('idle') }}
              placeholder="backend url"
              disabled={testState === 'testing'}
              className="h-9 w-44 rounded-md border bg-transparent px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <input
              value={storeInput}
              onChange={(e) => { setStoreInput(e.target.value); setTestState('idle') }}
              placeholder="store id"
              disabled={testState === 'testing'}
              className="h-9 w-64 rounded-md border bg-transparent px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={testState === 'testing'}>
              {testState === 'testing' ? 'Testing…' : 'Apply'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={resetSettings}>Clear</Button>
            {testState === 'error' && <span className="w-full text-xs text-destructive">{testError}</span>}
          </form>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16">
        {tab === 'kitchen' ? (
          orders.length === 0 ? (
            <div className="flex min-h-[60svh] flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-lg font-medium">Waiting for orders…</p>
              <p className="mt-1 text-sm">
                {status === 'connected'
                  ? 'New orders for this store will appear here in real time.'
                  : 'Not connected to the order stream.'}
              </p>
              <p className="mt-4 font-mono text-xs">store: {storeId}</p>
              <Button size="sm" variant="ghost" className="mt-4" onClick={clear}>Clear board</Button>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} onStatusChange={updateStatus} />
                ))}
              </div>
            </div>
          )
        ) : (
          <CatalogView apiUrl={apiUrl} storeId={storeId} />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-10 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl">
          <button
            onClick={() => setTab('kitchen')}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              tab === 'kitchen' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UtensilsCrossed className="size-5" />
            <span>Kitchen</span>
          </button>
          <button
            onClick={() => setTab('catalog')}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              tab === 'catalog' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="size-5" />
            <span>Catalog</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
