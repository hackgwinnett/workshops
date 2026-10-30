// A tiny in-memory "database".
// Real apps would use Postgres, SQLite, etc. — but the idea is the same:
// this file only ever runs on the SERVER. The browser never sees it.

export type Event = { id: string; time: string; name: string; room: string }
export type Team = { id: string; name: string; members: string[]; projectId: string }
export type Project = { id: string; name: string; tagline: string; teamId: string; votes: number }

export type Store = {
  events: Event[]
  teams: Team[]
  projects: Project[]
  /** voterId -> projectIds they've voted for */
  ballots: Record<string, string[]>
}

export function createSeedStore(): Store {
  return {
    events: [
      { id: 'e1', time: '09:00', name: 'Opening ceremony', room: 'Main hall' },
      { id: 'e2', time: '09:30', name: 'Full Stack Development workshop', room: 'Lab A' },
      { id: 'e3', time: '12:00', name: 'Lunch', room: 'Cafeteria' },
      { id: 'e4', time: '15:00', name: 'Submissions due', room: 'Online' },
      { id: 'e5', time: '16:00', name: 'Demos & judging', room: 'Main hall' },
    ],
    teams: [
      { id: 'byte-club', name: 'Byte Club', members: ['Ava', 'Kofi', 'Mei'], projectId: 'p1' },
      { id: 'null-pointers', name: 'Null Pointers', members: ['Diego', 'Sam'], projectId: 'p2' },
      { id: 'stack-overflowers', name: 'Stack Overflowers', members: ['Noor', 'Eli', 'Jun', 'Rae'], projectId: 'p3' },
      { id: 'git-gud', name: 'Git Gud', members: ['Theo', 'Amara'], projectId: 'p4' },
    ],
    projects: [
      { id: 'p1', name: 'LunchLine', tagline: 'See the cafeteria queue before you leave class', teamId: 'byte-club', votes: 12 },
      { id: 'p2', name: 'StudyBuddy', tagline: 'Match with classmates studying the same unit', teamId: 'null-pointers', votes: 9 },
      { id: 'p3', name: 'LockerMap', tagline: 'Never forget your locker combo (securely)', teamId: 'stack-overflowers', votes: 15 },
      { id: 'p4', name: 'BusBell', tagline: 'Pings you when your bus is 2 stops away', teamId: 'git-gud', votes: 7 },
    ],
    ballots: {},
  }
}

// Keep one store alive across hot reloads in dev.
const g = globalThis as unknown as { __hackboard?: Store }
export const db: Store = (g.__hackboard ??= createSeedStore())
