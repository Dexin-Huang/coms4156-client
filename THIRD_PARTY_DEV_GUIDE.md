# Third-Party Developer Guide

Build custom clients for Alpha-Boost service API.

## Base URL

```
http://localhost:8080     # Local
http://SERVER-IP:8080     # Remote
```

## Required Headers

All requests need:

```http
Content-Type: application/json
User-Agent: YOUR-UNIQUE-APP-NAME
```

User-Agent identifies your client instance.

## Minimal Example

```javascript
const API_URL = 'http://localhost:8080';
const APP_NAME = 'my-trading-bot';

async function createApp() {
  const response = await fetch(`${API_URL}/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': APP_NAME,
    },
  });
  return await response.json();
}

createApp().then(data => console.log(data));
```

## Authentication

No API keys. No tokens. No passwords.

Set User-Agent to your unique app name on every request. Service uses this as app_username. All data linked to this identifier.

### Registration

1. Choose unique app name (alice-trader, bot-123, etc)
2. Call POST /apps with app name in User-Agent
3. Service creates entry in apps table
4. Use transaction and prediction endpoints

## API Endpoints

### POST /apps

Register or verify app.

#### Request

```http
POST /apps HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: my-app-name
```

No body.

#### Responses

201 Created - New app:

```json
{
  "created": true,
  "app_username": "my-app-name"
}
```

200 OK - Existing app:

```json
{
  "created": false,
  "app_username": "my-app-name"
}
```

400 Bad Request - Invalid User-Agent:

```json
{
  "error": "invalid_app_username"
}
```

500 Internal Server Error - Database error:

```json
{
  "error": "db_error"
}
```

#### Examples

curl:

```bash
curl -X POST http://localhost:8080/apps \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-trading-bot"
```

Python:

```python
import requests

response = requests.post(
    'http://localhost:8080/apps',
    headers={'User-Agent': 'my-trading-bot'}
)
print(response.json())
```


### DELETE /apps

Delete app and all its transactions.

#### Request

```http
DELETE /apps HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: my-app-name
```

No body.

#### Responses

200 OK - App deleted:

```json
{
  "deleted": true,
  "app_username": "my-app-name"
}
```

404 Not Found - App not found:

```json
{
  "error": "app_not_found"
}
```

400 Bad Request - Invalid User-Agent:

```json
{
  "error": "invalid_app_username"
}
```

500 Internal Server Error - Database error:

```json
{
  "error": "db_error"
}
```

#### Examples

curl:

```bash
curl -X DELETE http://localhost:8080/apps   -H "Content-Type: application/json"   -H "User-Agent: my-trading-bot"
```

Python:

```python
import requests

response = requests.delete(
    'http://localhost:8080/apps',
    headers={'User-Agent': 'my-trading-bot'}
)
print(response.json())
```

### POST /apps/transactions

Create stock transaction.

#### Request

```http
POST /apps/transactions HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: my-app-name

{
  "symbol": "AAPL",
  "side": "buy",
  "qty": 100,
  "price": 150.25
}
```

#### Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| symbol | string | Yes | Non-empty | Stock ticker |
| side | string | Yes | "buy" or "sell" | Transaction type |
| qty | number | Yes | > 0 | Shares |
| price | number | Yes | > 0 | Price per share |

#### Responses

201 Created:

```json
{
  "id": 42
}
```

400 Bad Request:

```json
{
  "error": "invalid_request"
}
```

404 Not Found - App not registered:

```json
{
  "error": "app_not_found"
}
```

500 Internal Server Error:

```json
{
  "error": "db_error"
}
```

#### Examples

curl:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-trading-bot" \
  -d '{
    "symbol": "GOOGL",
    "side": "sell",
    "qty": 50,
    "price": 2800.50
  }'
```

Python:

```python
import requests

response = requests.post(
    'http://localhost:8080/apps/transactions',
    headers={'User-Agent': 'my-trading-bot'},
    json={
        'symbol': 'TSLA',
        'side': 'buy',
        'qty': 10,
        'price': 250.00
    }
)
print(response.json())
```

### GET /apps/transactions

Get all transactions for your app.

#### Request

```http
GET /apps/transactions HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: my-app-name
```

No body.

#### Responses

200 OK:

```json
{
  "app_username": "my-app-name",
  "transactions": [
    {
      "id": 42,
      "app_username": "my-app-name",
      "symbol": "AAPL",
      "side": "buy",
      "qty": "100",
      "price": "150.25",
      "ts": "2025-01-15T10:30:00Z"
    },
    {
      "id": 43,
      "app_username": "my-app-name",
      "symbol": "GOOGL",
      "side": "sell",
      "qty": "50",
      "price": "2800.50",
      "ts": "2025-01-15T11:45:00Z"
    }
  ]
}
```

400 Bad Request:

```json
{
  "error": "invalid_app_username"
}
```

500 Internal Server Error:

```json
{
  "error": "db_error"
}
```

#### Examples

curl:

```bash
curl -X GET http://localhost:8080/apps/transactions \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-trading-bot"
```

Python:

```python
import requests

response = requests.get(
    'http://localhost:8080/apps/transactions',
    headers={'User-Agent': 'my-trading-bot'}
)

data = response.json()
for txn in data['transactions']:
    print(f"{txn['side'].upper()} {txn['qty']} {txn['symbol']} @ ${txn['price']}")
```

### GET /predictions/{ticker}

Get stock price prediction.

#### Request

```http
GET /predictions/AAPL HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: my-app-name
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticker | string | Yes | Stock symbol (AAPL, GOOGL, etc) |

#### Responses

200 OK:

```json
{
  "ticker": "AAPL",
  "prob_up": 0.68,
  "strength": 0.42
}
```

Fields:
- ticker: Stock symbol
- prob_up: Probability price increases (0.0-1.0). >= 0.5 is bullish, < 0.5 is bearish
- strength: Confidence (0.0-1.0). >= 0.5 is high confidence

404 Not Found - No data:

```json
{
  "error": "no_data"
}
```

500 Internal Server Error:

```json
{
  "error": "service_error"
}
```

#### Examples

curl:

```bash
curl -X GET http://localhost:8080/predictions/TSLA \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-trading-bot"
```

Python:

```python
import requests

response = requests.get(
    'http://localhost:8080/predictions/MSFT',
    headers={'User-Agent': 'my-trading-bot'}
)

data = response.json()
print(f"Ticker: {data['ticker']}")
print(f"Probability Up: {data['prob_up'] * 100:.1f}%")
print(f"Strength: {data['strength'] * 100:.1f}%")
```

## Error Handling

### Status Codes

| Code | Meaning | Causes |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input, missing fields |
| 404 | Not Found | App not registered, no data |
| 500 | Internal Server Error | Database error, API failure |

### Error Format

All errors return JSON:

```json
{
  "error": "error_code_or_message"
}
```

### Example Error Handler

```javascript
async function createTransaction(symbol, side, qty, price) {
  const response = await fetch(`${API_URL}/apps/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': APP_NAME,
    },
    body: JSON.stringify({ symbol, side, qty, price }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('App not registered. Call POST /apps first.');
    } else if (response.status === 400) {
      throw new Error(`Invalid input: ${data.error}`);
    } else {
      throw new Error(`Server error: ${data.error}`);
    }
  }

  return data;
}
```

## Best Practices

### Use Unique App Name

Choose descriptive identifier: alice-bot-prod, trading-bot-v2, etc.
Avoid generic names: client, test.

### Register Before Transacting

```javascript
// Correct
await createApp();
await createTransaction('AAPL', 'buy', 100, 150);

// Wrong - gets 404
await createTransaction('AAPL', 'buy', 100, 150);
```

### Validate Input

```javascript
function validateTransaction(symbol, side, qty, price) {
  if (!symbol || symbol.trim() === '') {
    throw new Error('Symbol required');
  }
  if (side !== 'buy' && side !== 'sell') {
    throw new Error('Side must be "buy" or "sell"');
  }
  if (qty <= 0) {
    throw new Error('Quantity must be > 0');
  }
  if (price <= 0) {
    throw new Error('Price must be > 0');
  }
}
```

### Handle Network Errors

```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error - is the server running?');
    }
    throw error;
  }
}
```

### Consistent User-Agent

Store app name, reuse it:

```javascript
class AlphaBoostClient {
  constructor(appName, apiUrl = 'http://localhost:8080') {
    this.appName = appName;
    this.apiUrl = apiUrl;
  }

  async request(endpoint, options = {}) {
    return fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.appName,
        ...options.headers,
      },
    });
  }

  async createApp() {
    return this.request('/apps', { method: 'POST' });
  }

  async createTransaction(symbol, side, qty, price) {
    return this.request('/apps/transactions', {
      method: 'POST',
      body: JSON.stringify({ symbol, side, qty, price }),
    });
  }
}

const client = new AlphaBoostClient('my-bot');
await client.createApp();
await client.createTransaction('AAPL', 'buy', 100, 150);
```

## Example Implementations

### Python

```python
import requests

class AlphaBoostClient:
    def __init__(self, app_name, api_url='http://localhost:8080'):
        self.app_name = app_name
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': app_name})

    def create_app(self):
        response = self.session.post(f'{self.api_url}/apps')
        response.raise_for_status()
        return response.json()

    def create_transaction(self, symbol, side, qty, price):
        payload = {
            'symbol': symbol,
            'side': side,
            'qty': qty,
            'price': price
        }
        response = self.session.post(
            f'{self.api_url}/apps/transactions',
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def get_transactions(self):
        response = self.session.get(f'{self.api_url}/apps/transactions')
        response.raise_for_status()
        return response.json()

    def get_prediction(self, ticker):
        response = self.session.get(f'{self.api_url}/predictions/{ticker}')
        response.raise_for_status()
        return response.json()

# Usage
client = AlphaBoostClient('python-bot')
client.create_app()
client.create_transaction('AAPL', 'buy', 100, 150.25)
txns = client.get_transactions()
print(f"Total transactions: {len(txns['transactions'])}")
```

### Bash

```bash
#!/bin/bash

API_URL="http://localhost:8080"
APP_NAME="bash-bot"

# Register
curl -s -X POST "$API_URL/apps" \
  -H "User-Agent: $APP_NAME" | jq

# Create transaction
curl -s -X POST "$API_URL/apps/transactions" \
  -H "User-Agent: $APP_NAME" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "side": "buy",
    "qty": 100,
    "price": 150.25
  }' | jq

# Get transactions
curl -s -X GET "$API_URL/apps/transactions" \
  -H "User-Agent: $APP_NAME" | jq

# Get prediction
curl -s -X GET "$API_URL/predictions/TSLA" \
  -H "User-Agent: $APP_NAME" | jq
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type Client struct {
    AppName string
    APIUrl  string
    client  *http.Client
}

func NewClient(appName, apiUrl string) *Client {
    return &Client{
        AppName: appName,
        APIUrl:  apiUrl,
        client:  &http.Client{},
    }
}

func (c *Client) request(method, endpoint string, body interface{}) (*http.Response, error) {
    var reqBody *bytes.Buffer
    if body != nil {
        jsonData, _ := json.Marshal(body)
        reqBody = bytes.NewBuffer(jsonData)
    } else {
        reqBody = bytes.NewBuffer([]byte{})
    }

    req, err := http.NewRequest(method, c.APIUrl+endpoint, reqBody)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("User-Agent", c.AppName)

    return c.client.Do(req)
}

func (c *Client) CreateApp() error {
    resp, err := c.request("POST", "/apps", nil)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    return nil
}

func (c *Client) CreateTransaction(symbol, side string, qty, price float64) error {
    payload := map[string]interface{}{
        "symbol": symbol,
        "side":   side,
        "qty":    qty,
        "price":  price,
    }
    resp, err := c.request("POST", "/apps/transactions", payload)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    return nil
}

func main() {
    client := NewClient("go-bot", "http://localhost:8080")
    client.CreateApp()
    client.CreateTransaction("AAPL", "buy", 100, 150.25)
    fmt.Println("Transaction created!")
}
```

## Testing

### Local

1. Start Alpha-Boost:

```bash
cd alpha-boost
docker compose up -d
./build/alpha_boost
```

2. Register app:

```bash
curl -X POST http://localhost:8080/apps -H "User-Agent: test-bot"
```

3. Create test transaction:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-bot" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"TEST","side":"buy","qty":1,"price":1}'
```

4. Verify:

```bash
curl -X GET http://localhost:8080/apps/transactions \
  -H "User-Agent: test-bot"
```

### Multi-Client

Test isolation with different app names:

```bash
# Alice
curl -X POST http://localhost:8080/apps -H "User-Agent: alice"
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: alice" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":10,"price":150}'

# Bob
curl -X POST http://localhost:8080/apps -H "User-Agent: bob"
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: bob" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"GOOGL","side":"sell","qty":5,"price":2800}'

# Verify isolation
curl -X GET http://localhost:8080/apps/transactions -H "User-Agent: alice"
curl -X GET http://localhost:8080/apps/transactions -H "User-Agent: bob"
```

Alice sees only AAPL. Bob sees only GOOGL.

## FAQ

Q: API key needed?
A: No. Just User-Agent header.

Q: Can I change app name?
A: Yes, but transaction history is tied to app name. New name means new history.

Q: Rate limiting?
A: Not implemented. Be respectful.

Q: Can I delete transactions?
A: No DELETE endpoint. Transactions are immutable.

Q: Max transaction size?
A: NUMERIC(18,6) storage. Very high limit.

Q: Predictions cost money?
A: Polygon.io API requires paid plan. Check with server admin.

Q: Multiple clients with same app name?
A: Possible, but they share transaction history. Use unique names for isolation.

## References

- README.md (main) - Service setup
- E2E_TEST_CHECKLIST.md - Testing examples

## License

Educational purposes.
