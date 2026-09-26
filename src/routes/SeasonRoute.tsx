import { useRef, useState } from "react";
import { SeasonPicker } from "@seatlayer/react";
import type {
  SeasonAvailability,
  SeasonCheckoutHandoff,
  SeasonDescriptor,
  SeasonPickerHandle,
  SeasonRenewalIntent,
  SeasonStatusEvent,
} from "@seatlayer/react";
import { RouteIntro } from "../components/RouteIntro";
import { SetupNotice } from "../components/SetupNotice";
import { isSeasonConfigured, publicKey, seasonKey } from "../lib/config";

/** Caller-stable ids let an interrupted operation be recovered rather than repeated. */
function newActionId(): string {
  return crypto.randomUUID();
}

/**
 * A fixed-inclusion Season: the buyer chooses one seat package once and keeps
 * those exact seats for every performance in the published plan. Availability
 * is the intersection across the whole plan, and the hold is all or nothing.
 *
 * The handoff carries no amount on purpose. Your server prices the package,
 * takes the money through your own payment gateway, and books the operation.
 */
export function SeasonRoute() {
  const pickerRef = useRef<SeasonPickerHandle>(null);
  const [descriptor, setDescriptor] = useState<SeasonDescriptor | null>(null);
  const [availability, setAvailability] = useState<SeasonAvailability | null>(null);
  const [handoff, setHandoff] = useState<SeasonCheckoutHandoff | null>(null);
  const [renewal, setRenewal] = useState<SeasonRenewalIntent | null>(null);
  const [offerId, setOfferId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** A returning holder records intent to renew. It is intent only, never a sale. */
  async function recordRenewalIntent() {
    setError(null);
    try {
      const intent = await pickerRef.current?.createRenewalIntent(offerId.trim());
      setRenewal(intent ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The renewal offer could not be read");
    }
  }

  return (
    <>
      <RouteIntro
        title="Season tickets with seat selection"
        question="How do I sell season tickets, where one choice of seats covers every performance in a published plan and returning holders can renew?"
        docsHref="https://docs.seatlayer.io/buyer-sdk/seasons/"
        docsLabel="Season picker"
      />

      {isSeasonConfigured ? (
        <div className="layout">
          <section className="map-panel">
            <SeasonPicker
              ref={pickerRef}
              season={seasonKey}
              publicKey={publicKey}
              maxSelection={4}
              className="seatmap seatmap--season"
              offer={{
                eyebrow: "2027 membership",
                priceLabel: "From $480",
                compareAtPriceLabel: "From $600 bought separately",
                savingsLabel: "Save $120",
                priceNote:
                  "The package price depends on your seats and is confirmed at checkout",
                benefits: ["Priority entry", "Free ticket exchange", "Renewal priority"],
                renewalLabel: "Same-seat renewal eligible",
              }}
              onStatusChange={(next: SeasonStatusEvent) => {
                setStatus(next.message);
                if (next.kind === "ready") {
                  setDescriptor(pickerRef.current?.getDescriptor() ?? null);
                  setAvailability(pickerRef.current?.getAvailability() ?? null);
                }
              }}
              onHold={(next: SeasonCheckoutHandoff) => setHandoff(next)}
              onContinue={(next: SeasonCheckoutHandoff) => setHandoff(next)}
              onHoldExpired={() => {
                setHandoff(null);
                setError("The season hold expired. Choose your seats again.");
              }}
              onAccessUnavailable={(event) =>
                setError(`This season is not open for public selection (${event.reason}).`)
              }
              onError={(cause: unknown) =>
                setError(cause instanceof Error ? cause.message : "The season could not load")
              }
            />
          </section>

          <aside className="cart-panel">
            <h2>Season package</h2>
            {descriptor ? (
              <ul className="seat-list">
                <li>
                  <span>Season</span>
                  <span>{descriptor.name}</span>
                </li>
                <li>
                  <span>Venue</span>
                  <span>{descriptor.venue}</span>
                </li>
                <li>
                  <span>Performances</span>
                  <span>{descriptor.occurrenceCount}</span>
                </li>
              </ul>
            ) : (
              <p className="muted">{status ?? "Loading the published plan."}</p>
            )}

            {availability ? (
              <p className="muted">
                {availability.freeCount} seats are free for every performance in the plan,{" "}
                {availability.blockedCount} are not.
              </p>
            ) : null}

            {handoff ? (
              <div>
                <p className="total">
                  <span>Held</span>
                  <span>{handoff.allocations.length} performances</span>
                </p>
                <p className="muted small">Operation id: {handoff.operationId}</p>
                <p className="muted">
                  The handoff carries no price. Your server inspects the operation, prices the
                  package, charges through your own payment gateway, then books it.
                </p>
                <div className="actions">
                  <button
                    type="button"
                    onClick={() => {
                      void pickerRef.current?.release(newActionId());
                      setHandoff(null);
                    }}
                  >
                    Release the package
                  </button>
                </div>
              </div>
            ) : null}

            <h2>Returning holder</h2>
            <p className="muted">
              A holder who already has these seats renews from an offer your server issued.
              Recording intent does not confirm a price or take payment.
            </p>
            <label className="field">
              <span>Renewal offer id</span>
              <input
                type="text"
                value={offerId}
                placeholder="sro_..."
                onChange={(event) => setOfferId(event.target.value)}
              />
            </label>
            <div className="actions">
              <button
                type="button"
                disabled={offerId.trim().length === 0}
                onClick={() => void recordRenewalIntent()}
              >
                Record renewal intent
              </button>
            </div>
            {renewal ? (
              <p className="muted small">
                Intent {renewal.intentId} recorded, state {renewal.state}.
              </p>
            ) : null}

            {error ? <p className="error">{error}</p> : null}
          </aside>
        </div>
      ) : (
        <SetupNotice variables={["VITE_SEATLAYER_SEASON_KEY"]} />
      )}
    </>
  );
}
