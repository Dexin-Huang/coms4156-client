const BACKEND_URL = 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app';

export async function POST(request) {
  const appName = request.headers.get('x-app-name') || 'unknown';
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/apps/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': appName,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function GET(request) {
  const appName = request.headers.get('x-app-name') || 'unknown';

  const res = await fetch(`${BACKEND_URL}/apps/transactions`, {
    method: 'GET',
    headers: { 'User-Agent': appName },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
