/**
 * Alpha-Boost API Client
 *
 * Provides functions to interact with the Alpha-Boost service API.
 * All functions use the app name from localStorage and set it as User-Agent header.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app';

/**
 * Get the current app name from localStorage
 */
function getAppName() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('appName');
}

/**
 * Make an API request with proper headers
 */
async function apiRequest(endpoint, options = {}) {
  const appName = getAppName();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': appName || 'unknown-client',
      ...options.headers,
    },
  });

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

/**
 * POST /apps - Register/create an app
 * @returns {Promise<{ok: boolean, status: number, data: object}>}
 */
export async function createApp(appName) {
  return apiRequest('/apps', {
    method: 'POST',
    headers: {
      'User-Agent': appName,
    },
  });
}

/**
 * POST /apps/transactions - Create a new transaction
 * @param {string} symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param {string} side - 'buy' or 'sell'
 * @param {number} qty - Quantity (must be > 0)
 * @param {number} price - Price per share (must be > 0)
 * @returns {Promise<{ok: boolean, status: number, data: object}>}
 */
export async function createTransaction(symbol, side, qty, price) {
  return apiRequest('/apps/transactions', {
    method: 'POST',
    body: JSON.stringify({
      symbol,
      side,
      qty: parseFloat(qty),
      price: parseFloat(price),
    }),
  });
}

/**
 * GET /apps/transactions - Get all transactions for the current app
 * @returns {Promise<{ok: boolean, status: number, data: object}>}
 */
export async function getTransactions() {
  return apiRequest('/apps/transactions', {
    method: 'GET',
  });
}

/**
 * DELETE /apps - Delete the current app and all its transactions
 * @returns {Promise<{ok: boolean, status: number, data: object}>}
 */
export async function deleteApp() {
  return apiRequest('/apps', {
    method: 'DELETE',
  });
}

/**
 * GET /predictions/{ticker} - Get stock prediction
 * @param {string} ticker - Stock ticker symbol (e.g., 'AAPL')
 * @returns {Promise<{ok: boolean, status: number, data: object}>}
 */
export async function getPrediction(ticker) {
  return apiRequest(`/predictions/${ticker}`, {
    method: 'GET',
  });
}
