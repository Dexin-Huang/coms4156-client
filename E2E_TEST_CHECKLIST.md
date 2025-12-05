# E2E Test Checklist

Manual end-to-end tests for RobinTrade client against Alpha-Boost service.

## Prerequisites

- Service running at https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app
- curl installed
- Unique User-Agent for each test run

## Test Cases

### App Registration

| ID | Test | Method | Endpoint | Input | Expected Status | Expected Response |
|----|------|--------|----------|-------|-----------------|-------------------|
| APP-01 | Register new app | POST | /apps | User-Agent: test-app-{uuid} | 201 | {"app_username": "test-app-{uuid}"} |
| APP-02 | Register existing app | POST | /apps | User-Agent: test-app-{uuid} (same as APP-01) | 409 | {"app_username": "...", "error": "already exists"} |
| APP-03 | Delete existing app | DELETE | /apps | User-Agent: test-app-{uuid} | 200 | {"deleted": true, "app_username": "..."} |
| APP-04 | Delete non-existent app | DELETE | /apps | User-Agent: nonexistent-app | 404 | {"error": "app_not_found"} |

### Transactions

| ID | Test | Method | Endpoint | Input | Expected Status | Expected Response |
|----|------|--------|----------|-------|-----------------|-------------------|
| TXN-01 | Create buy transaction | POST | /apps/transactions | {"symbol":"AAPL","side":"buy","qty":100,"price":150.25} | 201 | {"id": <number>} |
| TXN-02 | Create sell transaction | POST | /apps/transactions | {"symbol":"AAPL","side":"sell","qty":50,"price":155.00} | 201 | {"id": <number>} |
| TXN-03 | Zero quantity rejected | POST | /apps/transactions | {"symbol":"AAPL","side":"buy","qty":0,"price":150.25} | 400 | {"error": "invalid_request"} |
| TXN-04 | Negative quantity rejected | POST | /apps/transactions | {"symbol":"AAPL","side":"buy","qty":-10,"price":150.25} | 400 | {"error": "invalid_request"} |
| TXN-05 | Zero price rejected | POST | /apps/transactions | {"symbol":"AAPL","side":"buy","qty":100,"price":0} | 400 | {"error": "invalid_request"} |
| TXN-06 | Negative price rejected | POST | /apps/transactions | {"symbol":"AAPL","side":"buy","qty":100,"price":-50} | 400 | {"error": "invalid_request"} |
| TXN-07 | Invalid side rejected | POST | /apps/transactions | {"symbol":"AAPL","side":"hold","qty":100,"price":150} | 400 | {"error": "invalid_request"} |
| TXN-08 | Empty symbol rejected | POST | /apps/transactions | {"symbol":"","side":"buy","qty":100,"price":150} | 400 | {"error": "invalid_request"} |
| TXN-09 | Unregistered app rejected | POST | /apps/transactions | User-Agent: unregistered-app | 404 | {"error": "app_not_found"} |
| TXN-10 | Get transactions | GET | /apps/transactions | User-Agent: test-app-{uuid} | 200 | {"app_username": "...", "transactions": [...]} |
| TXN-11 | Get transactions empty | GET | /apps/transactions | User-Agent: new-app (no transactions) | 200 | {"app_username": "...", "transactions": []} |

### Predictions

| ID | Test | Method | Endpoint | Input | Expected Status | Expected Response |
|----|------|--------|----------|-------|-----------------|-------------------|
| PRED-01 | Valid ticker | GET | /predictions/AAPL | User-Agent: test-app | 200 | {"ticker":"AAPL","prob_up":<0-1>,"strength":<0-1>} |
| PRED-02 | Valid ticker lowercase | GET | /predictions/aapl | User-Agent: test-app | 200 | {"ticker":"AAPL",...} |
| PRED-03 | Invalid ticker | GET | /predictions/INVALID123 | User-Agent: test-app | 404 | {"error": "no_data"} |
| PRED-04 | Empty ticker | GET | /predictions/ | User-Agent: test-app | 404 | 404 page |

### Multi-Client Isolation

| ID | Test | Method | Endpoint | Input | Expected Status | Expected Response |
|----|------|--------|----------|-------|-----------------|-------------------|
| MULTI-01 | Client A creates transaction | POST | /apps/transactions | User-Agent: client-a | 201 | {"id": <number>} |
| MULTI-02 | Client B creates transaction | POST | /apps/transactions | User-Agent: client-b | 201 | {"id": <number>} |
| MULTI-03 | Client A sees only own transactions | GET | /apps/transactions | User-Agent: client-a | 200 | Only client-a transactions |
| MULTI-04 | Client B sees only own transactions | GET | /apps/transactions | User-Agent: client-b | 200 | Only client-b transactions |
| MULTI-05 | Delete client A cascades transactions | DELETE | /apps | User-Agent: client-a | 200 | Client A transactions deleted |
| MULTI-06 | Client B unaffected by A deletion | GET | /apps/transactions | User-Agent: client-b | 200 | Client B transactions intact |

### Concurrent Operations

| ID | Test | Method | Endpoint | Input | Expected Status | Expected Response |
|----|------|--------|----------|-------|-----------------|-------------------|
| CONC-01 | Simultaneous registration | POST | /apps | Two requests same User-Agent | One 201, one 409 | Race handled correctly |
| CONC-02 | Simultaneous transactions | POST | /apps/transactions | Two requests same client | Both 201 | Both transactions created |

## Test Execution

### Setup

```bash
export API_URL=https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app
export TEST_APP=test-app-$(date +%s)
```

### APP-01: Register new app

```bash
curl -X POST $API_URL/apps -H "User-Agent: $TEST_APP"
```

Expected: 201, {"app_username": "test-app-..."}

### APP-02: Register existing app

```bash
curl -X POST $API_URL/apps -H "User-Agent: $TEST_APP"
```

Expected: 409, {"app_username": "...", "error": "already exists"}

### TXN-01: Create buy transaction

```bash
curl -X POST $API_URL/apps/transactions \
  -H "User-Agent: $TEST_APP" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":100,"price":150.25}'
```

Expected: 201, {"id": <number>}

### TXN-04: Negative quantity rejected

```bash
curl -X POST $API_URL/apps/transactions \
  -H "User-Agent: $TEST_APP" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":-10,"price":150.25}'
```

Expected: 400, {"error": "invalid_request"}

### TXN-10: Get transactions

```bash
curl -X GET $API_URL/apps/transactions -H "User-Agent: $TEST_APP"
```

Expected: 200, {"app_username": "...", "transactions": [...]}

### PRED-01: Valid ticker

```bash
curl -X GET $API_URL/predictions/AAPL -H "User-Agent: $TEST_APP"
```

Expected: 200, {"ticker": "AAPL", "prob_up": <0-1>, "strength": <0-1>}

### MULTI-01 to MULTI-06: Multi-client isolation

```bash
export CLIENT_A=client-a-$(date +%s)
export CLIENT_B=client-b-$(date +%s)

# Register both clients
curl -X POST $API_URL/apps -H "User-Agent: $CLIENT_A"
curl -X POST $API_URL/apps -H "User-Agent: $CLIENT_B"

# Each creates a transaction
curl -X POST $API_URL/apps/transactions \
  -H "User-Agent: $CLIENT_A" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":100,"price":150}'

curl -X POST $API_URL/apps/transactions \
  -H "User-Agent: $CLIENT_B" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"GOOG","side":"buy","qty":50,"price":140}'

# Verify isolation
curl -X GET $API_URL/apps/transactions -H "User-Agent: $CLIENT_A"
# Should only show AAPL transaction

curl -X GET $API_URL/apps/transactions -H "User-Agent: $CLIENT_B"
# Should only show GOOG transaction

# Delete client A
curl -X DELETE $API_URL/apps -H "User-Agent: $CLIENT_A"

# Verify client B unaffected
curl -X GET $API_URL/apps/transactions -H "User-Agent: $CLIENT_B"
# Should still show GOOG transaction
```

### APP-03: Cleanup

```bash
curl -X DELETE $API_URL/apps -H "User-Agent: $TEST_APP"
curl -X DELETE $API_URL/apps -H "User-Agent: $CLIENT_B"
```

## Test Results

| ID | Status | Notes |
|----|--------|-------|
| APP-01 | | |
| APP-02 | | |
| APP-03 | | |
| APP-04 | | |
| TXN-01 | | |
| TXN-02 | | |
| TXN-03 | | |
| TXN-04 | | |
| TXN-05 | | |
| TXN-06 | | |
| TXN-07 | | |
| TXN-08 | | |
| TXN-09 | | |
| TXN-10 | | |
| TXN-11 | | |
| PRED-01 | | |
| PRED-02 | | |
| PRED-03 | | |
| PRED-04 | | |
| MULTI-01 | | |
| MULTI-02 | | |
| MULTI-03 | | |
| MULTI-04 | | |
| MULTI-05 | | |
| MULTI-06 | | |
| CONC-01 | | |
| CONC-02 | | |
