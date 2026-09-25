import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, topic_id, lesson_id, section_id, title, summary, estimated_minutes, content, key_takeaway, order_index, sections } = body;

    const supabase = createAdminClient();

    if (action === 'save_lesson') {
      if (!topic_id || !title) {
        return NextResponse.json({ error: 'topic_id and title are required for lesson' }, { status: 400 });
      }

      const lessonPayload = {
        topic_id,
        title: title.trim(),
        summary: summary?.trim() || null,
        estimated_minutes: typeof estimated_minutes === 'number' ? estimated_minutes : 3,
      };

      let lessonData;
      if (lesson_id) {
        const { data, error } = await supabase
          .from('lessons')
          .update(lessonPayload)
          .eq('id', lesson_id)
          .select()
          .single();
        if (error) throw error;
        lessonData = data;
      } else {
        const { data, error } = await supabase
          .from('lessons')
          .insert(lessonPayload)
          .select()
          .single();
        if (error) throw error;
        lessonData = data;
      }

      return NextResponse.json({ lesson: lessonData });
    }

    if (action === 'save_section') {
      if (!lesson_id || !title || !content) {
        return NextResponse.json({ error: 'lesson_id, title, and content are required for section' }, { status: 400 });
      }

      const sectionPayload = {
        lesson_id,
        title: title.trim(),
        content: content.trim(),
        key_takeaway: key_takeaway?.trim() || null,
        order_index: typeof order_index === 'number' ? order_index : 0,
      };

      let sectionData;
      if (section_id) {
        const { data, error } = await supabase
          .from('lesson_sections')
          .update(sectionPayload)
          .eq('id', section_id)
          .select()
          .single();
        if (error) throw error;
        sectionData = data;
      } else {
        const { data, error } = await supabase
          .from('lesson_sections')
          .insert(sectionPayload)
          .select()
          .single();
        if (error) throw error;
        sectionData = data;
      }

      return NextResponse.json({ section: sectionData });
    }

    if (action === 'reorder_sections') {
      if (!Array.isArray(sections)) {
        return NextResponse.json({ error: 'sections array is required' }, { status: 400 });
      }

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.id) {
          await supabase
            .from('lesson_sections')
            .update({ order_index: i })
            .eq('id', sec.id);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'delete_section') {
      if (!section_id) {
        return NextResponse.json({ error: 'section_id is required' }, { status: 400 });
      }

      const { error } = await supabase.from('lesson_sections').delete().eq('id', section_id);
      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    if (action === 'delete_lesson') {
      if (!lesson_id) {
        return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
      }

      const { error } = await supabase.from('lessons').delete().eq('id', lesson_id);
      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed lesson operation' },
      { status: 500 }
    );
  }
}
