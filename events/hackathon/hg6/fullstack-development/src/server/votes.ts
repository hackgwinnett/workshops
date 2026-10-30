import type { Store } from './db'

// ─────────────────────────────────────────────────────────────
// 👾 BOSS QUEST — "Break it, fix it"
//
// This is the logic behind POST /api/vote (see src/routes/api/vote.ts).
// It has a serious bug: it TRUSTS THE CLIENT.
//
// 1. BREAK IT: open your browser console on /projects and run:
//
//      fetch('/api/vote', {
//        method: 'POST',
//        headers: { 'content-type': 'application/json' },
//        body: JSON.stringify({ projectId: 'p4', amount: 1000 }),
//      })
//
//    Refresh the leaderboard. 🙃
//
// 2. FIX IT so that:
//    - a vote always counts as exactly 1 (ignore `amount`)
//    - each voterId can vote for a project only once
//    - unknown project ids return { ok: false } instead of crashing
//    Hint: validate the body with zod (already installed).
// ─────────────────────────────────────────────────────────────

export type VoteResult = { ok: true; votes: number } | { ok: false; error: string }

export function castVote(store: Store, body: any, voterId: string): VoteResult {
  const project = store.projects.find((p) => p.id === body.projectId)!

  project.votes += body.amount ?? 1 // 🐛 the client decides how many votes?!

  store.ballots[voterId] = [...(store.ballots[voterId] ?? []), project.id]
  return { ok: true, votes: project.votes }
}
