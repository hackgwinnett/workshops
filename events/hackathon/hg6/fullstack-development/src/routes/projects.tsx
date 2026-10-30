import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { projectsQuery } from '../server/projects'
import { xfetch } from '../xray'

export const Route = createFileRoute('/projects')({
  // Prefetch on the server so the first paint already has data.
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  component: Leaderboard,
})

function Leaderboard() {
  const { data: projects } = useSuspenseQuery(projectsQuery)
  const queryClient = useQueryClient()

  // This calls a classic REST endpoint: POST /api/vote (src/routes/api/vote.ts)
  const vote = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await xfetch('/api/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error ?? 'Vote failed')
      return json
    },

    // ─────────────────────────────────────────────────────────────
    // 🟨 QUEST 3 — Make it feel instant (optimistic updates)
    //
    // Right now the number only changes after the server replies.
    // Add an `onMutate` that bumps the vote count in the cache
    // IMMEDIATELY with queryClient.setQueryData(projectsQuery.queryKey, ...)
    // and an `onError` that rolls it back.
    //
    // Test it: set the "slow network" option in DevTools → Network.
    // Docs: tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
    // ─────────────────────────────────────────────────────────────

    onSettled: () => queryClient.invalidateQueries({ queryKey: projectsQuery.queryKey }),
  })

  return (
    <main>
      <h1>Leaderboard</h1>
      {vote.isError && <p className="error">⚠️ {vote.error.message}</p>}
      <ol className="list board">
        {projects.map((p, i) => (
          <li key={p.id}>
            <span className="rank">#{i + 1}</span>
            <span>
              <b>{p.name}</b>
              <br />
              <span className="muted">{p.tagline}</span>
            </span>
            <button className="vote" onClick={() => vote.mutate(p.id)}>
              ▲ {p.votes}
            </button>
          </li>
        ))}
      </ol>
    </main>
  )
}
