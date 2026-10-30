import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '../server/db'

// Runs only on the server. The browser gets the result, never this code.
const getSchedule = createServerFn({ method: 'GET' }).handler(async () => db.events)

export const Route = createFileRoute('/schedule')({
  loader: () => getSchedule(),
  component: Schedule,
})

function Schedule() {
  const events = Route.useLoaderData()

  return (
    <main>
      <h1>Schedule</h1>
      <ul className="list">
        {events.map((e) => (
          <li key={e.id}>
            <span className="time">{e.time}</span>
            <span>{e.name}</span>
            <span className="muted">{e.room}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
