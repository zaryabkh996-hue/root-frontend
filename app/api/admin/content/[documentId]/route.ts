import { NextResponse } from 'next/server';
import { fetchModuleById, updateModule, deleteModule } from '@/app/lib/sanity/sanityClient';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

/**
 * GET /api/admin/content/[documentId]
 * Fetch a single module by Sanity _id.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const doc = await fetchModuleById(documentId);

    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/content/[documentId]
 * Update an existing module's fields.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const body = await request.json();

    const { title, moduleNumber, subtitle, track, tier, contentType, sensitivity, body: moduleBody, takeaways, resourceUrl, approvalStep } = body;

    await updateModule(documentId, {
      ...(title && { title }),
      ...(moduleNumber !== undefined && { moduleNumber: Number(moduleNumber) }),
      ...(subtitle !== undefined && { subtitle }),
      ...(track && { track }),
      ...(tier && { tier }),
      ...(contentType && { contentType }),
      ...(sensitivity && { sensitivity }),
      ...(moduleBody !== undefined && { body: moduleBody }),
      ...(takeaways !== undefined && { takeaways }),
      ...(resourceUrl !== undefined && { resourceUrl }),
      ...(approvalStep !== undefined && { approvalStep: Number(approvalStep) }),
    });

    return NextResponse.json({ success: true, message: 'Module updated' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/content/[documentId]
 * Delete a module from Sanity.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    await deleteModule(documentId);
    return NextResponse.json({ success: true, message: 'Module deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete module';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
