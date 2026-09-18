/**
 * Every value comes from .env.local. Copy .env.example to .env.local and fill
 * it in with your own keys. Only publishable values belong in browser code.
 */
export const eventKey = import.meta.env.VITE_SEATLAYER_EVENT_KEY ?? "";
export const publicKey = import.meta.env.VITE_SEATLAYER_PUBLIC_KEY ?? "";

/** A published Season key (sea_...) for the Season route. Optional. */
export const seasonKey = import.meta.env.VITE_SEATLAYER_SEASON_KEY ?? "";

/** Prices in this example are shown in USD. */
export const currency = "USD";

export const isConfigured = eventKey.length > 0 && publicKey.length > 0;
export const isSeasonConfigured = seasonKey.length > 0;
