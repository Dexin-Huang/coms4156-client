const API_BASE = 'http://localhost:8080';

function addLog(method, endpoint, request, response, status) {
  const logs = JSON.parse(sessionStorage.getItem('apiLogs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    request,
    response,
    status,
  });
  sessionStorage.setItem('apiLogs', JSON.stringify(logs));
}

export function getLogs() {
  return JSON.parse(sessionStorage.getItem('apiLogs') || '[]');
}

export function clearLogs() {
  sessionStorage.setItem('apiLogs', '[]');
}

export async function createApp(appName) {
  const endpoint = '/apps';
  const request = { headers: { 'User-Agent': appName } };

  await new Promise(resolve => setTimeout(resolve, 300));

  const response = {
    app_username: appName,
  };

  addLog('POST', `${API_BASE}${endpoint}`, request, response, 201);

  return { ok: true, data: response, status: 201 };
}

export async function deleteApp() {
  const appName = sessionStorage.getItem('appName');
  const endpoint = '/apps';
  const request = { headers: { 'User-Agent': appName } };

  await new Promise(resolve => setTimeout(resolve, 300));

  const response = {
    deleted: true,
    app_username: appName,
  };

  addLog('DELETE', `${API_BASE}${endpoint}`, request, response, 200);

  return { ok: true, data: response, status: 200 };
}

export async function addTransaction(ticker, quantity, price, side) {
  const appName = sessionStorage.getItem('appName');
  const endpoint = '/apps/transactions';
  const request = {
    headers: { 'User-Agent': appName },
    body: { symbol: ticker, qty: parseFloat(quantity), price: parseFloat(price), side: side.toLowerCase() },
  };

  await new Promise(resolve => setTimeout(resolve, 300));

  const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');
  const transaction = {
    id: transactions.length + 1,
    app_username: appName,
    symbol: ticker,
    qty: parseFloat(quantity),
    price: parseFloat(price),
    side: side.toLowerCase(),
    ts: new Date().toISOString(),
  };
  transactions.push(transaction);
  sessionStorage.setItem('transactions', JSON.stringify(transactions));

  const response = { id: transaction.id };

  addLog('POST', `${API_BASE}${endpoint}`, request, response, 201);

  return { ok: true, data: response, status: 201 };
}

export async function getTransactions() {
  const appName = sessionStorage.getItem('appName');
  const endpoint = '/apps/transactions';
  const request = { headers: { 'User-Agent': appName } };

  await new Promise(resolve => setTimeout(resolve, 300));

  const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');

  const response = {
    app_username: appName,
    transactions: transactions,
  };

  addLog('GET', `${API_BASE}${endpoint}`, request, response, 200);

  return { ok: true, data: response, status: 200 };
}

export async function getPrediction(ticker) {
  const endpoint = `/predictions/${ticker}`;
  const request = { params: { ticker } };

  await new Promise(resolve => setTimeout(resolve, 500));

  const predictions = {
    AAPL: { prob_up: 0.75, strength: 0.82 },
    GOOGL: { prob_up: 0.68, strength: 0.71 },
    TSLA: { prob_up: 0.38, strength: 0.55 },
    MSFT: { prob_up: 0.81, strength: 0.88 },
    AMZN: { prob_up: 0.51, strength: 0.42 },
  };

  const prediction = predictions[ticker.toUpperCase()] || {
    prob_up: 0.50,
    strength: 0.50,
  };

  const response = {
    ticker: ticker.toUpperCase(),
    prob_up: prediction.prob_up,
    strength: prediction.strength,
  };

  addLog('GET', `${API_BASE}${endpoint}`, request, response, 200);

  return { ok: true, data: response, status: 200 };
}

export function getMostPopularStock() {
  const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');

  if (transactions.length === 0) {
    return null;
  }

  const counts = {};
  transactions.forEach(t => {
    counts[t.symbol] = (counts[t.symbol] || 0) + 1;
  });

  let maxCount = 0;
  let popular = null;
  Object.entries(counts).forEach(([ticker, count]) => {
    if (count > maxCount) {
      maxCount = count;
      popular = ticker;
    }
  });

  return { ticker: popular, count: maxCount };
}
