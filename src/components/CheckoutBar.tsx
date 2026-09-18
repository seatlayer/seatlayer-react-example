import type { HoldResult } from "@seatlayer/react";

interface CheckoutBarProps {
  hold: HoldResult | null;
  seatCount: number;
  busy: boolean;
  onHoldSelection: () => void;
  onBestAvailable: () => void;
  onRelease: () => void;
}

export function CheckoutBar({
  hold,
  seatCount,
  busy,
  onHoldSelection,
  onBestAvailable,
  onRelease,
}: CheckoutBarProps) {
  function continueToCheckout() {
    if (!hold) return;
    // Hand this hold id to your own checkout. Your server inspects the hold,
    // charges through your own payment gateway, then books it with your secret
    // key. Never send a price from the browser.
    console.log("Continue to checkout with hold id:", hold.holdId);
  }

  return (
    <div className="actions">
      <button type="button" onClick={onBestAvailable} disabled={busy}>
        Best available (2 seats)
      </button>

      {hold ? (
        <>
          <button type="button" className="primary" onClick={continueToCheckout} disabled={busy}>
            Continue to checkout
          </button>
          <button type="button" onClick={onRelease} disabled={busy}>
            Release seats
          </button>
        </>
      ) : (
        <button
          type="button"
          className="primary"
          onClick={onHoldSelection}
          disabled={busy || seatCount === 0}
        >
          Hold these seats
        </button>
      )}
    </div>
  );
}
