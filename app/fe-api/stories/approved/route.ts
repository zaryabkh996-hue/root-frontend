import { NextResponse } from 'next/server';

/**
 * GET /fe-api/stories/approved
 * Returns all approved stories from the database.
 */
export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${apiUrl}/stories/approved`, {
      headers: {
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
    const message = error instanceof Error ? error.message : 'Failed to fetch approved stories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
