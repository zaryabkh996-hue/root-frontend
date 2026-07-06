import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /fe-api/admin/community/threads/[id]/approve
 * Proxy to Laravel backend to approve a pending thread.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const { id } = await context.params;
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/admin/community/threads/${id}/approve`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminCheck.backendToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve thread';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
