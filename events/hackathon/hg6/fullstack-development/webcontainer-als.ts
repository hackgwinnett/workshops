/// <reference types="node" />
import { AsyncLocalStorage } from 'node:async_hooks'

// StackBlitz fix: WebContainers' AsyncLocalStorage loses its value across
// `await`, so server functions throw "No Start context found in
// AsyncLocalStorage" (e.g. clicking Teams or Leaderboard, or voting). When running in a
// WebContainer, fall back to the most recent request's context. Real Node
// (local dev, Codespaces, production) is untouched.
const inWebContainer = !!(process.versions as Record<string, string | undefined>).webcontainer || process.env.SHELL === '/bin/jsh'

if (inWebContainer) {
  const g = globalThis as Record<symbol, AsyncLocalStorage<unknown> | undefined>
  // The two stores TanStack Start keeps on globalThis (request context + H3 event).
  for (const name of ['tanstack-start:start-storage-context', 'tanstack-start:event-storage']) {
    const storage = (g[Symbol.for(name)] ??= new AsyncLocalStorage())
    const run = storage.run.bind(storage)
    const getStore = storage.getStore.bind(storage)
    let last: unknown

    storage.run = ((store: unknown, fn: (...args: unknown[]) => unknown, ...args: unknown[]) => {
      last = store
      return run(store, fn, ...args)
    }) as typeof storage.run
    storage.getStore = () => getStore() ?? last
  }
}
