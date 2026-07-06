import { NextRequest, NextResponse } from 'next/server';
import { rejectStory } from '@/app/lib/sanity/sanityClient';
import { verifyAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /fe-api/admin/stories/[id]/revision
 * Reject/request revision on a story draft.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const { id } = await context.params;
    const bodyData = await request.json();
    const { revisionNote } = bodyData;

    if (!revisionNote) {
      return NextResponse.json({ success: false, error: 'revisionNote is required.' }, { status: 400 });
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

    // 2. Reject in Sanity if sanity_id exists
    if (sanityId) {
      try {
        await rejectStory(sanityId, revisionNote);
      } catch (sanityError) {
        console.error("[fe-api/admin/stories/revision] Failed to reject story in Sanity:", sanityError);
      }
    }

    // 3. Reject/Request revision in local database via Laravel
    const response = await fetch(`${apiUrl}/admin/stories/${id}/revision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminCheck.backendToken}`,
      },
      body: JSON.stringify({
        revision_note: revisionNote,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend revision request failed: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request revision on story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
