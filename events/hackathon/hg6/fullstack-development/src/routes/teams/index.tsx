import { createFileRoute } from '@tanstack/react-router'
import { getTeams } from '../../server/teams'

export const Route = createFileRoute('/teams/')({
  loader: () => getTeams(),
  component: Teams,
})

function Teams() {
  const teams = Route.useLoaderData()

  return (
    <main>
      <h1>Teams</h1>
      <ul className="list">
        {teams.map((t) => (
          <li key={t.id}>
            <span className="time">{t.size} 👤</span>
            {/* ─────────────────────────────────────────────────────
                🟦 QUEST 1 — A page for every team

                1. Create the file  src/routes/teams/$teamId.tsx
                   (the $ means "this part of the URL is a variable")
                2. In it, add a loader that calls getTeam({ data: { teamId: params.teamId } })
                   from src/server/teams.ts, and show the team's members + project.
                3. Then swap the <span> below for this Link:

                   <Link to="/teams/$teamId" params={{ teamId: t.id }}>{t.name}</Link>

                Try the Link BEFORE step 1: TypeScript underlines it in red
                because that route doesn't exist yet. That's type-safe routing.
               ───────────────────────────────────────────────────── */}
            <span>{t.name}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
