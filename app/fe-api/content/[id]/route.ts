import { NextRequest, NextResponse } from 'next/server';
import { fetchModuleByIdOrSlug } from '@/app/lib/sanity/sanityClient';
import { getUserTier, TRACK_TO_STAGE_ID, isStageAccessible } from '@/lib/userTier';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /fe-api/content/[id]
 * Returns full module details if the user has access.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: idOrSlug } = await context.params;
    if (!idOrSlug) {
      return NextResponse.json({ success: false, error: 'Module ID is required' }, { status: 400 });
    }

    const module = await fetchModuleByIdOrSlug(idOrSlug);
    if (!module) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 });
    }

    const stageId = TRACK_TO_STAGE_ID[module.track] || 1;
    const userTier = await getUserTier(request);

    if (!isStageAccessible(userTier, stageId)) {
      return NextResponse.json(
        { success: false, error: `Access denied: Upgrade your subscription to access Stage ${stageId}.` },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: module });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
