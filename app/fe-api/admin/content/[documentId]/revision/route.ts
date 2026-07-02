import { NextResponse } from 'next/server';
import { requestRevision } from '@/app/lib/sanity/sanityClient';
import { verifyAdminSession } from '@/lib/adminAuth';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

/**
 * POST /api/admin/content/[documentId]/revision
 * Request a revision on a module — keeps status as "pending" and saves the admin note.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const { documentId } = await context.params;
    const body = await request.json();
    const note = body.note || '';

    await requestRevision(documentId, note);

    return NextResponse.json({
      success: true,
      message: 'Revision requested',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request revision';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
