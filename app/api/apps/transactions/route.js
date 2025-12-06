const BACKEND_URL = 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app';

async function parseResponse(res) {
  const text = await res.text();
  if (!text) {
    return { data: { error: 'empty_response' }, status: res.status || 502 };
  }
  try {
    return { data: JSON.parse(text), status: res.status };
  } catch {
    return { data: { error: 'invalid_json', details: text.slice(0, 100) }, status: 502 };
  }
}

export async function POST(request) {
  const appName = request.headers.get('x-app-name') || 'unknown';
  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/apps/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': appName,
      },
      body: JSON.stringify(body),
    });
    const { data, status } = await parseResponse(res);
    return Response.json(data, { status });
  } catch (e) {
    return Response.json({ error: 'service_unavailable', details: e.message }, { status: 503 });
  }
}

export async function GET(request) {
  const appName = request.headers.get('x-app-name') || 'unknown';

  try {
    const res = await fetch(`${BACKEND_URL}/apps/transactions`, {
      method: 'GET',
      headers: { 'User-Agent': appName },
    });
    const { data, status } = await parseResponse(res);
    return Response.json(data, { status });
  } catch (e) {
    return Response.json({ error: 'service_unavailable', details: e.message }, { status: 503 });
  }
}
