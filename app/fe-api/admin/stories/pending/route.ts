import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';

/**
 * GET /fe-api/admin/stories/pending
 * Fetch all pending stories from database (admin only).
 */
export async function GET() {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/admin/stories/pending`, {
      headers: {
        'Authorization': `Bearer ${adminCheck.backendToken}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend error: ${errText}`);
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pending stories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
