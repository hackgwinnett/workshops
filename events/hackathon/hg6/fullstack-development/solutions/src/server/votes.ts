import { z } from 'zod'
import type { Store } from './db'

// ✅ BOSS SOLUTION — never trust the client.
// The server decides what a vote is worth; the client only says which project.

const VoteBody = z.object({ projectId: z.string() })

export type VoteResult = { ok: true; votes: number } | { ok: false; error: string }

export function castVote(store: Store, body: unknown, voterId: string): VoteResult {
  const parsed = VoteBody.safeParse(body)
  if (!parsed.success) return { ok: false, error: 'Invalid vote' }

  const project = store.projects.find((p) => p.id === parsed.data.projectId)
  if (!project) return { ok: false, error: 'No such project' }

  const ballot = store.ballots[voterId] ?? []
  if (ballot.includes(project.id)) return { ok: false, error: 'You already voted for this project' }

  project.votes += 1 // always exactly one, whatever the client sent
  store.ballots[voterId] = [...ballot, project.id]
  return { ok: true, votes: project.votes }
}
