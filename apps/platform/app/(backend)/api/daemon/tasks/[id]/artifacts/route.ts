import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/database';
import { agentTaskArtifacts, agentTasks } from '@/database/schemas';
import { and, eq } from 'drizzle-orm';
import { getDaemonRuntime } from '../../../_auth';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

const STORAGE_BUCKET = 'task-artifacts';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let runtime: Awaited<ReturnType<typeof getDaemonRuntime>>;
  try {
    runtime = await getDaemonRuntime(req);
  } catch (errResponse) {
    return errResponse as NextResponse;
  }

  let body: { type?: string; filename?: string; base64Data?: string; capturedAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, filename, base64Data, capturedAt } = body;
  if (!type || !filename || !base64Data) {
    return NextResponse.json({ error: 'type, filename, and base64Data are required' }, { status: 400 });
  }

  const { id: taskId } = await params;

  // Verify task belongs to this runtime
  const [task] = await serverDB
    .select({ id: agentTasks.id, userId: agentTasks.userId })
    .from(agentTasks)
    .where(and(eq(agentTasks.id, taskId), eq(agentTasks.runtimeId, runtime.id)))
    .limit(1);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Decode and upload to Supabase Storage
  const buffer = Buffer.from(base64Data, 'base64');
  const storagePath = `${taskId}/${Date.now()}-${filename}`;

  const supabase = createServiceRoleClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: inferContentType(filename), upsert: false });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return NextResponse.json({ error: 'Failed to upload artifact' }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  const [artifact] = await serverDB
    .insert(agentTaskArtifacts)
    .values({
      taskId,
      userId: task.userId,
      type,
      url: publicUrl,
      filename,
      capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
    })
    .returning();

  return NextResponse.json(artifact, { status: 201 });
}

function inferContentType(filename: string): string {
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.webm')) return 'video/webm';
  if (filename.endsWith('.zip')) return 'application/zip';
  return 'application/octet-stream';
}
