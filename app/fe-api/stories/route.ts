import { NextRequest, NextResponse } from 'next/server';
import { createStory } from '@/app/lib/sanity/sanityClient';
import { checkIsReturnedTraveller } from '@/lib/userTier';

/**
 * GET /fe-api/stories
 * Lists all stories created by the authenticated Returned Traveller from the local database.
 */
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkIsReturnedTraveller(request);
    if (!authCheck.authorized || !authCheck.user) {
      return NextResponse.json({ success: false, error: 'Forbidden. Returned Traveller status required.' }, { status: 403 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/user/stories`, {
      headers: {
        'Authorization': `Bearer ${authCheck.token}`,
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
    const message = error instanceof Error ? error.message : 'Failed to fetch stories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /fe-api/stories
 * Submit/save a new story draft in both the local database and Sanity.
 */
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkIsReturnedTraveller(request);
    if (!authCheck.authorized || !authCheck.user) {
      return NextResponse.json({ success: false, error: 'Forbidden. Returned Traveller status required.' }, { status: 403 });
    }

    const bodyData = await request.json();
    const { title, body, idempotencyKey } = bodyData;

    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'Title and body are required.' }, { status: 400 });
    }

    const sanityId = `story-${crypto.randomUUID()}`;
    const idKey = idempotencyKey || crypto.randomUUID();

    // 1. Write to local database via Laravel backend in pending state
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/user/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authCheck.token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        sanity_id: sanityId,
        idempotency_key: idKey,
        sync_state: 'pending'
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend storage failed: ${errText}`);
    }

    const result = await res.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create local story draft.');
    }

    const localStory = result.data;
    const localId = localStory.id;

    // If the story has already been successfully synced, return it directly
    if (localStory.sync_state === 'synced') {
      return NextResponse.json(result, { status: 200 });
    }

    // 2. Write to Sanity using createStory with the generated sanityId
    let sanitySuccess = false;
    try {
      await createStory({
        id: sanityId,
        title,
        body,
        author: authCheck.user.name,
        authorId: String(authCheck.user.id),
      });
      sanitySuccess = true;
    } catch (sanityError) {
      console.error("[fe-api/stories] Failed to sync story to Sanity (rolling back local DB):", sanityError);

      // Rollback local database record to prevent orphan
      await fetch(`${apiUrl}/user/stories/${localId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authCheck.token}`,
          'Accept': 'application/json',
        }
      });

      return NextResponse.json({ success: false, error: 'CMS synchronization failed. Creation rolled back.' }, { status: 502 });
    }

    // 3. Mark as synced in Laravel DB
    if (sanitySuccess) {
      const updateRes = await fetch(`${apiUrl}/user/stories/${localId}/sync-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authCheck.token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ sync_state: 'synced' })
      });

      if (updateRes.ok) {
        const updateResult = await updateRes.json();
        return NextResponse.json(updateResult, { status: 201 });
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
