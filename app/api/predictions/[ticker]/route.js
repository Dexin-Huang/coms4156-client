const BACKEND_URL = 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app';

export async function GET(request, { params }) {
  const appName = request.headers.get('x-app-name') || 'unknown';
  const { ticker } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/predictions/${ticker}`, {
      method: 'GET',
      headers: { 'User-Agent': appName },
    });

    const text = await res.text();
    if (!text) {
      return Response.json({ error: 'empty_response' }, { status: res.status || 502 });
    }

    try {
      const data = JSON.parse(text);
      return Response.json(data, { status: res.status });
    } catch {
      return Response.json({ error: 'invalid_json', details: text.slice(0, 100) }, { status: 502 });
    }
  } catch (e) {
    return Response.json({ error: 'service_unavailable', details: e.message }, { status: 503 });
  }
}
