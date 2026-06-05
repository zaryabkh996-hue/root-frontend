import { NextResponse } from 'next/server';
import { fetchAllModules, createModule } from '@/app/lib/sanity/sanityClient';

/**
 * GET /api/admin/content
 * Fetch all modules from Sanity, ordered by moduleNumber.
 */
export async function GET() {
  try {
    const modules = await fetchAllModules();
    return NextResponse.json({ success: true, data: modules });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch modules';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/content
 * Create a new module in Sanity with status = pending.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, moduleNumber, subtitle, track, tier, contentType, sensitivity, body: moduleBody, takeaways, resourceUrl } = body;

    if (!title || !track) {
      return NextResponse.json(
        { success: false, error: 'Title and track are required' },
        { status: 400 },
      );
    }

    const created = await createModule({
      title,
      moduleNumber: Number(moduleNumber) || 0,
      subtitle: subtitle || '',
      track,
      tier: tier || 'free',
      contentType: contentType || 'Reading',
      sensitivity: sensitivity || 'low',
      body: moduleBody || '',
      takeaways: takeaways || '',
      resourceUrl: resourceUrl || '',
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
