# Interactive seat map and seating chart examples for React (SeatLayer SDK)

Open source (MIT) example code showing how to embed an interactive seat map in a
React ticketing app with seat selection, seat holds so two buyers cannot take one
seat, best available seats, season tickets and a checkout handoff to your own
payment gateway. Every example is a route in one small Vite and React
application, and each one names the question it answers and links the matching
documentation page.

## Live demos

Try SeatLayer in your browser before you clone anything:
[pick a seat](https://app.seatlayer.io/demo/play/grand-theatre) · [the 3D venue](https://app.seatlayer.io/demo/play/grand-theatre?tour=3d) ·
[the chart designer](https://app.seatlayer.io/demo/designer) ·
[all live demos](https://docs.seatlayer.io/start/live-demos/).
Those demos run on a template chart with no server event behind them, so a
hold there is not real. This repository gives you real test holds and
bookings with your own test keys.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seatlayer/seatlayer-react-example)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/seatlayer/seatlayer-react-example)

## Run it

```sh
npm install
cp .env.example .env.local   # add your event key and publishable key
npm run dev
```

`.env.local` needs two values from your SeatLayer account:

| Variable | What it is |
| --- | --- |
| `VITE_SEATLAYER_EVENT_KEY` | Your event key. It starts with `ev_` and is at the top of the event's page in the dashboard, with a Copy button |
| `VITE_SEATLAYER_PUBLIC_KEY` | Your public key (`pk_test_…` in test mode) from Developer → API keys, from the same account as the event |

Three more are optional: `VITE_SEATLAYER_EVENT_KEY_2` and
`VITE_SEATLAYER_EVENT_KEY_3` give the multiple events route real variety, and
`VITE_SEATLAYER_SEASON_KEY` turns on the season route. Every route shows a setup
notice instead of a chart until its keys are present, so the repository runs the
moment it is cloned.

Test mode is free, so you can run every step above before a live account exists.
Never put a secret `sk_` key in browser code.

## Examples in this repo

| Route | What it shows | Documentation |
| --- | --- | --- |
| `/` | The headless `SeatingChart` with your own cart, totals and hold button | [React seating chart](https://docs.seatlayer.io/buyer-sdk/react-seating-chart/) |
| `/seat-picker` | The complete `SeatPicker` buyer flow and its `onCheckout` handoff | [SeatPicker reference](https://docs.seatlayer.io/buyer-sdk/seat-picker/) |
| `/season` | `SeasonPicker` fixed-inclusion selection and returning-holder renewal intent | [Season picker](https://docs.seatlayer.io/buyer-sdk/seasons/) |
| `/events` | An event list and one chart that swaps event, releasing any open hold first | [Events API](https://docs.seatlayer.io/server-api/events/) |
| `/best-available` | A quantity chooser and optional category filter over `bestAvailable()` | [Best available seats](https://docs.seatlayer.io/buyer-sdk/best-available/) |
| `/control-room` | `SeatManager` in read-only view mode behind an event-scoped manage token | [Embedded Control Room](https://docs.seatlayer.io/platform/embedded-control-room/) |

## Developer questions this repo answers

### How do I embed an interactive seating chart in React?

Install `@seatlayer/react` and render the `SeatingChart` component with your
event key and publishable key. It creates the canvas once, keeps live
availability up to date, and reports selection through `onSelectionChange`. Your
own components own the cart, the totals and the buttons, so the interactive seat
map never dictates your layout. Give the wrapping element a definite height,
because the chart fills its box. See `src/routes/SingleEventRoute.tsx` and
`src/components/SeatMap.tsx`.

### How do I let buyers pick seats and hold them so two people cannot buy the same seat?

A hold is a short, revocable claim on inventory, and every event processes holds
through one serialized writer, so two competing buyers cannot both take the same
seat. Call `hold()` on the chart handle, or let `SeatPicker` do it from its own
checkout button. The result carries an opaque `holdId` and an absolute
`expiresAt`, which is what the hold timer counts down from. When the seats were
taken in between, the call resolves to null rather than throwing, so you can ask
the buyer to choose again. See `src/lib/useSeatSelection.ts`,
`src/components/HoldCountdown.tsx` and `src/routes/SeatPickerRoute.tsx`.

### How do I sell season tickets or a multi-event package with seat selection?

Use `SeasonPicker` with a published season key. The buyer chooses one seat
package and keeps those exact seats for every performance in the plan, so
availability is the intersection across the whole plan and the hold is all or
nothing. The handoff it produces carries an operation id and no amount at all,
because your server prices the package. A returning holder renews from an offer
your server issued, and `createRenewalIntent(offerId)` records that intent
without confirming a price or taking payment. See `src/routes/SeasonRoute.tsx`.

### How do I show several events on one page and switch charts?

Keep a list of event keys and render one chart for the selected one. Changing
the `event` prop rebuilds the canvas, because a different event is different
inventory. Release any open hold before switching, otherwise those seats stay
off the market on the previous event until they expire on their own. The list in
this repository is static configuration; a real catalogue is read on your server
with a secret key and sent to the browser as plain data. See
`src/routes/EventsRoute.tsx` and `src/lib/events.ts`.

### How do I offer best available seats for a group?

Call `bestAvailable(quantity, categoryKey?)` on the chart handle. The seat map
API asks the server to find an adjacent block and hold it in the same call, then
fires `onSelectionChange` and `onHold` exactly as a manual pick would. It
resolves to null when no block of that size fits, which is a different answer
from sold out and deserves different wording. The buyer SDK exposes the category
on each selected seat rather than a list of the chart's categories, so the
optional filter takes the stable category key from your published chart. See
`src/routes/BestAvailableRoute.tsx`.

### How do I hand a seat hold to my own checkout and payment gateway?

The browser sends one thing to your backend: the opaque hold id. Your server
reads the hold back from SeatLayer with your secret key, which is where the
authoritative seats and prices come from, creates your own checkout session for
that amount with your own payment gateway, and books the hold once payment has
succeeded. Pass your own order id as the booking reference; repeating the same
request with the same reference cannot create a second sale, so an unknown
outcome is reconciled by repeating it rather than by generating a new reference.
In this repository the browser half is `src/components/CheckoutBar.tsx`. Read
[holds and checkout handoff](https://docs.seatlayer.io/buyer-sdk/holds-and-checkout/)
and [idempotency and conflicts](https://docs.seatlayer.io/server-api/idempotency-and-conflicts/).

### How do I connect the seat hold to my own checkout or hosted payment page?

Both shapes use the same handoff. For your own checkout pages, take the hold id,
price it on your server, and charge through your own payment gateway before
booking. For a hosted payment page, create the session on your server from the
inspected hold, redirect the buyer to it, and book the hold when the payment
result arrives, still under your own order reference. Either way the browser
never carries an amount and never books anything. The companion Next.js
repository has the trusted half as a working route handler at
`app/api/hold/route.ts`; the flow is documented in
[holds and checkout handoff](https://docs.seatlayer.io/buyer-sdk/holds-and-checkout/)
and the [Node server SDK](https://docs.seatlayer.io/server-sdk/node/).

### What runs in the browser and what must run on my server?

The browser renders the seat map, selects seats and creates holds, using a
publishable key that is safe to ship. It has no booking authority and no pricing
authority. Your server holds the secret key and owns hold inspection, booking,
event and chart management, and any short-lived token it mints for a scoped
buyer or a member of staff. The organizer board is the clearest case: it accepts
an event-scoped `mse_` grant your backend mints after authenticating staff, and
it refuses a secret key outright. See `src/routes/ControlRoomRoute.tsx`.

### How do I render the seat map with Vite?

Nothing special is required: the chart is a normal React component and Vite
builds it as it builds anything else. The SDK loads its locale bundles with a
dynamic import, so they arrive as separate chunks rather than in your main
bundle. Give the chart container a height in CSS, as `.seatmap` does in
`src/styles.css`. Read your keys from `import.meta.env` and keep only the
publishable ones there, as `src/lib/config.ts` does.

### Is there an open source or free seat map library for React?

The example code in this repository is open source under the MIT license, so you
can copy any route into your own product. The SDK packages themselves are free
to install from npm and free to run in test mode, which is enough to build and
verify a complete integration before any account exists. Live usage is priced
per confirmed sold seat rather than by subscription, and every organization gets
a monthly free allowance; the current numbers are on the
[pricing page](https://seatlayer.io/pricing/). The seat map engine itself is not
published as open source, so treat this repository as the open part and the
packages as the hosted part.

### Does the seat map work for a 100,000-seat stadium?

Yes, and large venues are the headline case rather than the edge case. There is
a public benchmark demo of a 200,000-seat stadium you can open and drive
yourself: [century-stadium-200k](https://app.seatlayer.io/demo/play/century-stadium-200k).
The demos are synthetic fixtures, timings vary by device and by run, and the
renderer evidence says nothing about concurrent buyers.

### How do I render 100,000 seats in the browser without lag?

You do not build it yourself: the renderer already does the work. Big charts
arrive progressively, so the venue's sections are drawn as soon as the chart
lands and seats fill in a section at a time, nearest the viewport first, and a
`viewport` reveal mode exists for the very largest charts. Selection, search and
availability still cover every seat. The method, the fixtures, the run log and
the limits of the published timings are written up in
[renderer performance](https://docs.seatlayer.io/platform/renderer-performance/).

### Can I use this with Vue or Angular?

Yes. The same seating engine ships as `@seatlayer/vue` and `@seatlayer/angular`
alongside `@seatlayer/react`, with the same options, the same handoff and the
same server boundary, so the routes in this repository translate almost line for
line. Read the [Vue guide](https://docs.seatlayer.io/buyer-sdk/vue/) and the
[Angular guide](https://docs.seatlayer.io/buyer-sdk/angular/). There is also a
framework-agnostic `@seatlayer/js` package if you are not using a framework at
all.

### How is this different from seats.io?

seats.io is a seating chart SDK where you bring the ticketing system. SeatLayer
is the seating chart SDK plus a complete seated-event ticketing stack, so you
can embed the picker with your own checkout, or sell on your own website with
your own payment gateway. A longer comparison is at
[seatlayer.io/vs/seats-io](https://seatlayer.io/vs/seats-io/).

## Use in your app

```sh
npm install @seatlayer/react
```

```tsx
import { SeatingChart } from "@seatlayer/react";

<SeatingChart
  ref={chartRef}
  event="<YOUR_EVENT_KEY>"
  publicKey="pk_test_..."
  currency="USD"
  onSelectionChange={setSeats}
  onHold={setHold}
/>;
```

Then call `chartRef.current.hold()` to hold the selection, and send the
resulting `holdId` to your server. Prefer the ready-made `SeatPicker` component
when you want SeatLayer's complete buyer flow including its own tray and
countdown.

## Documentation

- [Install the Buyer SDK](https://docs.seatlayer.io/buyer-sdk/install/)
- [Add a seat map to a React app](https://docs.seatlayer.io/buyer-sdk/react-seating-chart/)
- [SeatPicker reference](https://docs.seatlayer.io/buyer-sdk/seat-picker/)
- [Season picker](https://docs.seatlayer.io/buyer-sdk/seasons/)
- [Holds and checkout handoff](https://docs.seatlayer.io/buyer-sdk/holds-and-checkout/)
- [Best available seats](https://docs.seatlayer.io/buyer-sdk/best-available/)
- [Vue](https://docs.seatlayer.io/buyer-sdk/vue/) and [Angular](https://docs.seatlayer.io/buyer-sdk/angular/)
- [Server SDKs](https://docs.seatlayer.io/server-sdk/)
- [seatlayer-sdk on GitHub](https://github.com/seatlayer/seatlayer-sdk)

## License

MIT. See [LICENSE](./LICENSE).

Keywords: interactive seat map, seating chart, seat picker, seat selection, seat holds, best available seats, season tickets, reserved seating, event ticketing, React example
