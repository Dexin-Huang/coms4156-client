const BACKEND_URL = 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app';

export async function POST(request) {
  const appName = request.headers.get('x-app-name') || 'unknown';

  const res = await fetch(`${BACKEND_URL}/apps`, {
    method: 'POST',
    headers: { 'User-Agent': appName },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function DELETE(request) {
  const appName = request.headers.get('x-app-name') || 'unknown';

  const res = await fetch(`${BACKEND_URL}/apps`, {
    method: 'DELETE',
    headers: { 'User-Agent': appName },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
