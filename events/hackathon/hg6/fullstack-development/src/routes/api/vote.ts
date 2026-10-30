import { createFileRoute } from '@tanstack/react-router'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { db } from '../../server/db'
import { castVote } from '../../server/votes'

// A server ROUTE: a plain HTTP endpoint, like you'd write in Express or Flask.
// No component, just handlers. Any client (browser, phone app, curl) can call it.

export const Route = createFileRoute('/api/vote')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let voterId = getCookie('voterId')
        if (!voterId) {
          voterId = crypto.randomUUID()
          setCookie('voterId', voterId, { httpOnly: true, sameSite: 'lax', path: '/' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ ok: false, error: 'Body must be JSON' }, { status: 400 })
        }

        try {
          const result = castVote(db, body, voterId)
          return Response.json(result, { status: result.ok ? 200 : 400 })
        } catch (err) {
          console.error('[server] castVote crashed:', err)
          return Response.json({ ok: false, error: 'Server error' }, { status: 500 })
        }
      },
    },
  },
})
