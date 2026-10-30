import { createServerFn } from '@tanstack/react-start'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createSeedStore } from './db'
import { castVote } from './votes'

// The quest checker is ITSELF a server function: it reads your source
// files and runs your code on the server, then sends the results to the browser.
// (Reading files is something only the server can do.)

export type QuestStatus = { id: string; title: string; layer: string; done: boolean; hint: string }

async function src(path: string) {
  try {
    return await readFile(join(process.cwd(), 'src', path), 'utf8')
  } catch {
    return null
  }
}

function bossChecks(): string | null {
  // 1. amount from the client must be ignored
  let s = createSeedStore()
  const before = s.projects.find((p) => p.id === 'p4')!.votes
  try {
    castVote(s, { projectId: 'p4', amount: 1000 }, 'hacker')
  } catch {
    /* rejecting is also fine */
  }
  const after = s.projects.find((p) => p.id === 'p4')!.votes
  if (after - before > 1) return `A single request added ${after - before} votes. Ignore \`amount\`.`

  // 2. one vote per voter per project
  s = createSeedStore()
  castVote(s, { projectId: 'p1' }, 'same-person')
  castVote(s, { projectId: 'p1' }, 'same-person')
  const diff = s.projects.find((p) => p.id === 'p1')!.votes - createSeedStore().projects.find((p) => p.id === 'p1')!.votes
  if (diff > 1) return 'The same voter can vote twice for one project.'

  // 3. garbage input returns { ok: false } instead of crashing
  for (const bad of [{ projectId: 'nope' }, {}, null, { projectId: 42 }]) {
    try {
      const r = castVote(createSeedStore(), bad, 'x')
      if (r.ok) return `Input ${JSON.stringify(bad)} was accepted.`
    } catch {
      return `Input ${JSON.stringify(bad)} crashed the server. Return { ok: false, error } instead.`
    }
  }
  return null
}

export const checkQuests = createServerFn({ method: 'GET' }).handler(async (): Promise<QuestStatus[]> => {
  const teamRoute = await src('routes/teams/$teamId.tsx')
  const teamsIndex = await src('routes/teams/index.tsx')
  const schedule = await src('routes/schedule.tsx')
  const projects = await src('routes/projects.tsx')
  const boss = bossChecks()

  const q1 =
    !!teamRoute &&
    teamRoute.includes("createFileRoute('/teams/$teamId')") &&
    teamRoute.includes('getTeam') &&
    !!teamsIndex &&
    /<Link[^>]*to="\/teams\/\$teamId"/.test(teamsIndex)

  const q2 =
    !!schedule &&
    !schedule.includes('HARDCODED_EVENTS') &&
    schedule.includes('createServerFn') &&
    schedule.includes('loader') &&
    schedule.includes('useLoaderData')

  const q3 = !!projects && /onMutate\s*[:(]/.test(projects) && projects.includes('setQueryData')

  return [
    {
      id: 'q1',
      title: 'Quest 1 · A page for every team',
      layer: 'Router',
      done: q1,
      hint: !teamRoute
        ? 'Create src/routes/teams/$teamId.tsx'
        : !teamRoute.includes('getTeam')
          ? 'Call getTeam() from the route loader'
          : 'Swap the team name <span> for a <Link to="/teams/$teamId">',
    },
    {
      id: 'q2',
      title: 'Quest 2 · Move the schedule to the server',
      layer: 'Server function',
      done: q2,
      hint: schedule?.includes('HARDCODED_EVENTS')
        ? 'Delete HARDCODED_EVENTS once your loader works'
        : 'Use createServerFn + loader + Route.useLoaderData()',
    },
    {
      id: 'q3',
      title: 'Quest 3 · Optimistic votes',
      layer: 'TanStack Query',
      done: q3,
      hint: 'Add onMutate that calls queryClient.setQueryData(...)',
    },
    {
      id: 'boss',
      title: 'Boss · Break it, fix it',
      layer: 'Security',
      done: boss === null,
      hint: boss ?? '',
    },
  ]
})
