import { HeadContent, Link, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { XrayPanel } from '../components/XrayPanel'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HackBoard · Explore-A-Stack' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header className="nav">
          <Link to="/" className="logo">
            [HG] HackBoard
          </Link>
          <nav>
            <Link to="/schedule" activeProps={{ className: 'active' }}>Schedule</Link>
            <Link to="/teams" activeProps={{ className: 'active' }}>Teams</Link>
            <Link to="/projects" activeProps={{ className: 'active' }}>Leaderboard</Link>
            <Link to="/quests" activeProps={{ className: 'active' }} className="quests-link">Quests</Link>
          </nav>
        </header>
        {children}
        <XrayPanel />
        <Scripts />
      </body>
    </html>
  )
}
