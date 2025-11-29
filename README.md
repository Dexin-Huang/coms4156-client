# Alpha-Boost Trading Client

Web client for Alpha-Boost service API. Simulates stock trading application.

## Core Functions

1. Register with Alpha-Boost service
2. Create stock transactions (buy/sell)
3. View transaction history
4. Get stock predictions (EWMA)

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

## Connect to Service

### Single Instance

1. Open http://localhost:3000
2. Enter unique app name (example: alice-trader)
3. Click Register
4. App name stored in sessionStorage
5. Use Transactions or Predictions pages

### Multiple Instances

#### Multiple Browser Tabs

Tab 1: Register as alice-trader, create AAPL buy orders
Tab 2: Register as bob-trader, create GOOGL sell orders
Tab 3: Register as charlie-trader, get TSLA predictions

Each tab maintains separate identity via sessionStorage.

#### Different Browsers

Chrome: http://localhost:3000 - Register as trader-chrome
Firefox: http://localhost:3000 - Register as trader-firefox
Remote machine: http://YOUR-IP:3000 - Register as trader-remote

#### Incognito Windows

Open multiple incognito windows for isolated sessions with different app names.

## Client Identification

### User-Agent Header

Primary identifier. Client sets User-Agent to app name:

```javascript
headers: {
  'User-Agent': appName,
}
```

Service reads header as `app_username`. All transactions linked to this value.

Code location:
- Client: client/lib/api.js
- Server: alpha-boost/src/middleware/RequestLoggingFilter.cpp:16

### Client IP Address

Secondary tracking. Service extracts IP from request:

```cpp
const std::string clientIp = request->peerAddr().toIp();
```

Used for logging in `request_logs` table.

Code location: alpha-boost/src/middleware/RequestLoggingFilter.cpp:21

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

`request_logs` table:

```sql
app_username TEXT
ip TEXT
method, path
created_at
```

### Isolation

- alice-trader sees only alice-trader transactions
- bob-trader sees only bob-trader transactions
- Concurrent operations supported
- All requests logged with app_username + IP

## Usage

### Register (Home Page)

1. Navigate to /
2. Enter unique app name
3. Click Register
4. Calls POST /apps
5. App name saved to sessionStorage

### Create Transaction (Transactions Page)

1. Navigate to /transactions
2. Fill form:
   - Stock Symbol: AAPL, GOOGL, etc
   - Side: Buy or Sell
   - Quantity: Must be > 0
   - Price: Must be > 0
3. Click Create Transaction
4. Calls POST /apps/transactions
5. Transaction appears in history table

### View History (Transactions Page)

Table shows: ID, Symbol, Side, Quantity, Price, Timestamp
Buy orders: green
Sell orders: red
Click Refresh to reload

Calls GET /apps/transactions

### Get Predictions (Predictions Page)

1. Navigate to /predictions
2. Enter ticker (TSLA, AAPL, etc)
3. Click Get Prediction
4. View results:
   - Probability of Price Increase: 0-100%
   - Signal Strength: 0-100%

Calls GET /predictions/{ticker}

Requires Polygon.io API key on server.

## Architecture

```
Browser (alice-trader)
  |
  +- Next.js Pages (Home, Transactions, Predictions)
  |
  +- API Client (lib/api.js)
      Sets User-Agent header
      |
      | HTTP: User-Agent: alice-trader
      v
Alpha-Boost Service (localhost:8080)
  |
  +- Middleware
      Extract User-Agent
      Extract Client IP
      Log to request_logs
  |
  +- Controllers
      AppsCtrl
      TransactionsCtrl
      PredictionsCtrl
  |
  +- Services & Repositories
      Business logic
      Database access
      |
      v
PostgreSQL Database
  apps
  transactions
  request_logs
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
│   ├── transactions/page.js
│   └── predictions/page.js
├── lib/api.js
├── package.json
├── next.config.js
├── .env.local.example
├── CLIENT_README.md
├── THIRD_PARTY_DEV_GUIDE.md
└── E2E_TEST_CHECKLIST.md
```

## Troubleshooting

### "Please register your app first"

Register at Home page. Check sessionStorage in DevTools - Application - Local Storage - appName.

### "Failed to fetch" / Network errors

- Alpha-Boost service must run at http://localhost:8080
- Check .env.local has NEXT_PUBLIC_API_URL
- Verify CORS enabled on server

### Transactions not showing

- Click Refresh
- Verify registration
- Check browser console

### Predictions returning 404

- Server needs Polygon.io API key
- Ticker must be valid
- Recent market data required

### Multiple instances seeing same data

- Each instance needs different app name
- Check sessionStorage in DevTools
- Clear sessionStorage and re-register

## References

- THIRD_PARTY_DEV_GUIDE.md - API reference for custom clients
- E2E_TEST_CHECKLIST.md - Testing documentation
- README.md (main) - Server setup

## License

Educational purposes.
