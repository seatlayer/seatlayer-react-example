import { useCallback, useMemo, useRef, useState } from "react";
import type { HoldResult, SeatingChartHandle, SelectedSeat } from "@seatlayer/react";

/**
 * Keeps the pieces of buyer state this page draws: the current selection, the
 * active hold, and the last error. The seating chart itself owns the map.
 */
export function useSeatSelection() {
  const chartRef = useRef<SeatingChartHandle>(null);
  const [seats, setSeats] = useState<SelectedSeat[]>([]);
  const [hold, setHold] = useState<HoldResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => seats.reduce((sum, seat) => sum + (seat.price ?? 0), 0),
    [seats],
  );

  const run = useCallback(async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, []);

  /** Hold the seats the buyer picked on the map. */
  const holdSelection = useCallback(
    () =>
      run(async () => {
        const result = await chartRef.current?.hold();
        if (!result) {
          setError("Those seats were just taken. Please pick again.");
          return;
        }
        setHold(result);
      }),
    [run],
  );

  /** Ask the server for the best free seats and hold them in one call. */
  const holdBestAvailable = useCallback(
    (quantity: number) =>
      run(async () => {
        const result = await chartRef.current?.bestAvailable(quantity);
        if (!result) {
          setError("No block of that size is free right now.");
          return;
        }
        setHold({ holdId: result.holdId, expiresAt: result.expiresAt, items: result.items });
      }),
    [run],
  );

  const releaseHold = useCallback(
    () =>
      run(async () => {
        await chartRef.current?.release();
        setHold(null);
      }),
    [run],
  );

  return {
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
  };
}
