import { NextRequest, NextResponse } from 'next/server';
import { approveStory } from '@/app/lib/sanity/sanityClient';
import { verifyAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /fe-api/admin/stories/[id]/approve
 * Approve story: marks status = approved in database and patches Sanity status.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const { id } = await context.params;
    const bodyData = await request.json();
    const { hubId, hubSlug } = bodyData;

    if (!hubId || !hubSlug) {
      return NextResponse.json({ success: false, error: 'hubId and hubSlug are required.' }, { status: 400 });
    }

    // 1. Get database details to retrieve sanity_id
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const detailRes = await fetch(`${apiUrl}/user/stories/${id}`, {
      headers: {
        'Authorization': `Bearer ${adminCheck.backendToken}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    let sanityId = null;
    if (detailRes.ok) {
      const detail = await detailRes.json();
      sanityId = detail.data?.sanity_id;
    }

    // 2. Approve in Sanity if sanity_id exists
    if (sanityId) {
      try {
        await approveStory(sanityId, hubSlug);
      } catch (sanityError) {
        console.error("[fe-api/admin/stories/approve] Failed to approve story in Sanity:", sanityError);
      }
    }

    // 3. Approve in local database via Laravel (which also creates the community thread)
    const response = await fetch(`${apiUrl}/admin/stories/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminCheck.backendToken}`,
      },
      body: JSON.stringify({
        hub_id: Number(hubId),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend approval failed: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
