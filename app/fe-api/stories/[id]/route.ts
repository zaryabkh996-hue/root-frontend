import { NextRequest, NextResponse } from 'next/server';
import { updateStory } from '@/app/lib/sanity/sanityClient';
import { checkIsAuthenticated } from '@/lib/userTier';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /fe-api/stories/[id]
 * Fetch single story details from the local database.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authCheck = await checkIsAuthenticated(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/user/stories/${id}`, {
      headers: {
        'Authorization': `Bearer ${authCheck.token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ success: false, error: 'Story not found.' }, { status: 404 });
      }
      const errText = await res.text();
      throw new Error(`Backend error: ${errText}`);
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /fe-api/stories/[id]
 * Update and re-submit story draft (resets status to pending, clears revision note).
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const authCheck = await checkIsAuthenticated(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const bodyData = await request.json();
    const { title, body } = bodyData;

    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'Title and body are required.' }, { status: 400 });
    }

    // 1. Fetch details to get sanity_id
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const detailRes = await fetch(`${apiUrl}/user/stories/${id}`, {
      headers: {
        'Authorization': `Bearer ${authCheck.token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    let sanityId = null;
    if (detailRes.ok) {
      const detail = await detailRes.json();
      sanityId = detail.data?.sanity_id;
    }

    // 2. Try updating in Sanity first for CMS mirroring
    if (sanityId) {
      try {
        await updateStory(sanityId, {
          title,
          body,
          status: 'pending',
          revisionNote: '',
        });
      } catch (sanityError) {
        console.error("[fe-api/stories/[id]] Failed to sync story update to Sanity (continuing with DB write):", sanityError);
      }
    }

    // 3. Update in local database via Laravel backend
    const res = await fetch(`${apiUrl}/user/stories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authCheck.token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ title, body }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend storage update failed: ${errText}`);
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
