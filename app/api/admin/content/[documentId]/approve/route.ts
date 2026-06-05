import { NextResponse } from 'next/server';
import { approveModule } from '@/app/lib/sanity/sanityClient';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

/**
 * POST /api/admin/content/[documentId]/approve
 * Approve & publish a module — sets status to "published" and records publishedAt.
 */
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    await approveModule(documentId);

    return NextResponse.json({
      success: true,
      message: 'Module approved and published',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
