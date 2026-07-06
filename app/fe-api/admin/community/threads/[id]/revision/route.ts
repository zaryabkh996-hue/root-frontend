import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /fe-api/admin/community/threads/[id]/revision
 * Proxy to Laravel backend to request revision on a pending thread.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const { id } = await context.params;
    const bodyData = await request.json();

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/admin/community/threads/${id}/revision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminCheck.backendToken}`,
      },
      body: JSON.stringify(bodyData),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request thread revision';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
