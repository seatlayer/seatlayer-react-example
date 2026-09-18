import { useRef, useState } from "react";
import { SeatingChart } from "@seatlayer/react";
import type { HoldResult, SeatingChartHandle, SelectedSeat } from "@seatlayer/react";
import { RouteIntro } from "../components/RouteIntro";
import { SetupNotice } from "../components/SetupNotice";
import { SelectionSummary } from "../components/SelectionSummary";
import { events } from "../lib/events";
import { currency, isConfigured, publicKey } from "../lib/config";

/**
 * One page, several events, one chart.
 *
 * Each event has its own inventory, so the chart is rebuilt when the buyer
 * switches. Any open hold belongs to the event it was created on: release it
 * first, otherwise those seats stay off the market until they expire.
 */
export function EventsRoute() {
  const chartRef = useRef<SeatingChartHandle>(null);
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [seats, setSeats] = useState<SelectedSeat[]>([]);
  const [hold, setHold] = useState<HoldResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = seats.reduce((sum, seat) => sum + (seat.price ?? 0), 0);

  async function switchEvent(next: (typeof events)[number]) {
    setError(null);
    if (hold) {
      await chartRef.current?.release();
      setHold(null);
    }
    setSeats([]);
    setSelectedEvent(next);
  }

  return (
    <>
      <RouteIntro
        title="Several events on one page"
        question="How do I show several events on one page and swap the seat map when the buyer picks a different date?"
        docsHref="https://docs.seatlayer.io/server-api/events/"
        docsLabel="Events API"
      />

      {isConfigured ? (
        <div className="layout">
          <section className="map-panel">
            <div className="event-list" role="group" aria-label="Events">
              {events.map((option, index) => (
                <button
                  key={`${option.key}-${index}`}
                  type="button"
                  className={option === selectedEvent ? "chip active" : "chip"}
                  onClick={() => void switchEvent(option)}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <SeatingChart
              key={selectedEvent.key}
              ref={chartRef}
              event={selectedEvent.key}
              publicKey={publicKey}
              currency={currency}
              maxSelection={6}
              className="seatmap"
              onSelectionChange={setSeats}
              onHold={setHold}
              onHoldExpired={() => setHold(null)}
              onError={(cause: unknown) =>
                setError(cause instanceof Error ? cause.message : "The seat map could not load")
              }
            />
          </section>

          <aside className="cart-panel">
            <h2>{selectedEvent.name}</h2>
            <SelectionSummary seats={seats} total={total} />
            {error ? <p className="error">{error}</p> : null}
            <div className="actions">
              <button
                type="button"
                className="primary"
                disabled={seats.length === 0}
                onClick={() => void chartRef.current?.hold().then(setHold)}
              >
                Hold these seats
              </button>
            </div>
            {hold ? <p className="muted small">Hold id: {hold.holdId}</p> : null}
            <p className="muted">
              The list comes from <code>src/lib/events.ts</code>. A real catalogue is read on
              your server with a secret key and sent to the browser as plain data.
            </p>
          </aside>
        </div>
      ) : (
        <SetupNotice variables={["VITE_SEATLAYER_EVENT_KEY", "VITE_SEATLAYER_PUBLIC_KEY"]} />
      )}
    </>
  );
}
