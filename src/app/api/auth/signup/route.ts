import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendBaseUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8000';

    const targetUrl = `${backendBaseUrl.replace(/\/+$/, '')}/api/auth/signup`;

    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => ({}));

    const setCookieHeader = backendResponse.headers.get('set-cookie');
    const headers = new Headers();
    if (setCookieHeader) {
      headers.set('set-cookie', setCookieHeader);
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers,
    });
  } catch (error: unknown) {
    console.error('Signup proxy error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Authentication service unavailable';
    return NextResponse.json(
      {
        message:
          'Unable to connect to the backend server on port 8000. Please ensure the backend server is running.',
        error: errorMessage,
      },
      { status: 502 }
    );
  }
}
