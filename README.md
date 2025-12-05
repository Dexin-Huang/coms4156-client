# RobinTrade Client

Web client for Alpha-Boost service API. Stock trading application.

## Build and Run

### Requirements

- Node.js 18+
- Alpha-Boost service running

### Setup

```bash
npm install
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

## Multiple Instances

Each browser tab/window gets a unique instance ID automatically. Data is isolated per instance via sessionStorage.

Different browsers or incognito windows also get separate isolated instances.

## Tests

### Multi-Instance Verification

Run client on multiple machines with same app_username. Check request_logs table in database - each machine shows different IP for same app_username.

```sql
SELECT app_username, ip, method, path, created_at
FROM request_logs
WHERE app_username = 'test-user'
ORDER BY created_at;
```

### E2E Tests

App Registration:
- Register new app (POST /apps, 201)
- Register existing app (POST /apps, 409)
- Delete app (DELETE /apps, 200)
- Delete non-existent app (DELETE /apps, 404)
- Cascade delete transactions

Transactions:
- Create buy transaction (POST /apps/transactions, 201)
- Create sell transaction (POST /apps/transactions, 201)
- Negative quantity rejected (400)
- Negative price rejected (400)
- Invalid side rejected (400)
- Unregistered user rejected (404)
- Get transactions (GET /apps/transactions, 200)

Predictions:
- Valid ticker (GET /predictions/{ticker}, 200)
- Invalid ticker (GET /predictions/{ticker}, 404)

Multi-Client:
- Transaction isolation between clients
- Concurrent transaction creation

## API Reference

### Required Headers

```http
Content-Type: application/json
User-Agent: YOUR-APP-NAME
```

User-Agent identifies your client instance.

### POST /apps

Register app.

Request:
```http
POST /apps HTTP/1.1
User-Agent: my-app-name
```

Responses:

201 Created (new app):
```json
{"app_username": "my-app-name"}
```

409 Conflict (existing app):
```json
{"app_username": "my-app-name", "error": "already exists"}
```

curl:
```bash
curl -X POST https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps \
  -H "User-Agent: my-app-name"
```

Python:
```python
import requests
response = requests.post(
    'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps',
    headers={'User-Agent': 'my-app-name'}
)
print(response.json())
```

### DELETE /apps

Delete app and all transactions.

Request:
```http
DELETE /apps HTTP/1.1
User-Agent: my-app-name
```

Responses:

200 OK:
```json
{"deleted": true, "app_username": "my-app-name"}
```

404 Not Found:
```json
{"error": "app_not_found"}
```

curl:
```bash
curl -X DELETE https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps \
  -H "User-Agent: my-app-name"
```

Python:
```python
import requests
response = requests.delete(
    'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps',
    headers={'User-Agent': 'my-app-name'}
)
print(response.json())
```

### POST /apps/transactions

Create transaction.

Request:
```http
POST /apps/transactions HTTP/1.1
User-Agent: my-app-name
Content-Type: application/json

{"symbol": "AAPL", "side": "buy", "qty": 100, "price": 150.25}
```

Fields:
| Field | Type | Constraints |
|-------|------|-------------|
| symbol | string | Non-empty |
| side | string | "buy" or "sell" |
| qty | number | > 0 |
| price | number | > 0 |

Responses:

201 Created:
```json
{"id": 42}
```

400 Bad Request:
```json
{"error": "invalid_request"}
```

404 Not Found (app not registered):
```json
{"error": "app_not_found"}
```

curl:
```bash
curl -X POST https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps/transactions \
  -H "User-Agent: my-app-name" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":100,"price":150.25}'
```

Python:
```python
import requests
response = requests.post(
    'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps/transactions',
    headers={'User-Agent': 'my-app-name'},
    json={'symbol': 'AAPL', 'side': 'buy', 'qty': 100, 'price': 150.25}
)
print(response.json())
```

### GET /apps/transactions

Get all transactions.

Request:
```http
GET /apps/transactions HTTP/1.1
User-Agent: my-app-name
```

Response (200 OK):
```json
{
  "app_username": "my-app-name",
  "transactions": [
    {"id": 42, "app_username": "my-app-name", "symbol": "AAPL", "side": "buy", "qty": "100", "price": "150.25", "ts": "2025-01-15T10:30:00Z"}
  ]
}
```

curl:
```bash
curl -X GET https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps/transactions \
  -H "User-Agent: my-app-name"
```

Python:
```python
import requests
response = requests.get(
    'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/apps/transactions',
    headers={'User-Agent': 'my-app-name'}
)
for txn in response.json()['transactions']:
    print(f"{txn['side']} {txn['qty']} {txn['symbol']} @ ${txn['price']}")
```

### GET /predictions/{ticker}

Get stock prediction.

Request:
```http
GET /predictions/AAPL HTTP/1.1
User-Agent: my-app-name
```

Response (200 OK):
```json
{"ticker": "AAPL", "prob_up": 0.68, "strength": 0.42}
```

Fields:
- prob_up: Probability price increases (0.0-1.0). >= 0.5 is bullish
- strength: Confidence (0.0-1.0). >= 0.5 is high confidence

404 Not Found (no data):
```json
{"error": "no_data"}
```

curl:
```bash
curl -X GET https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/predictions/AAPL \
  -H "User-Agent: my-app-name"
```

Python:
```python
import requests
response = requests.get(
    'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/predictions/AAPL',
    headers={'User-Agent': 'my-app-name'}
)
data = response.json()
print(f"Probability Up: {data['prob_up'] * 100:.1f}%")
print(f"Strength: {data['strength'] * 100:.1f}%")
```

## Error Handling

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

All errors return:
```json
{"error": "error_message"}
```

## Example Client

```python
import requests

class AlphaBoostClient:
    def __init__(self, app_name, api_url='https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app'):
        self.app_name = app_name
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': app_name})

    def create_app(self):
        return self.session.post(f'{self.api_url}/apps').json()

    def create_transaction(self, symbol, side, qty, price):
        return self.session.post(
            f'{self.api_url}/apps/transactions',
            json={'symbol': symbol, 'side': side, 'qty': qty, 'price': price}
        ).json()

    def get_transactions(self):
        return self.session.get(f'{self.api_url}/apps/transactions').json()

    def get_prediction(self, ticker):
        return self.session.get(f'{self.api_url}/predictions/{ticker}').json()

client = AlphaBoostClient('my-bot')
client.create_app()
client.create_transaction('AAPL', 'buy', 100, 150.25)
print(client.get_transactions())
```

## Troubleshooting

### Network errors

- Service must be running
- Check CORS enabled on server

### Predictions returning 404

- Server needs Polygon.io API key
- Ticker must be valid
