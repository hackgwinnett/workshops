import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { db } from './db'

export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return [...db.projects].sort((a, b) => b.votes - a.votes)
})

// TanStack Query caches the result under this key.
// Loaders use it to prefetch on the server; components read it with useQuery.
export const projectsQuery = queryOptions({
  queryKey: ['projects'],
  queryFn: () => getProjects(),
})

export type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number]
