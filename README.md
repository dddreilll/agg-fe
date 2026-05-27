# Delivery Operations Platform — Frontend

Kitchen display for the [delivery operations platform](../delivery-platform_backend).
A React + Vite SPA that subscribes to a store's live order stream over the
backend's Socket.io `/kitchen` namespace and renders incoming orders as glanceable
tiles.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (radix-nova, neutral)
- `socket.io-client` for the realtime feed

## How it works

On load the app opens a Socket.io connection to `${VITE_API_URL}/kitchen` with the
store id in the handshake query, which auto-joins the `store:<id>` room on the
backend. Each `order.incoming` event (a canonical order — see
[`src/types/order.ts`](src/types/order.ts), mirrored from the backend) is prepended
to the board, newest first, deduped by `meta.order_id`.

> **Scope:** this is a **live, WebSocket-only** first cut. It shows orders that
> arrive *while connected*; it does not load already-open orders on connect because
> the backend read API doesn't exist yet (see the backend `ROADMAP.md`). Once that
> endpoint lands, fetch open orders on mount and merge them with the live stream.

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable         | Default                                  | Purpose                                  |
| ---------------- | ---------------------------------------- | ---------------------------------------- |
| `VITE_API_URL`   | `http://localhost:3000`                  | Backend base URL                         |
| `VITE_STORE_ID`  | `d3b07384-…` (seeded dev store)          | Store to subscribe to on load            |

The store id can also be changed at runtime from the header input.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

The backend must be running (see [../delivery-platform_backend](../delivery-platform_backend)).
To see a card appear, POST a webhook to the backend
(`POST /webhooks/grabfood`) for the same store; once persisted it is broadcast to
the kitchen room.

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run preview` — serve the production build
- `npm run lint` — ESLint
