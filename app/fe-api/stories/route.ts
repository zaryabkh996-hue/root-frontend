import { NextRequest, NextResponse } from 'next/server';
import { createStory } from '@/app/lib/sanity/sanityClient';
import { checkIsAuthenticated } from '@/lib/userTier';

/**
 * GET /fe-api/stories
 * Lists all stories created by the authenticated Returned Traveller from the local database.
 */
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkIsAuthenticated(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
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
    const authCheck = await checkIsAuthenticated(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const bodyData = await request.json();
    const { title, body } = bodyData;

    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'Title and body are required.' }, { status: 400 });
    }

    // 1. Try to create in Sanity first for CMS mirroring
    let sanityId = null;
    try {
      const created = await createStory({
        title,
        body,
        author: authCheck.user.name,
        authorId: String(authCheck.user.id),
      });
      sanityId = created._id;
    } catch (sanityError) {
      console.error("[fe-api/stories] Failed to sync story to Sanity (continuing with DB write):", sanityError);
    }

    // 2. Write to local database via Laravel backend
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/user/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authCheck.token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ title, body, sanity_id: sanityId }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend storage failed: ${errText}`);
    }

    const result = await res.json();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
