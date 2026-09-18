# SeatLayer React seating chart example

A small, runnable Vite and React application that renders a live SeatLayer
seating chart, shows the selected seats and their total in USD, holds the
inventory the buyer picked, counts the hold down, and hands the hold id to your
own checkout. The browser selects and holds; your own server books the hold and
takes payment through your own payment gateway.

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
| `VITE_SEATLAYER_EVENT_KEY` | The event you want to sell, for example `ev_9f3a` |
| `VITE_SEATLAYER_PUBLIC_KEY` | The publishable `pk_` key for the same account |

Test mode is free, so you can run every step above before a live account exists.
Register `http://localhost:5173` as an embed origin for the key, otherwise the
chart will refuse to bootstrap. Never put a secret `sk_` key in browser code.

## What it shows

- A live seating chart rendered by the headless `SeatingChart` component.
- The current selection with a per seat price and a running total in USD.
- A best available button that asks the server for the best free block and holds it.
- A hold countdown driven by the server's own expiry timestamp.
- A "Continue to checkout" button that logs the opaque hold id for your checkout.
- Release, expiry and conflict handling around the hold.

## Use in your app

```sh
npm install @seatlayer/react
```

```tsx
import { SeatingChart } from "@seatlayer/react";

<SeatingChart
  ref={chartRef}
  event="ev_9f3a"
  publicKey="pk_test_..."
  currency="USD"
  onSelectionChange={setSeats}
  onHold={setHold}
/>;
```

Then call `chartRef.current.hold()` to hold the selection, and send the
resulting `holdId` to your server. Your server inspects the hold, charges the
buyer through your own payment gateway, and books the hold with your secret key.
Prefer the ready made `SeatPicker` component instead when you want SeatLayer's
complete buyer flow including its own tray and countdown.

## Documentation

- [Install the Buyer SDK](https://docs.seatlayer.io/buyer-sdk/install/)
- [Add a seat map to a React app](https://docs.seatlayer.io/buyer-sdk/react-seating-chart/)
- [Holds and checkout handoff](https://docs.seatlayer.io/buyer-sdk/holds-and-checkout/)
- [Best available](https://docs.seatlayer.io/buyer-sdk/best-available/)
- [seatlayer-sdk on GitHub](https://github.com/seatlayer/seatlayer-sdk)

## License

MIT. See [LICENSE](./LICENSE).
