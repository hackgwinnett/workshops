import { createFileRoute } from '@tanstack/react-router'

// ─────────────────────────────────────────────────────────────
// 🟩 QUEST 2 — Move the data to the server
//
// Right now the schedule is HARD-CODED in this file, which means it
// ships to every browser and can only change if we redeploy.
// The server already has the real schedule in src/server/db.ts (db.events).
//
// 1. Create a server function (see src/server/teams.ts for an example):
//      const getSchedule = createServerFn({ method: 'GET' })
//        .handler(async () => db.events)
// 2. Add a `loader` to this route that calls it.
// 3. In the component, read it with Route.useLoaderData()
// 4. Delete HARDCODED_EVENTS.
//
// ✅ Check: navigate to /schedule from another page and watch the X-ray panel.
// ─────────────────────────────────────────────────────────────

const HARDCODED_EVENTS = [
  { id: 'x1', time: '09:00', name: 'Opening ceremony', room: 'Main hall' },
  { id: 'x2', time: '12:00', name: 'Lunch', room: 'Cafeteria' },
]

export const Route = createFileRoute('/schedule')({
  component: Schedule,
})

function Schedule() {
  const events = HARDCODED_EVENTS

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
