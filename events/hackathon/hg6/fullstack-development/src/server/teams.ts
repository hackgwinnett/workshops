import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { db } from './db'

// ✅ EXAMPLE: this is what a server function looks like.
// You call it like a normal async function from a loader or component,
// but TanStack Start turns the call into an HTTP request and runs the
// handler on the server.

export const getTeams = createServerFn({ method: 'GET' }).handler(async () => {
  return db.teams.map((t) => ({ id: t.id, name: t.name, size: t.members.length }))
})

// Used in Quest 1 — already written for you.
export const getTeam = createServerFn({ method: 'GET' })
  .validator(z.object({ teamId: z.string() }))
  .handler(async ({ data }) => {
    const team = db.teams.find((t) => t.id === data.teamId)
    if (!team) throw notFound()
    const project = db.projects.find((p) => p.id === team.projectId)
    return { ...team, project }
  })
