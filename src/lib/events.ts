import { eventKey } from "./config";

/**
 * The event list for the multiple events route.
 *
 * A real catalogue comes from your own database, or from the server SDK's
 * `seatlayer.events.listAll()` running on your backend with a secret key. Keys
 * are held here as plain configuration so the example stays runnable with one
 * event.
 */
export interface EventOption {
  key: string;
  name: string;
}

export const events: EventOption[] = [
  { key: eventKey, name: "Opening night" },
  { key: import.meta.env.VITE_SEATLAYER_EVENT_KEY_2 ?? eventKey, name: "Saturday matinee" },
  { key: import.meta.env.VITE_SEATLAYER_EVENT_KEY_3 ?? eventKey, name: "Closing night" },
];
