import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/user-topics
 * Admin endpoint: Lists all user-created topics.
 * Optional filter by ?status=PENDING_REVIEW (or DRAFT, APPROVED, CHANGES_REQUESTED, REJECTED).
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const supabase = createAdminClient();

    let query = supabase
      .from('topics')
      .select('*, categories(name, slug)')
      .not('user_id', 'is', null)
      .order('updated_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('approval_status', statusFilter as any);
    }

    const { data: topics, error: topicErr } = await query;

    if (topicErr) throw topicErr;

    // Enhance topics with owner details and section/quiz counts
    const enhancedTopics = await Promise.all(
      (topics || []).map(async (t) => {
        // Fetch user profile or metadata
        let ownerEmail = 'User (' + t.user_id?.slice(0, 8) + ')';
        let ownerName = 'Learner';

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', t.user_id)
            .maybeSingle();

          if (profile?.display_name) ownerName = profile.display_name;

          const { data: authUser } = await supabase.auth.admin.getUserById(t.user_id!);
          if (authUser?.user) {
            ownerEmail = authUser.user.email || ownerEmail;
            ownerName = authUser.user.user_metadata?.full_name || ownerName;
          }
        } catch {
          // Ignore if admin user lookup is disabled or fails
        }

        // Lesson count
        const { count: lessonCount } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', t.id);

        // Quiz count
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', t.id);

        // Source count
        const { count: sourceCount } = await supabase
          .from('topic_sources')
          .select('source_id', { count: 'exact', head: true })
          .eq('topic_id', t.id);

        return {
          ...t,
          owner: {
            id: t.user_id,
            name: ownerName,
            email: ownerEmail,
          },
          counts: {
            lessons: lessonCount || 0,
            quizzes: quizCount || 0,
            sources: sourceCount || 0,
          },
        };
      })
    );

    return NextResponse.json({ topics: enhancedTopics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed fetching user topics' },
      { status: 500 }
    );
  }
}
