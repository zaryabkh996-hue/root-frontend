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

    if (module.status !== 'published') {
      return NextResponse.json({ success: false, error: 'Access denied: Module is not published.' }, { status: 403 });
    }

    const stageId = TRACK_TO_STAGE_ID[module.track] || 1;
    const required_tier = stageId === 1 ? 'free' : stageId === 2 ? 'community' : 'preparation';
    const userTier = await getUserTier(request);
    const locked = !isStageAccessible(userTier, stageId);

    if (locked) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Access denied: Upgrade your subscription to access Stage ${stageId}.`,
          locked,
          required_tier
        },
        { status: 403 }
      );
    }

    let resourceUrl = module.resourceUrl;
    if (resourceUrl && resourceUrl.includes('cloudinary.com') && stageId >= 2) {
      const parsed = parseCloudinaryUrl(resourceUrl);
      if (parsed) {
        try {
          const authHeader = request.headers.get('Authorization') || '';
          const apiBase = process.env.INTERNAL_BACKEND_URL ;
          
          const deliveryRes = await fetch(`${apiBase}/cloudinary/delivery-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader,
            },
            body: JSON.stringify({
              public_id: parsed.publicId,
              resource_type: parsed.resourceType,
            }),
          });
          
          if (deliveryRes.ok) {
            const deliveryData = await deliveryRes.json();
            if (deliveryData.success && deliveryData.url) {
              resourceUrl = deliveryData.url;
            }
          }
        } catch (err) {
          console.error('[fe-api/content] Failed to get signed delivery URL:', err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...module,
        locked,
        required_tier,
        ...(resourceUrl && { resourceUrl }),
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function parseCloudinaryUrl(url: string) {
  const match = url.match(/cloudinary\.com\/[^/]+\/([^/]+)\/(upload|authenticated|private)\/(?:v\d+\/)?([^?#]+)/);
  if (!match) return null;
  const [, resourceType, type, publicIdWithExtension] = match;
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
  return { resourceType, type, publicId };
}
