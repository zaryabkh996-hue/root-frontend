import { NextRequest, NextResponse } from 'next/server';
import { fetchAllModules } from '@/app/lib/sanity/sanityClient';
import { getUserTier, TRACK_TO_STAGE_ID, isStageAccessible } from '@/lib/userTier';

/**
 * GET /fe-api/content
 * Returns published modules with body, takeaways, and media stripped for locked stages.
 */
export async function GET(request: NextRequest) {
  try {
    const modules = await fetchAllModules();
    const published = modules.filter((m) => m.status === 'published');
    
    const userTier = await getUserTier(request);

    const filtered = published.map((m) => {
      const stageId = TRACK_TO_STAGE_ID[m.track] || 1;
      if (!isStageAccessible(userTier, stageId)) {
        // Strip body, takeaways, and resourceUrl
        const { body, takeaways, resourceUrl, ...rest } = m;
        return rest;
      }
      return m;
    });

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch content';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
