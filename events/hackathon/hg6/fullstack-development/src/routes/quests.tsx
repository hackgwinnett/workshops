import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { checkQuests } from '../server/quests'

export const Route = createFileRoute('/quests')({
  loader: () => checkQuests(),
  component: Quests,
})

function Quests() {
  const quests = Route.useLoaderData()
  const router = useRouter()
  const done = quests.filter((q) => q.done).length
  const showAll = useShowAllQuests()

  // Each quest unlocks once the one before it is done.
  // To see them all: localStorage.setItem('showAllQuests', 'true') in the console.
  const visible = showAll ? quests : quests.filter((_, i) => i === 0 || quests[i - 1].done)
  const locked = quests.length - visible.length

  // Re-check every few seconds while you code.
  useEffect(() => {
    const t = setInterval(() => router.invalidate(), 4000)
    return () => clearInterval(t)
  }, [router])

  return (
    <main>
      <p className="eyebrow">Explore-A-Stack</p>
      <h1>
        Quests <span className="muted">{done}/{quests.length}</span>
      </h1>
      <div className="progress">
        <div style={{ width: `${(done / quests.length) * 100}%` }} />
      </div>
      <ul className="quests">
        {visible.map((q) => (
          <li key={q.id} className={q.done ? 'done' : ''}>
            <span className="check">{q.done ? '✓' : q.id === 'boss' ? '👾' : '○'}</span>
            <div>
              <b>{q.title}</b> <span className="pill">{q.layer}</span>
              {!q.done && q.hint && <p className="muted">{q.hint}</p>}
            </div>
          </li>
        ))}
      </ul>
      {locked > 0 && (
        <p className="muted">
          🔒 {locked} more quest{locked > 1 && 's'} unlock{locked === 1 && 's'} as you finish this one.
        </p>
      )}
      {done === quests.length && <p className="win">🎉 Full stack cleared. Try a side quest from the README.</p>}
      <p className="muted small">This page re-checks your code every 4 seconds.</p>
    </main>
  )
}

// localStorage only exists in the browser, so read it after the page loads
// (the server render always starts with quests hidden).
function useShowAllQuests() {
  const [showAll, setShowAll] = useState(false)
  useEffect(() => {
    const read = () => setShowAll(localStorage.getItem('showAllQuests') === 'true')
    read()
    window.addEventListener('storage', read)
    // Also pick up a change made in this tab's console on the next re-check.
    const t = setInterval(read, 1000)
    return () => {
      window.removeEventListener('storage', read)
      clearInterval(t)
    }
  }, [])
  return showAll
}
