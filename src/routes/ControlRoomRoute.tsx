import { useState } from "react";
import { SeatManager } from "@seatlayer/react/manager";
import type {
  EventScopedManageToken,
  SeatManagerConnection,
  SeatManagerTallies,
} from "@seatlayer/react/manager";
import { RouteIntro } from "../components/RouteIntro";
import { SetupNotice } from "../components/SetupNotice";
import { currency, eventKey, isConfigured } from "../lib/config";

function isManageToken(value: string): value is EventScopedManageToken {
  return value.startsWith("mse_");
}

/**
 * The organizer board.
 *
 * `SeatManager` needs a short-lived, event-scoped `mse_` grant that your own
 * backend mints after it has authenticated a member of staff. A secret key is
 * never accepted here and must never reach a browser. The token typed below is
 * kept in component state for the life of the page and is never written to
 * storage, a URL or a log.
 *
 * `mode="view"` is the read-only live board. The tools list keeps it that way:
 * blocking, categories, tables and channels are left out, and the token's own
 * capabilities remain the real gate.
 */
export function ControlRoomRoute() {
  const [draft, setDraft] = useState("");
  const [token, setToken] = useState<EventScopedManageToken | null>(null);
  const [tallies, setTallies] = useState<SeatManagerTallies | null>(null);
  const [connection, setConnection] = useState<SeatManagerConnection | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openBoard() {
    const value = draft.trim();
    if (!isManageToken(value)) {
      setError("An event-scoped manage token starts with mse_.");
      return;
    }
    setError(null);
    setToken(value);
    setDraft("");
  }

  return (
    <>
      <RouteIntro
        title="The organizer board"
        question="How do staff watch live inventory for one event without an account in my product and without a secret key in the browser?"
        docsHref="https://docs.seatlayer.io/platform/embedded-control-room/"
        docsLabel="Embedded Control Room"
      />

      {isConfigured ? (
        token ? (
          <div className="layout">
            <section className="map-panel">
              <SeatManager
                eventKey={eventKey}
                token={token}
                mode="view"
                tools={["view", "inspect"]}
                currency={currency}
                className="seatmap"
                onTallies={setTallies}
                onConnectionChange={setConnection}
                onError={(cause: unknown) =>
                  setError(cause instanceof Error ? cause.message : "The board could not load")
                }
              />
            </section>

            <aside className="cart-panel">
              <h2>Live inventory</h2>
              {tallies ? (
                <ul className="seat-list">
                  <li>
                    <span>Free</span>
                    <span className="price">{tallies.free}</span>
                  </li>
                  <li>
                    <span>Held</span>
                    <span className="price">{tallies.held}</span>
                  </li>
                  <li>
                    <span>Booked</span>
                    <span className="price">{tallies.booked}</span>
                  </li>
                  <li>
                    <span>Blocked</span>
                    <span className="price">{tallies.blocked}</span>
                  </li>
                </ul>
              ) : (
                <p className="muted">Waiting for the first snapshot.</p>
              )}
              {connection ? (
                <p className="muted small">Realtime link: {connection.status}</p>
              ) : null}
              {error ? <p className="error">{error}</p> : null}
              <div className="actions">
                <button type="button" onClick={() => setToken(null)}>
                  Close the board
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <section className="setup">
            <h2>Paste an event-scoped manage token</h2>
            <p>
              Your backend mints this token for one event after it authenticates a member of
              staff. It is short lived, it is not stored by this page, and it is not a secret
              key.
            </p>
            <label className="field">
              <span>Manage token</span>
              <input
                type="password"
                value={draft}
                placeholder="mse_..."
                autoComplete="off"
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
            <div className="actions">
              <button type="button" className="primary" onClick={openBoard}>
                Open the board
              </button>
            </div>
            {error ? <p className="error">{error}</p> : null}
          </section>
        )
      ) : (
        <SetupNotice variables={["VITE_SEATLAYER_EVENT_KEY", "VITE_SEATLAYER_PUBLIC_KEY"]} />
      )}
    </>
  );
}
