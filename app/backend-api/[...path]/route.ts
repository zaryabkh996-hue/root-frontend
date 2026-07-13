import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}

async function proxyRequest(request: NextRequest, resolvedParams: { path: string[] }) {
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.search;
  
  // Use INTERNAL_BACKEND_URL for server-side lookup
  const backendBase = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8000/api';
  const apiUrl = `${backendBase}/${path}${searchParams}`;
  
  const token = request.cookies.get('authToken')?.value;
  
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  let body: any = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.arrayBuffer();
    } catch (_) {
      // ignore empty body parsing issues
    }
  }
  
  try {
    const res = await fetch(apiUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });
    
    const resHeaders = new Headers();
    res.headers.forEach((value, key) => {
      resHeaders.set(key, value);
    });
    
    // Check if the response returned an auth token (on login/signup/magic-link verify) and set it as HttpOnly cookie on client
    let resBody: any = null;
    let setCookieToken: string | null = null;
    
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const clone = res.clone();
      try {
        const json = await clone.json();
        if (json?.success && json?.data?.token) {
          setCookieToken = json.data.token;
          // Delete token from returned payload for max security
          delete json.data.token;
          resBody = JSON.stringify(json);
        } else if (json?.success && json?.token) {
          // Fallback for direct token root response (e.g. Magic Link verify)
          setCookieToken = json.token;
          delete json.token;
          resBody = JSON.stringify(json);
        }
      } catch (_) {
        // ignore parse error
      }
    }
    
    const response = new NextResponse(resBody || res.body, {
      status: res.status,
      headers: resHeaders,
    });
    
    if (setCookieToken) {
      response.cookies.set('authToken', setCookieToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    
    // Clear cookie on logout
    if (path === 'logout') {
      response.cookies.set('authToken', '', { maxAge: 0, path: '/' });
    }
    
    return response;
  } catch (error) {
    console.error('BFF Proxy Error:', error);
    return NextResponse.json({ success: false, error: 'Proxy failed to connect to backend' }, { status: 502 });
  }
}
