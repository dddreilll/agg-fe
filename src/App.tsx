import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConnectionBadge } from '@/components/ConnectionBadge'
import { OrderCard } from '@/components/OrderCard'
import { useKitchenSocket } from '@/hooks/useKitchenSocket'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const DEFAULT_STORE_ID =
  import.meta.env.VITE_STORE_ID ?? 'd3b07384-d113-4c4e-9c8e-a20468307d14'

function App() {
  const [storeId, setStoreId] = useState(DEFAULT_STORE_ID)
  const [storeInput, setStoreInput] = useState(DEFAULT_STORE_ID)
  const { orders, status, clear } = useKitchenSocket(API_URL, storeId)

  const switchStore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = storeInput.trim()
    if (next && next !== storeId) setStoreId(next)
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="mr-auto flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Kitchen Display</h1>
            <ConnectionBadge status={status} />
            <span className="text-sm text-muted-foreground">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          <form onSubmit={switchStore} className="flex items-center gap-2">
            <label htmlFor="store" className="sr-only">
              Store id
            </label>
            <input
              id="store"
              value={storeInput}
              onChange={(e) => setStoreInput(e.target.value)}
              placeholder="store id"
              className="h-9 w-72 rounded-md border bg-transparent px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="sm" variant="secondary">
              Switch
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={clear}>
              Clear
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex min-h-[60svh] flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-lg font-medium">Waiting for orders…</p>
            <p className="mt-1 text-sm">
              {status === 'connected'
                ? 'New orders for this store will appear here in real time.'
                : 'Not connected to the order stream.'}
            </p>
            <p className="mt-4 font-mono text-xs">store: {storeId}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((order) => (
              <OrderCard key={order.meta.order_id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
