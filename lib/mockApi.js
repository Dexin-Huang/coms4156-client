const API_BASE = '/api';

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
  const request = { headers: { 'X-App-Name': appName } };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'X-App-Name': appName },
    });
    const response = await res.json();
    addLog('POST', `${API_BASE}${endpoint}`, request, response, res.status);
    return { ok: res.ok, data: response, status: res.status };
  } catch (e) {
    addLog('POST', `${API_BASE}${endpoint}`, request, { error: e.message }, 0);
    return { ok: false, data: { error: e.message }, status: 0 };
  }
}

export async function deleteApp() {
  const appName = sessionStorage.getItem('appName');
  const endpoint = '/apps';
  const request = { headers: { 'X-App-Name': appName } };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { 'X-App-Name': appName },
    });
    const response = await res.json();
    addLog('DELETE', `${API_BASE}${endpoint}`, request, response, res.status);
    return { ok: res.ok, data: response, status: res.status };
  } catch (e) {
    addLog('DELETE', `${API_BASE}${endpoint}`, request, { error: e.message }, 0);
    return { ok: false, data: { error: e.message }, status: 0 };
  }
}

export async function addTransaction(ticker, quantity, price, side) {
  const appName = sessionStorage.getItem('appName');
  const endpoint = '/apps/transactions';
  const body = { symbol: ticker, qty: parseFloat(quantity), price: parseFloat(price), side: side.toLowerCase() };
  const request = { headers: { 'X-App-Name': appName }, body };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Name': appName,
      },
      body: JSON.stringify(body),
    });
    const response = await res.json();
    addLog('POST', `${API_BASE}${endpoint}`, request, response, res.status);
    return { ok: res.ok, data: response, status: res.status };
  } catch (e) {
    addLog('POST', `${API_BASE}${endpoint}`, request, { error: e.message }, 0);
    return { ok: false, data: { error: e.message }, status: 0 };
  }
}

export async function getTransactions() {
  const appName = sessionStorage.getItem('appName');
  const endpoint = '/apps/transactions';
  const request = { headers: { 'X-App-Name': appName } };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: { 'X-App-Name': appName },
    });
    const response = await res.json();
    addLog('GET', `${API_BASE}${endpoint}`, request, response, res.status);
    return { ok: res.ok, data: response, status: res.status };
  } catch (e) {
    addLog('GET', `${API_BASE}${endpoint}`, request, { error: e.message }, 0);
    return { ok: false, data: { error: e.message }, status: 0 };
  }
}

export async function getPrediction(ticker) {
  const appName = sessionStorage.getItem('appName');
  const endpoint = `/predictions/${ticker}`;
  const request = { headers: { 'X-App-Name': appName } };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: { 'X-App-Name': appName },
    });
    const response = await res.json();
    addLog('GET', `${API_BASE}${endpoint}`, request, response, res.status);
    return { ok: res.ok, data: response, status: res.status };
  } catch (e) {
    addLog('GET', `${API_BASE}${endpoint}`, request, { error: e.message }, 0);
    return { ok: false, data: { error: e.message }, status: 0 };
  }
}

export function getMostPopularStock() {
  const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');
  if (transactions.length === 0) return null;
  const counts = {};
  transactions.forEach(t => { counts[t.symbol] = (counts[t.symbol] || 0) + 1; });
  let maxCount = 0;
  let popular = null;
  Object.entries(counts).forEach(([ticker, count]) => {
    if (count > maxCount) { maxCount = count; popular = ticker; }
  });
  return { ticker: popular, count: maxCount };
}
