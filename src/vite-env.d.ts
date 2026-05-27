/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL, e.g. http://localhost:3000 */
  readonly VITE_API_URL?: string
  /** Default internal store id to subscribe to on load. */
  readonly VITE_STORE_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
