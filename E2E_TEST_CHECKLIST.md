# End-to-End Test Checklist

Test all Alpha-Boost client and service integration.

Execute manually via web client or automate with curl/scripts.

Coverage: All API endpoints, valid/invalid inputs, multi-client scenarios, error conditions.

## Test Environment Setup

### Prerequisites

1. Alpha-Boost service running:

```bash
cd alpha-boost
docker compose up -d
./build/alpha_boost
```

Verify at http://localhost:8080

2. Client running:

```bash
cd client
npm install
npm run dev
```

Verify at http://localhost:3000

3. Database initialized:

```bash
docker compose exec -T db psql -U postgres -d postgres -f - < sql/init.sql
```

## Test Categories

- App Registration Tests
- Transaction Creation Tests
- Transaction Retrieval Tests
- Prediction Tests
- Multi-Client Tests
- Error Handling Tests

## App Registration Tests

### Test 1.1: Register New App

Objective: Verify new app registration succeeds

Steps:
1. Open http://localhost:3000
2. Enter app name: test-user-1
3. Click Register

Expected:
- Success message: "Successfully registered as 'test-user-1' (New app created)"
- HTTP Status: 201 Created
- Response: {"created": true, "app_username": "test-user-1"}
- App name in localStorage

curl:

```bash
curl -X POST http://localhost:8080/apps \
  -H "User-Agent: test-user-1" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 1.2: Register Existing App

Objective: Verify re-registration succeeds without error

Steps:
1. Register as test-user-1 (if not already)
2. Enter app name: test-user-1 again
3. Click Register

Expected:
- Success message: "Successfully registered as 'test-user-1' (App already exists)"
- HTTP Status: 200 OK
- Response: {"created": false, "app_username": "test-user-1"}

curl:

```bash
curl -X POST http://localhost:8080/apps \
  -H "User-Agent: test-user-1" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 1.3: Register with Empty App Name

Objective: Verify validation rejects empty app name

Steps:
1. Open http://localhost:3000
2. Leave app name empty
3. Click Register

Expected:
- Error message: "App name is required"
- No API call (client-side validation)

Status: [ ] Pass [ ] Fail

### Test 1.4: Delete Existing App

Objective: Verify successful app deletion

Prerequisite: Registered as test-delete-user

Steps:
1. Register as test-delete-user
2. Delete the app

Expected:
- HTTP Status: 200 OK
- Response: {"deleted": true}
- App no longer exists in database

curl:

```bash
curl -X POST http://localhost:8080/apps -H "User-Agent: test-delete-user"
curl -X DELETE http://localhost:8080/apps \
  -H "User-Agent: test-delete-user" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 1.5: Delete Non-Existent App

Objective: Verify deletion of non-existent app returns 404

curl only:

```bash
curl -X DELETE http://localhost:8080/apps \
  -H "User-Agent: never-registered-user" \
  -w "\nStatus: %{http_code}\n"
```

Expected:
- HTTP Status: 404 Not Found
- Error: {"error": "app_not_found"}

Status: [ ] Pass [ ] Fail

### Test 1.6: Verify Cascade Delete of Transactions

Objective: Verify deleting an app also deletes its transactions

Prerequisite: Registered as cascade-test-user with transactions

Steps:
1. Register as cascade-test-user
2. Create a transaction
3. Delete the app
4. Re-register as cascade-test-user
5. Get transactions

Expected:
- After deletion and re-registration, transactions list is empty
- Previous transactions are cascade deleted

curl:

```bash
# Setup
curl -X POST http://localhost:8080/apps -H "User-Agent: cascade-test-user"
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: cascade-test-user" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":10,"price":100}'

# Delete app
curl -X DELETE http://localhost:8080/apps -H "User-Agent: cascade-test-user"

# Re-register and verify empty
curl -X POST http://localhost:8080/apps -H "User-Agent: cascade-test-user"
curl -X GET http://localhost:8080/apps/transactions \
  -H "User-Agent: cascade-test-user" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

## Transaction Creation Tests

### Test 2.1: Create Valid Buy Transaction

Objective: Verify successful buy transaction creation

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /transactions
2. Enter:
   - Symbol: AAPL
   - Side: buy
   - Quantity: 100
   - Price: 150.25
3. Click Create Transaction

Expected:
- Success message with transaction ID
- HTTP Status: 201 Created
- Response: {"id": NUMBER}
- Transaction in history table

curl:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":100,"price":150.25}' \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 2.2: Create Valid Sell Transaction

Objective: Verify successful sell transaction creation

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /transactions
2. Enter:
   - Symbol: GOOGL
   - Side: sell
   - Quantity: 50
   - Price: 2800.50
3. Click Create Transaction

Expected:
- Success message with transaction ID
- HTTP Status: 201 Created
- Sell transaction in history with red badge

curl:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"GOOGL","side":"sell","qty":50,"price":2800.50}' \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 2.3: Create Transaction with Decimal Quantities

Objective: Verify fractional shares support

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /transactions
2. Enter:
   - Symbol: BTC
   - Side: buy
   - Quantity: 0.5
   - Price: 45000.00
3. Click Create Transaction

Expected:
- Success message
- HTTP Status: 201 Created
- Transaction shows qty as 0.5

curl:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTC","side":"buy","qty":0.5,"price":45000}' \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 2.4: Create Transaction with Negative Quantity

Objective: Verify validation rejects negative quantity

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /transactions
2. Enter:
   - Symbol: AAPL
   - Side: buy
   - Quantity: -10
   - Price: 150
3. Click Create Transaction

Expected:
- Error message: "Failed to create transaction"
- HTTP Status: 400 Bad Request

curl:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":-10,"price":150}' \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 2.5: Create Transaction with Negative Price

Objective: Verify validation rejects negative price

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /transactions
2. Enter:
   - Symbol: AAPL
   - Side: buy
   - Quantity: 10
   - Price: -150
3. Click Create Transaction

Expected:
- Error message: "Failed to create transaction"
- HTTP Status: 400 Bad Request

curl:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":10,"price":-150}' \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 2.6: Create Transaction with Invalid Side

Objective: Verify validation rejects invalid side value

Prerequisite: Registered as test-user-1

curl only (UI prevents this):

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"hold","qty":10,"price":150}' \
  -w "\nStatus: %{http_code}\n"
```

Expected:
- HTTP Status: 400 Bad Request
- Error response indicating invalid side

Status: [ ] Pass [ ] Fail

### Test 2.7: Create Transaction Without Registration

Objective: Verify transaction requires prior registration

curl only:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: unregistered-user" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":10,"price":150}' \
  -w "\nStatus: %{http_code}\n"
```

Expected:
- HTTP Status: 404 Not Found
- Error: {"error": "app_not_found"}

Status: [ ] Pass [ ] Fail

## Transaction Retrieval Tests

### Test 3.1: Get Transaction History (With Data)

Objective: Verify transaction history retrieval

Prerequisite:
- Registered as test-user-1
- Created at least 2 transactions

Steps:
1. Navigate to /transactions
2. Click Refresh

Expected:
- HTTP Status: 200 OK
- All test-user-1 transactions in table
- Columns: ID, Symbol, Side, Qty, Price, Timestamp
- Buy orders green badge, sell orders red badge

curl:

```bash
curl -X GET http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 3.2: Get Transaction History (Empty)

Objective: Verify correct response with no transactions

Prerequisite: Registered as test-user-new with no transactions

Steps:
1. Register as test-user-new
2. Navigate to /transactions

Expected:
- HTTP Status: 200 OK
- Message: "No transactions yet. Create your first trade"
- Response: {"app_username": "test-user-new", "transactions": []}

curl:

```bash
curl -X POST http://localhost:8080/apps -H "User-Agent: test-user-new"
curl -X GET http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-new" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

## Prediction Tests

### Test 4.1: Get Prediction for Valid Ticker

Objective: Verify successful prediction retrieval

Prerequisite:
- Registered as test-user-1
- Service has Polygon API key configured

Steps:
1. Navigate to /predictions
2. Enter ticker: AAPL
3. Click Get Prediction

Expected:
- HTTP Status: 200 OK
- Response contains: ticker, prob_up (0.0-1.0), strength (0.0-1.0)
- UI displays probability bar and strength bar
- Interpretation shown (bullish/bearish with confidence)

curl:

```bash
curl -X GET http://localhost:8080/predictions/AAPL \
  -H "User-Agent: test-user-1" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

### Test 4.2: Get Prediction for Multiple Tickers

Objective: Verify predictions work for different stocks

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /predictions
2. Test tickers: AAPL, GOOGL, MSFT, TSLA
3. Get prediction for each

Expected:
- Each ticker returns valid prediction data
- Different prob_up and strength values

Status: [ ] Pass [ ] Fail

### Test 4.3: Get Prediction for Invalid Ticker

Objective: Verify graceful handling of unknown ticker

Prerequisite: Registered as test-user-1

Steps:
1. Navigate to /predictions
2. Enter ticker: INVALIDXYZ
3. Click Get Prediction

Expected:
- HTTP Status: 404 Not Found
- Error message: "No recent data available for INVALIDXYZ"

curl:

```bash
curl -X GET http://localhost:8080/predictions/INVALIDXYZ \
  -H "User-Agent: test-user-1" \
  -w "\nStatus: %{http_code}\n"
```

Status: [ ] Pass [ ] Fail

## Multi-Client Tests

### Test 5.1: Transaction Isolation Between Clients

Objective: Verify each client sees only their transactions

Steps:
1. Client A (Tab 1):
   - Register as alice
   - Create buy transaction: AAPL, 100 shares at 150

2. Client B (Tab 2):
   - Register as bob
   - Create sell transaction: GOOGL, 50 shares at 2800

3. Verify:
   - Alice sees only AAPL transaction
   - Bob sees only GOOGL transaction

Expected:
- Each client sees only their transactions
- No data leakage

curl:

```bash
# Alice
curl -X POST http://localhost:8080/apps -H "User-Agent: alice"
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: alice" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":100,"price":150}'

# Bob
curl -X POST http://localhost:8080/apps -H "User-Agent: bob"
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: bob" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"GOOGL","side":"sell","qty":50,"price":2800}'

# Verify isolation
curl -X GET http://localhost:8080/apps/transactions -H "User-Agent: alice" | jq
curl -X GET http://localhost:8080/apps/transactions -H "User-Agent: bob" | jq
```

Status: [ ] Pass [ ] Fail

### Test 5.2: Concurrent Transaction Creation

Objective: Verify multiple clients can create transactions simultaneously

Steps:
1. Open 3 browser tabs
2. Register each as different user: user-1, user-2, user-3
3. Simultaneously create transactions in all 3 tabs

Expected:
- All transactions succeed
- Each gets unique transaction ID
- No race conditions or conflicts
- Each user sees only their transaction

Status: [ ] Pass [ ] Fail

### Test 5.3: Multiple Clients Getting Same Prediction

Objective: Verify predictions work for multiple clients accessing same ticker

Steps:
1. Client A: Get prediction for AAPL
2. Client B: Get prediction for AAPL (same ticker)

Expected:
- Both clients receive prediction data
- Prediction values same (deterministic at same time)
- No conflicts or errors

Status: [ ] Pass [ ] Fail

## Error Handling Tests

### Test 6.1: Service Unavailable

Objective: Verify graceful handling when service is down

Steps:
1. Stop Alpha-Boost service: docker compose down
2. Try to register or create transaction in client

Expected:
- Error message: "Error: Failed to fetch" or similar
- No application crash
- User informed of network issue

Status: [ ] Pass [ ] Fail

### Test 6.2: Database Connection Lost

Objective: Verify service handles database errors

Steps:
1. Stop PostgreSQL: docker compose stop db
2. Try to create transaction

Expected:
- HTTP Status: 500 Internal Server Error
- Error response: {"error": "db_error"}
- Request logged (if logging to file/stdout)

Status: [ ] Pass [ ] Fail

### Test 6.3: Malformed JSON Request

Objective: Verify validation of request payload

curl only:

```bash
curl -X POST http://localhost:8080/apps/transactions \
  -H "User-Agent: test-user-1" \
  -H "Content-Type: application/json" \
  -d 'invalid json' \
  -w "\nStatus: %{http_code}\n"
```

Expected:
- HTTP Status: 400 Bad Request
- Error indicating invalid JSON

Status: [ ] Pass [ ] Fail

## Test Execution Log

| Test ID | Description | Date | Result | Notes |
|---------|-------------|------|--------|-------|
| 1.1 | Register new app | | Pass / Fail | |
| 1.2 | Register existing app | | Pass / Fail | |
| 1.3 | Empty app name | | Pass / Fail | |
| 1.4 | Delete existing app | | Pass / Fail | |
| 1.5 | Delete non-existent app | | Pass / Fail | |
| 1.6 | Cascade delete transactions | | Pass / Fail | |
| 2.1 | Valid buy transaction | | Pass / Fail | |
| 2.2 | Valid sell transaction | | Pass / Fail | |
| 2.3 | Decimal quantities | | Pass / Fail | |
| 2.4 | Negative quantity | | Pass / Fail | |
| 2.5 | Negative price | | Pass / Fail | |
| 2.6 | Invalid side | | Pass / Fail | |
| 2.7 | Unregistered user | | Pass / Fail | |
| 3.1 | Get transactions (with data) | | Pass / Fail | |
| 3.2 | Get transactions (empty) | | Pass / Fail | |
| 4.1 | Valid prediction | | Pass / Fail | |
| 4.2 | Multiple tickers | | Pass / Fail | |
| 4.3 | Invalid ticker | | Pass / Fail | |
| 5.1 | Transaction isolation | | Pass / Fail | |
| 5.2 | Concurrent creation | | Pass / Fail | |
| 5.3 | Multiple clients prediction | | Pass / Fail | |
| 6.1 | Service unavailable | | Pass / Fail | |
| 6.2 | Database connection lost | | Pass / Fail | |
| 6.3 | Malformed JSON | | Pass / Fail | |

## Test Coverage Summary

Total Tests: 24

Endpoint Coverage:
- POST /apps (3 tests)
- DELETE /apps (3 tests)
- POST /apps/transactions (7 tests)
- GET /apps/transactions (2 tests)
- GET /predictions/{ticker} (3 tests)

Scenario Coverage:
- Valid inputs
- Invalid inputs
- Boundary conditions
- Multi-client scenarios
- Error conditions
- Service failures

Test Types:
- Happy path tests
- Validation tests
- Error handling tests
- Integration tests
- Multi-client tests

## Automated Test Script

```bash
#!/bin/bash

API_URL="http://localhost:8080"

echo "=== E2E Test Suite ==="

# Test 1.1: Register new app
echo "Test 1.1: Register new app"
curl -s -X POST "$API_URL/apps" -H "User-Agent: test-bot" -w "\nStatus: %{http_code}\n"

# Test 2.1: Create buy transaction
echo "Test 2.1: Create buy transaction"
curl -s -X POST "$API_URL/apps/transactions" \
  -H "User-Agent: test-bot" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"buy","qty":100,"price":150.25}' \
  -w "\nStatus: %{http_code}\n"

# Test 3.1: Get transactions
echo "Test 3.1: Get transactions"
curl -s -X GET "$API_URL/apps/transactions" \
  -H "User-Agent: test-bot" -w "\nStatus: %{http_code}\n"

# Test 4.1: Get prediction
echo "Test 4.1: Get prediction"
curl -s -X GET "$API_URL/predictions/AAPL" \
  -H "User-Agent: test-bot" -w "\nStatus: %{http_code}\n"

echo "=== Tests Complete ==="
```

Save as e2e-tests.sh and run: bash e2e-tests.sh

## Manual Test Procedure

1. Start services (Alpha-Boost + Client)
2. Work through each test in order
3. Mark Pass/Fail in execution log
4. Document issues in Notes column
5. Re-test failures after fixes
6. Sign off when all tests pass

## Sign-Off

Tester Name: ___________________________

Date: ___________________________

Tests Passed: _____ / 24

Tests Failed: _____ / 24

Comments:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________
