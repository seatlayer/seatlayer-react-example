import { useRef, useState } from "react";
import { SeatPicker } from "@seatlayer/react";
import type { CheckoutHandoff, HoldResult, SeatPickerHandle } from "@seatlayer/react";
import { RouteIntro } from "../components/RouteIntro";
import { SetupNotice } from "../components/SetupNotice";
import { formatMoney } from "../lib/money";
import { currency, eventKey, isConfigured, publicKey } from "../lib/config";

/**
 * The complete buyer flow in one component.
 *
 * `SeatPicker` brings its own map, price panel, selection tray, hold countdown
 * and checkout button. The only thing this page writes is what happens after
 * the buyer presses that button: `onCheckout` receives the hold, and the third
 * argument is the stable handoff to build an order against.
 */
export function SeatPickerRoute() {
  const pickerRef = useRef<SeatPickerHandle>(null);
  const [handoff, setHandoff] = useState<CheckoutHandoff | null>(null);
  const [held, setHeld] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <RouteIntro
        title="The ready-made buyer flow"
        question="How do I let buyers pick seats and hold them so two people cannot buy the same seat, without building a tray, a price panel and a countdown myself?"
        docsHref="https://docs.seatlayer.io/buyer-sdk/seat-picker/"
        docsLabel="SeatPicker reference"
      />

      {isConfigured ? (
        <div className="layout">
          <section className="map-panel">
            <SeatPicker
              ref={pickerRef}
              event={eventKey}
              publicKey={publicKey}
              currency={currency}
              maxSelection={8}
              className="seatmap"
              onHoldChange={(hold: HoldResult | null) => setHeld(hold !== null)}
              onCheckout={(_hold, _seats, next) => setHandoff(next)}
              onHoldExpired={() => {
                setHandoff(null);
                setError("The hold expired. Pick your seats again.");
              }}
              onError={(cause: unknown) =>
                setError(cause instanceof Error ? cause.message : "The seat picker could not load")
              }
            />
          </section>

          <aside className="cart-panel">
            <h2>Checkout handoff</h2>
            {handoff ? (
              <div>
                <ul className="seat-list">
                  {handoff.lineItems.map((line) => (
                    <li key={line.label}>
                      <span>{line.displayLabel ?? line.label}</span>
                      <span className="price">{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
                    </li>
                  ))}
                </ul>
                <p className="total">
                  <span>Total</span>
                  <span className="price">{formatMoney(handoff.total, handoff.currency)}</span>
                </p>
                <p className="muted small">Hold id: {handoff.holdId}</p>
                <p className="muted">
                  Send only this hold id to your server. Your server reads the authoritative
                  prices back from SeatLayer, charges the buyer through your own payment
                  gateway, and books the hold.
                </p>
              </div>
            ) : (
              <p className="muted">
                Pick seats and press the picker&apos;s own checkout button. The handoff appears
                here.
              </p>
            )}
            {error ? <p className="error">{error}</p> : null}
            <div className="actions">
              <button
                type="button"
                disabled={!held}
                onClick={() => {
                  void pickerRef.current?.release();
                  setHandoff(null);
                }}
              >
                Release the hold
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <SetupNotice variables={["VITE_SEATLAYER_EVENT_KEY", "VITE_SEATLAYER_PUBLIC_KEY"]} />
      )}
    </>
  );
}
