import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';

/**
 * GET /fe-api/admin/community/threads/pending
 * Proxy to Laravel backend to retrieve pending community threads.
 */
export async function GET() {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/admin/community/threads/pending`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminCheck.backendToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pending threads';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
