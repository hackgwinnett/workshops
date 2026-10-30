import { useState } from 'react'
import { useXray } from '../xray'

export function XrayPanel() {
  const entries = useXray()
  const [open, setOpen] = useState(true)

  return (
    <aside className={`xray ${open ? 'open' : ''}`}>
      <button className="xray-toggle" onClick={() => setOpen((o) => !o)}>
        🩻 X-ray {entries.length > 0 && <span className="badge">{entries.length}</span>}
      </button>
      {open && (
        <div className="xray-body">
          <p className="xray-hint">
            Server functions called <b>from this tab</b>.
          </p>
          {entries.length === 0 ? (
            <p className="muted">No calls yet.</p>
          ) : (
            <ul>
              {entries.map((e) => (
                <li key={e.id} className={e.ok ? '' : 'err'} tabIndex={0}>
                  <span className="tag client">browser</span>→<span className="tag server">server</span>
                  <code>{e.file === 'fetch' ? e.name : `${e.name}()`}</code>
                  <span className="ms">{e.ms}ms</span>
                  <div className="xray-peek">
                    <p className="muted small">
                      {e.at}
                      {e.file && ` · ${e.file === 'fetch' ? 'fetch()' : e.file}`}
                    </p>
                    <b>sent</b>
                    <pre>{show(e.input)}</pre>
                    <b>{e.ok ? 'got back' : 'error'}</b>
                    <pre>{show(e.output)}</pre>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  )
}

/** Pretty JSON, cut short so a big list doesn't swallow the screen. */
function show(value: unknown) {
  if (value === undefined) return '(nothing)'
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return text.length > 1500 ? `${text.slice(0, 1500)}\n…` : text
}
