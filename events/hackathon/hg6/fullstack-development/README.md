# 🟩 Explore-A-Stack: HackBoard

A real full-stack app built with TanStack Start. Parts of it are missing, and one part is dangerously broken. Your job is to fix it one layer at a time.

---

## 1. Open it (≈1 min)

**Easiest: in your browser.** Open the link your instructor gives you (it opens this repo in StackBlitz). Wait for `npm install` to finish, and the app opens in a preview pane. Nothing gets installed on your computer.

**On your own laptop** (needs Node.js 22+):

```bash
git clone https://github.com/hackgwinnett/workshops.git
cd workshops/events/hackathon/hg6/fullstack-development
npm install
npm run dev        # → http://localhost:3000
```

**GH Codespaces as a StackBlitz alternative:** On the GitHub repo page click **Code → Codespaces → Create codespace**, then run `cd events/hackathon/hg6/fullstack-development && npm install && npm run dev`.

## 2. Find your way around (≈2 min)

```
src/
  routes/              ← every file here is a page (file-based routing)
    __root.tsx         the layout: nav bar + X-ray panel
    index.tsx          /
    schedule.tsx       /schedule        ← Quest 2
    teams/index.tsx    /teams           ← Quest 1
    projects.tsx       /projects        ← Quest 3
    quests.tsx         /quests          (your progress)
    api/vote.ts        POST /api/vote   (a plain REST endpoint)
  server/              ← code that only runs on the SERVER
    db.ts              the "database" (in memory)
    teams.ts           example server functions
    votes.ts           ← Boss quest
  xray.ts              middleware that powers the 🩻 X-ray panel
```

Two things to keep open:

- **`/quests`** re-checks your code every 4 seconds and turns green when you finish.
- **🩻 X-ray panel** (bottom right) lists every call from your browser to the server and how long it took (hover for details). Your **terminal** prints the same calls from the server's side. [[PRELOADING](https://tanstack.com/router/latest/docs/guide/preloading) IS OFF IN THIS SITE. If it was on, then an intent to load a page--like hovering a link--would preload the data and call those functions]

> 💡 The first page load is rendered on the server (SSR), so it doesn't show up in X-ray. Click the nav links to see calls appear.

Search the code for `QUEST` to find each task.

---

## 🟦 Quest 1: A page for every team · *TanStack Router*

`/teams` lists the teams, but you can't click into one.

1. Create **`src/routes/teams/$teamId.tsx`**. The `$` means "this part of the URL is a variable".
2. Give it a `loader` that calls `getTeam({ data: { teamId: params.teamId } })` from `src/server/teams.ts`.
3. Show the team's members and project using `Route.useLoaderData()`.
4. In `teams/index.tsx`, swap the team name for
   `<Link to="/teams/$teamId" params={{ teamId: t.id }}>{t.name}</Link>`.

🧪 **Try this:** add the `<Link>` *before* step 1. TypeScript underlines it in red because that route doesn't exist yet. Misspell `teamId` and it complains again. That's type-safe routing.

<details><summary>Stuck? Skeleton</summary>

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { getTeam } from '../../server/teams'

export const Route = createFileRoute('/teams/$teamId')({
  loader: ({ params }) => getTeam({ data: { teamId: params.teamId } }),
  component: TeamPage,
})

function TeamPage() {
  const team = Route.useLoaderData()
  return <main><h1>{team.name}</h1>{/* members, project… */}</main>
}
```
</details>

## 🟩 Quest 2: Move the schedule to the server · *Server functions*

`/schedule` is **hard-coded in the browser**: it ships to every visitor and can only change if we redeploy. The real schedule lives on the server in `db.events`.

1. In `schedule.tsx`, create a server function:
   ```ts
   const getSchedule = createServerFn({ method: 'GET' }).handler(async () => db.events)
   ```
2. Add `loader: () => getSchedule()` to the route.
3. Read it with `Route.useLoaderData()` and delete `HARDCODED_EVENTS`.

🧪 **Check:** go to `/` and click **Schedule**. X-ray shows `getSchedule()`, and your terminal shows `[server] getSchedule() ran in …`. Now open DevTools → Sources and search for `db.events`: it's not in the browser.

## 🟨 Quest 3: Make votes feel instant · *TanStack Query*

On `/projects` the vote count only changes after the server replies. On a slow connection that feels broken.

Add **optimistic updates** to the `useMutation` in `projects.tsx`:

- `onMutate`: cancel queries, save the old data, and `queryClient.setQueryData(projectsQuery.queryKey, …)` with the vote already added. Return the old data.
- `onError`: put the old data back.

🧪 **Check:** DevTools → Network → throttle to **Slow 4G** and vote. The number should change instantly.

📖 [Optimistic updates guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

## 👾 Boss: Break it, fix it · *Security*

The voting endpoint **trusts the client**. Prove it, then fix it.

**Break it.** On `/projects`, open the browser console and run:

```js
fetch('/api/vote', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ projectId: 'p4', amount: 1000 }),
})
```

Refresh. BusBell just won the hackathon. 🙃

**Fix it** in `src/server/votes.ts`, so that:

- a vote always counts as **exactly 1** (ignore `amount`)
- each voter can vote for a project **only once**
- bad input (`null`, unknown ids, wrong types) returns `{ ok: false, error }` instead of crashing

Hint: `zod` is installed. `z.object({ projectId: z.string() }).safeParse(body)`.

> 🧠 **The lesson:** the client is what the user gets, and **the user controls it**. Anything the browser sends can be faked. The server is the source of truth.

---

## 🗺️ Side quests (if you finish early)

| Side quest | Tech |
|---|---|
| Add a team sign-up form at `/teams/new` that validates on both the client and the server with the same zod schema | TanStack Form + zod |
| Let people sort and filter the leaderboard | TanStack Table |
| Persist votes to a real database (SQLite via Turso, or Postgres via Neon/Supabase) | Server functions |
| Real accounts: replace the `voterId` cookie (try clearing your cookies… 👀) | Auth (e.g. Better Auth) |
| Deploy your fork | Netlify / Vercel / Cloudflare |

## Cheat sheet

```ts
// A server function: runs on the server, called like a normal function
const getThing = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))        // validate input (runs on the server)
  .handler(async ({ data }) => db.things.find(t => t.id === data.id))

// A route with a loader
export const Route = createFileRoute('/things/$id')({
  loader: ({ params }) => getThing({ data: { id: params.id } }),
  component: () => <pre>{JSON.stringify(Route.useLoaderData())}</pre>,
})

// A REST endpoint (server route)
export const Route = createFileRoute('/api/ping')({
  server: { handlers: { GET: () => Response.json({ pong: true }) } },
})
```

📖 Docs: [TanStack Start](https://tanstack.com/start/latest) · [Router](https://tanstack.com/router/latest) · [Query](https://tanstack.com/query/latest)
