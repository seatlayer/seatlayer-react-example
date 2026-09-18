import { useCallback } from "react";
import { SeatMap } from "../components/SeatMap";
import { SelectionSummary } from "../components/SelectionSummary";
import { HoldCountdown } from "../components/HoldCountdown";
import { CheckoutBar } from "../components/CheckoutBar";
import { RouteIntro } from "../components/RouteIntro";
import { SetupNotice } from "../components/SetupNotice";
import { useSeatSelection } from "../lib/useSeatSelection";
import { isConfigured } from "../lib/config";

/**
 * The headless surface. `SeatingChart` draws the venue and owns live
 * availability; this page owns the cart, the totals, the buttons and the
 * handoff to checkout.
 */
export function SingleEventRoute() {
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
    <>
      <RouteIntro
        title="One event with your own cart"
        question="How do I embed an interactive seating chart in React and keep my own cart, totals and checkout button?"
        docsHref="https://docs.seatlayer.io/buyer-sdk/react-seating-chart/"
        docsLabel="Add a seat map to a React app"
      />

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
        <SetupNotice variables={["VITE_SEATLAYER_EVENT_KEY", "VITE_SEATLAYER_PUBLIC_KEY"]} />
      )}
    </>
  );
}
