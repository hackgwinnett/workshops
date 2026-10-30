import { createMiddleware } from '@tanstack/react-start'
import { useSyncExternalStore } from 'react'

// ─────────────────────────────────────────────────────────────
// X-RAY: a function middleware that wraps EVERY server function.
// Registered globally in src/start.ts.
//
// .client() runs in the browser around the call  -> measures round-trip and
//            keeps what was sent and what came back (hover a row to see it)
// .server() runs on the server around the handler -> logs to your terminal
//            and sends the function's name back to the browser
// ─────────────────────────────────────────────────────────────

export type XrayEntry = {
  id: number
  name: string
  file: string
  ms: number
  ok: boolean
  at: string
  /** What the browser sent (the server function's `data`, or a fetch body). */
  input?: unknown
  /** What the server sent back (or the error message). */
  output?: unknown
}

let entries: XrayEntry[] = []
const listeners = new Set<() => void>()
let nextId = 1

function record(e: Omit<XrayEntry, 'id' | 'at'>) {
  if (e.name === 'checkQuests') return // the /quests auto-refresh would flood the panel
  entries = [{ ...e, id: nextId++, at: new Date().toLocaleTimeString() }, ...entries].slice(0, 30)
  listeners.forEach((l) => l())
}

export function useXray() {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => entries,
    () => entries,
  )
}

/** fetch() that also shows up in the X-ray panel (for plain REST endpoints). */
export async function xfetch(url: string, init?: RequestInit) {
  const start = performance.now()
  const res = await fetch(url, init)
  const ms = Math.round(performance.now() - start)
  // Read a copy of the body so the caller can still read the original.
  const output = await res.clone().text().then(parseJson, () => undefined)
  record({ name: `${init?.method ?? 'GET'} ${url}`, file: 'fetch', ms, ok: res.ok, input: parseJson(init?.body), output })
  return res
}

function parseJson(body: unknown) {
  if (typeof body !== 'string') return body ?? undefined
  try {
    return JSON.parse(body)
  } catch {
    return body
  }
}

export const xrayMiddleware = createMiddleware({ type: 'function' })
  .client(async ({ next, filename, data }) => {
    const start = performance.now()
    try {
      const result = await next()
      if (typeof window !== 'undefined') {
        const ctx = result.context as { fnName?: string } | undefined
        // `result` (the function's return value) is there at runtime, just not in the types.
        const output = (result as { result?: unknown }).result
        record({ name: ctx?.fnName ?? 'serverFn', file: filename, ms: Math.round(performance.now() - start), ok: true, input: data, output })
      }
      return result
    } catch (err) {
      if (typeof window !== 'undefined') {
        const output = err instanceof Error ? err.message : err
        record({ name: 'serverFn', file: filename, ms: Math.round(performance.now() - start), ok: false, input: data, output })
      }
      throw err
    }
  })
  .server(async ({ next, serverFnMeta }) => {
    const start = Date.now()
    const result = await next({ sendContext: { fnName: serverFnMeta.name } })
    console.log(`\x1b[36m[server]\x1b[0m ${serverFnMeta.name}() ran in ${Date.now() - start}ms  (${serverFnMeta.filename})`)
    return result
  })
