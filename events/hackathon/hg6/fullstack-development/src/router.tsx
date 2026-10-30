import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Shown while a route's loader is still running.
    defaultPendingComponent: () => (
      <main aria-busy="true" aria-label="Loading">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </main>
    ),
    defaultNotFoundComponent: () => (
      <main>
        <h1>404</h1>
        <p>That page doesn’t exist (yet 👀).</p>
      </main>
    ),
  })

  // Lets loaders prefetch queries on the server and hand them to the browser.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
