import { Link, createFileRoute } from '@tanstack/react-router'
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
            <Link to="/teams/$teamId" params={{ teamId: t.id }}>
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
