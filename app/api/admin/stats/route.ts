import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const supabase = createAdminClient();

    // Total topics
    const { count: totalTopics } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true });

    // Published topics
    const { count: publishedTopics } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PUBLISHED', 'UPDATED']);

    // Draft / Review topics
    const { count: draftOrReviewTopics } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .in('status', ['DISCOVERED', 'RESEARCHING', 'DRAFT', 'REVIEW', 'APPROVED', 'REJECTED']);

    // Total categories
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    // Recent activity (last 10 topics)
    const { data: recentTopics } = await supabase
      .from('topics')
      .select('id, slug, title, status, updated_at, category_id')
      .order('updated_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalTopics: totalTopics || 0,
      publishedTopics: publishedTopics || 0,
      draftOrReviewTopics: draftOrReviewTopics || 0,
      categoriesCount: categoriesCount || 0,
      recentActivity: recentTopics || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
