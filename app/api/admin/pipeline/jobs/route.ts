import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { executeJob } from '@/lib/jobs/runner';

/**
 * GET /api/admin/pipeline/jobs
 * Returns execution history & status for pipeline jobs.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const supabase = createAdminClient();

    const { data: jobs, error } = await supabase
      .from('content_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content jobs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pipeline/jobs
 * Manually re-trigger / execute a content job.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const result = await executeJob(job_id);

    return NextResponse.json({ success: result.success, error: result.error });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Job execution route failed' },
      { status: 500 }
    );
  }
}
