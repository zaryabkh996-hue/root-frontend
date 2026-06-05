import { NextResponse } from 'next/server';
import { fetchAllModules } from '@/app/lib/sanity/sanityClient';

/**
 * GET /api/content
 * Returns only published modules for user-facing journey pages.
 */
export async function GET() {
  try {
    const modules = await fetchAllModules();
    const published = modules.filter((m) => m.status === 'published');
    return NextResponse.json({ success: true, data: published });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch content';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
