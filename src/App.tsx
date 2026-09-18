import { useCallback } from "react";
import { SeatMap } from "./components/SeatMap";
import { SelectionSummary } from "./components/SelectionSummary";
import { HoldCountdown } from "./components/HoldCountdown";
import { CheckoutBar } from "./components/CheckoutBar";
import { useSeatSelection } from "./lib/useSeatSelection";
import { isConfigured } from "./lib/config";

export default function App() {
  const {
    chartRef,
    seats,
    setSeats,
    hold,
    setHold,
    total,
    busy,
    error,
    setError,
    holdSelection,
    holdBestAvailable,
    releaseHold,
  } = useSeatSelection();

  const handleExpired = useCallback(() => {
    setHold(null);
    setError("Your hold expired. Pick your seats again.");
  }, [setHold, setError]);

  return (
    <main className="page">
      <header>
        <h1>Grand Theatre</h1>
        <p className="muted">Choose your seats, hold them, then continue to your own checkout.</p>
      </header>

      {isConfigured ? (
        <div className="layout">
          <section className="map-panel">
            <SeatMap
              ref={chartRef}
              onSelectionChange={setSeats}
              onHold={setHold}
              onHoldExpired={handleExpired}
              onError={setError}
            />
          </section>

          <aside className="cart-panel">
            <h2>Your seats</h2>
            <SelectionSummary seats={seats} total={total} />
            {hold ? <HoldCountdown expiresAt={hold.expiresAt} onExpired={handleExpired} /> : null}
            {error ? <p className="error">{error}</p> : null}
            <CheckoutBar
              hold={hold}
              seatCount={seats.length}
              busy={busy}
              onHoldSelection={holdSelection}
              onBestAvailable={() => holdBestAvailable(2)}
              onRelease={releaseHold}
            />
            {hold ? <p className="muted small">Hold id: {hold.holdId}</p> : null}
          </aside>
        </div>
      ) : (
        <section className="setup" data-testid="setup-notice">
          <h2>Add your event keys</h2>
          <p>
            Copy <code>.env.example</code> to <code>.env.local</code>, then set{" "}
            <code>VITE_SEATLAYER_EVENT_KEY</code> and <code>VITE_SEATLAYER_PUBLIC_KEY</code>, then
            restart the dev server.
          </p>
        </section>
      )}
    </main>
  );
}
