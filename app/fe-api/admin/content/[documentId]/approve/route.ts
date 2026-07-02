import { NextResponse } from 'next/server';
import { approveModule } from '@/app/lib/sanity/sanityClient';
import { verifyAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

/**
 * POST /api/admin/content/[documentId]/approve
 * Approve & publish a module — sets status to "published" and records publishedAt.
 */
export async function POST(_request: Request, context: RouteContext) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

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
