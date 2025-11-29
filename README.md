# Alpha-Boost Trading Client

Web client for Alpha-Boost service API. Simulates stock trading application.

## Core Functions

1. Create stock transactions (buy/sell)
2. View transaction history
3. Get stock predictions (EWMA)

## Build and Run

### Requirements

- Node.js 18+
- Alpha-Boost service at http://localhost:8080

### Setup

```bash
cd client
npm install
```

### Configuration

Optional. Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Or copy example:

```bash
cp .env.local.example .env.local
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production

```bash
npm run build
npm start
```

## Multiple Instances

Each browser tab/window gets a unique instance ID automatically. Data is isolated per instance via sessionStorage.

Tab 1: Opens as RobinTrade-a1b2c3d4, creates AAPL buy orders
Tab 2: Opens as RobinTrade-e5f6g7h8, creates GOOGL sell orders

Each tab has its own transactions, logs, and state. No data sharing between tabs.

Different browsers or incognito windows also get separate isolated instances.

## Client Identification

### User-Agent Header

Client sets User-Agent to instance ID:

```javascript
headers: {
  'User-Agent': appName,
}
```

Service reads header as `app_username`. All transactions linked to this value.

### Database Schema

`apps` table:

```sql
app_username TEXT PRIMARY KEY
```

`transactions` table:

```sql
app_username TEXT REFERENCES apps(app_username)
symbol, side, qty, price, ts
```

## Usage

### Trade (Home Page)

1. Enter ticker, quantity, price, side
2. Click TRADE
3. Prediction popup shows (BULL/BEAR, probability, strength)
4. Click CONFIRM TRADE or CANCEL

### Portfolio

Shows positions and trade history.

### Logs

Shows all API calls with request/response data.

## Architecture

```
Browser (RobinTrade-a1b2c3d4)
  |
  +- Next.js Pages (Trade, Portfolio, Logs)
  |
  +- API Client (lib/mockApi.js)
      Sets User-Agent header
      |
      v
Alpha-Boost Service (localhost:8080)
  |
  +- Controllers
      AppsCtrl
      TransactionsCtrl
      PredictionsCtrl
  |
  +- Services & Repositories
      |
      v
PostgreSQL Database
```

## Stack

- Next.js 14
- React 18
- Fetch API
- sessionStorage

## Structure

```
client/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── portfolio/page.js
│   └── logs/page.js
├── lib/mockApi.js
├── package.json
├── next.config.js
├── README.md
├── THIRD_PARTY_DEV_GUIDE.md
└── E2E_TEST_CHECKLIST.md
```

## Troubleshooting

### "Failed to fetch" / Network errors

- Alpha-Boost service must run at http://localhost:8080
- Check .env.local has NEXT_PUBLIC_API_URL
- Verify CORS enabled on server

### Predictions returning 404

- Server needs Polygon.io API key
- Ticker must be valid
- Recent market data required

## References

- THIRD_PARTY_DEV_GUIDE.md - API reference
- E2E_TEST_CHECKLIST.md - Testing documentation
