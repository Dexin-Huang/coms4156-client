const BACKEND_URL = 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app';

export async function GET(request, { params }) {
  const appName = request.headers.get('x-app-name') || 'unknown';
  const { ticker } = await params;

  const res = await fetch(`${BACKEND_URL}/predictions/${ticker}`, {
    method: 'GET',
    headers: { 'User-Agent': appName },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
