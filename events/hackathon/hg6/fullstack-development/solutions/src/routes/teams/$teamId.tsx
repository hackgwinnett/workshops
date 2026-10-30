import { Link, createFileRoute } from '@tanstack/react-router'
import { getTeam } from '../../server/teams'

export const Route = createFileRoute('/teams/$teamId')({
  loader: ({ params }) => getTeam({ data: { teamId: params.teamId } }),
  component: TeamPage,
})

function TeamPage() {
  const team = Route.useLoaderData()

  return (
    <main>
      <p className="eyebrow">
        <Link to="/teams">← all teams</Link>
      </p>
      <h1>{team.name}</h1>
      <h3>Members</h3>
      <ul className="list">
        {team.members.map((m) => (
          <li key={m}>
            <span className="time">👤</span>
            <span>{m}</span>
          </li>
        ))}
      </ul>
      {team.project && (
        <>
          <h3>Project</h3>
          <p>
            <b>{team.project.name}</b> · {team.project.tagline}
          </p>
        </>
      )}
    </main>
  )
}
