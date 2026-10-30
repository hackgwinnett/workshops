import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main>
      <p className="eyebrow">Hackathon 6.0 · Explore-A-Stack</p>
      <h1>Welcome to HackBoard</h1>
      <p className="lead">
        This is a real full-stack app built with <b>TanStack Start</b>. Some parts are missing and one part is
        dangerously broken. Your job: fix it, one layer at a time.
      </p>

      <div className="cards">
        <Link to="/schedule" className="card">
          <span className="pill l">client</span>
          <h3>Schedule</h3>
          <p>Hard-coded in the browser. Move it to the server.</p>
        </Link>
        <Link to="/teams" className="card">
          <span className="pill r">router</span>
          <h3>Teams</h3>
          <p>Every team needs its own page.</p>
        </Link>
        <Link to="/projects" className="card">
          <span className="pill s">server</span>
          <h3>Leaderboard</h3>
          <p>Voting works… a little too well.</p>
        </Link>
      </div>

      <p>
        <b>Workshop participants</b>, start here! <Link to="/quests">/quests</Link> shows your progress and updates as you code.
      </p>
    </main>
  )
}
