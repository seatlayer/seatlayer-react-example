Try it live: https://seatlayer.io/demo

# SeatLayer examples for React: sell reserved seats with one tag, or build the seat map into your app

Open source (MIT) example code for the two ways to sell reserved seats with
SeatLayer:

- **Hosted**: paste one tag into any website. SeatLayer runs the seat map, the
  payment through your own gateway, and the tickets.
- **SDK**: put the seat map inside your own React app. SeatLayer holds the
  seats, and your own checkout takes the payment.

This repository is a small Vite and React app. A Next.js version with the same
demos is at [seatlayer-nextjs-example](https://github.com/seatlayer/seatlayer-nextjs-example).

## Hosted: one tag

The whole integration is one block of HTML. Replace `<YOUR_EVENT_KEY>` with the
key from your event's page in the dashboard.

```html
<div
  data-seatlayer-event="<YOUR_EVENT_KEY>"
  data-layout="picker"
  data-checkout="hosted"
  data-height="740px"
  data-fallback-url="https://app.seatlayer.io/e/<YOUR_EVENT_KEY>">
  <a href="https://app.seatlayer.io/e/<YOUR_EVENT_KEY>">Book tickets on SeatLayer</a>
</div>
<script src="https://app.seatlayer.io/sl-event-widget@0.js" defer></script>
```

It works on WordPress, Wix, Squarespace, Webflow and any HTML page. Copy-paste
versions are in [`examples/hosted/`](./examples/hosted), and React components
that render the same tags are in [`src/hosted/`](./src/hosted):

| What you want | HTML | React | Live demo |
| --- | --- | --- | --- |
| A seat map for one event | [`event.html`](./examples/hosted/event.html) | [`SeatLayerEvent`](./src/hosted/SeatLayerEvent.tsx) | [Paid event](https://seatlayer.io/demo/hosted/paid-event/), [Free event](https://seatlayer.io/demo/hosted/free-event/), [Standing + tables](https://seatlayer.io/demo/hosted/standing-and-tables/), [3D view](https://seatlayer.io/demo/hosted/3d-view/) |
| Every upcoming date, then seats | [`collection.html`](./examples/hosted/collection.html) | [`SeatLayerCollection`](./src/hosted/SeatLayerCollection.tsx) | [Multi-date](https://seatlayer.io/demo/hosted/multi-date/) |
| A season ticket | [`season-card.html`](./examples/hosted/season-card.html) | [`BookingCard`](./src/hosted/BookingCard.tsx) | [Season ticket](https://seatlayer.io/demo/hosted/season-ticket/) |
| A run of shows | [`performance-card.html`](./examples/hosted/performance-card.html) | [`BookingCard`](./src/hosted/BookingCard.tsx) | [Performance groups](https://seatlayer.io/demo/hosted/performance-groups/) |

```tsx
import { SeatLayerEvent } from "./hosted/SeatLayerEvent";

<SeatLayerEvent
  eventKey="<YOUR_EVENT_KEY>"
  fallbackUrl="https://app.seatlayer.io/e/<YOUR_EVENT_KEY>"
/>;
```

The React components load each script once per page and render again after a
client-side route change.

To bring buyers back to your page after a payment that redirects, such as
Stripe, add `data-return-url="page"` to the tag (or pass `returnToPage` to the
React components) and list your site under Embed domains in the dashboard.
Without that, buyers finish on the SeatLayer event page.

## SDK: the seat map in your app

Each route in this app is one example. The same demos run live at
[seatlayer.io/demo/sdk](https://seatlayer.io/demo/sdk).

| Route | What it shows | Documentation |
| --- | --- | --- |
| `/` | The headless `SeatingChart` with your own cart, totals and hold button | [React seating chart](https://docs.seatlayer.io/buyer-sdk/react-seating-chart/) |
| `/seat-picker` | The complete `SeatPicker` buyer flow and its `onCheckout` handoff | [SeatPicker reference](https://docs.seatlayer.io/buyer-sdk/seat-picker/) |
| `/season` | `SeasonPicker`: one seat choice held for every performance in a season | [Season picker](https://docs.seatlayer.io/buyer-sdk/seasons/) |
| `/events` | Several events on one page with one chart, releasing any open hold first | [Events API](https://docs.seatlayer.io/server-api/events/) |
| `/best-available` | `bestAvailable()`: the best seats together for a party size | [Best available seats](https://docs.seatlayer.io/buyer-sdk/best-available/) |
| `/control-room` | `SeatManager`, the staff board, behind an event-scoped `mse_` token | [Embedded Control Room](https://docs.seatlayer.io/platform/embedded-control-room/) |

```sh
npm install @seatlayer/react
```

```tsx
import { SeatPicker } from "@seatlayer/react";

<SeatPicker
  event="<YOUR_EVENT_KEY>"
  publicKey="pk_test_..."
  currency="EUR"
  style={{ width: "100%", height: 740 }}
  onCheckout={(_hold, _seats, handoff) => startCheckout({ holdId: handoff.holdId })}
/>;
```

Send only the `holdId` to your server. Your server reads the seats and prices
back from SeatLayer with your secret key, charges through your own payment
gateway, and books the hold with your own order id as the booking reference.
This app has no server, so it stops at the handoff. The Next.js example shows
the server half in `app/api/hold/route.ts`.

## Where to find your keys

Sign in at [app.seatlayer.io](https://app.seatlayer.io). Test mode is free and
needs no card.

| Key | Where | Looks like | Used for |
| --- | --- | --- | --- |
| Publishable key | Dashboard → Developer | `pk_test_...` | Browser code (SDK) |
| Secret key | Dashboard → Developer | `sk_test_...` | Your server only. Never in browser code |
| Event key | The top of the event's page | `ev_...` or your own slug | Hosted tag and SDK |
| Season key | The season's Sell tab, in its booking link | `sea_...` | Season tickets |
| Workspace id | In your dashboard address (`/w/ws_.../`) and in the multiple events code on an event's publish page | `ws_...` | The hosted collection |

The event key is not the `pk_` key. If the seat map says the event was not
found, check that you pasted the event key into the event field.

## Run it locally

```sh
npm install
cp .env.example .env.local   # add your keys
npm run dev
```

Then open http://localhost:5173.

| Variable | Needed for |
| --- | --- |
| `VITE_SEATLAYER_EVENT_KEY` | Every SDK route |
| `VITE_SEATLAYER_PUBLIC_KEY` | Every SDK route |
| `VITE_SEATLAYER_EVENT_KEY_2`, `_3` | More events on `/events` (optional) |
| `VITE_SEATLAYER_SEASON_KEY` | `/season` |
| `VITE_SEATLAYER_CURRENCY` | Prices before a hold, for example `EUR` (defaults to `USD`) |

Every route shows a setup notice instead of a chart until its keys are present,
so the app runs the moment it is cloned. `npm run build` writes a static site to
`dist/`. Serve it from any static host with a fallback to `index.html`, because
the routes are handled in the browser.

## Questions this repo answers

### How do I embed an interactive seating chart in React?

Render `SeatPicker` or `SeatingChart` from `@seatlayer/react`. Give the wrapping
element a definite height, because the chart fills its box. See
`src/routes/SingleEventRoute.tsx` and `src/components/SeatMap.tsx`.

### How do I stop two buyers taking the same seat?

Hold the seats. A hold is a short claim on inventory, and each event processes
holds one at a time, so two buyers cannot both hold one seat. `hold()` resolves
to null when the seats were taken in between, so you can ask the buyer to
choose again. See `src/lib/useSeatSelection.ts` and
`src/components/HoldCountdown.tsx`.

### How do I sell season tickets?

Use `SeasonPicker` with a published season key. The buyer keeps the same seats
for every performance, and the hold covers all of them or none. The handoff
carries no price: your server prices the package. See
`src/routes/SeasonRoute.tsx`.

### How do I offer best available seats for a group?

Call `bestAvailable(quantity, categoryKey?)` on the chart handle. It finds the
best block of seats together and holds it in the same call, or resolves to null
when no block of that size is free, which is not the same as sold out. See
`src/routes/BestAvailableRoute.tsx`.

### Can I use this with Vue or Angular?

Yes. The same engine ships as `@seatlayer/vue`, `@seatlayer/angular` and the
framework-free `@seatlayer/js`. See the
[Vue](https://docs.seatlayer.io/buyer-sdk/vue/) and
[Angular](https://docs.seatlayer.io/buyer-sdk/angular/) guides.

## Documentation

- [Install the Buyer SDK](https://docs.seatlayer.io/buyer-sdk/install/)
- [Add a seat map to a React app](https://docs.seatlayer.io/buyer-sdk/react-seating-chart/)
- [SeatPicker reference](https://docs.seatlayer.io/buyer-sdk/seat-picker/)
- [Season picker](https://docs.seatlayer.io/buyer-sdk/seasons/)
- [Holds and checkout handoff](https://docs.seatlayer.io/buyer-sdk/holds-and-checkout/)
- [Best available seats](https://docs.seatlayer.io/buyer-sdk/best-available/)
- [Server SDKs](https://docs.seatlayer.io/server-sdk/)
- [Pricing](https://seatlayer.io/pricing/)

## License

MIT. See [LICENSE](./LICENSE).
