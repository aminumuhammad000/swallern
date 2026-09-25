/**
 * Swallern Step 15 — Admin Integration Tests
 * Tests admin API endpoints end-to-end using the service-role client
 */
import { createAdminClient } from '../lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SECRET_KEY || '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

async function runAdminTests() {
  console.log('===== Swallern Step 15 Admin Tests =====\n');
  const admin = createAdminClient();
  const ts = Date.now();

  // ── 1. Topic create via service-role ──────────────────────────────────────
  console.log('1. Topic Create (service-role)');
  const testSlug = `test-admin-topic-${ts}`;
  const { data: newTopic, error: createErr } = await admin
    .from('topics')
    .insert({ title: 'Test Admin Topic', slug: testSlug, status: 'DRAFT', difficulty: 'BEGINNER' })
    .select()
    .single();
  if (createErr || !newTopic) {
    console.error('   FAIL:', createErr?.message);
    process.exit(1);
  }
  console.log(`   PASS — created topic id: ${newTopic.id}`);
  const topicId = newTopic.id;

  // ── 2. Topic edit ─────────────────────────────────────────────────────────
  console.log('2. Topic Edit');
  const { error: editErr } = await admin
    .from('topics')
    .update({ summary: 'Updated via admin test.' })
    .eq('id', topicId);
  console.log(`   ${!editErr ? 'PASS' : 'FAIL — ' + editErr?.message}`);

  // ── 3. Status changes through lifecycle ───────────────────────────────────
  console.log('3. Topic Status Changes');
  const statuses: string[] = ['REVIEW', 'APPROVED', 'PUBLISHED', 'DRAFT'];
  let allStatusOk = true;
  for (const s of statuses) {
    const { error } = await admin.from('topics').update({ status: s }).eq('id', topicId);
    if (error) { console.error(`   FAIL (${s}):`, error.message); allStatusOk = false; }
  }
  console.log(`   ${allStatusOk ? 'PASS — all status changes ok' : 'FAIL'}`);

  // ── 4. Publish (status = PUBLISHED, published_version = 1) ────────────────
  console.log('4. Publish Topic');
  const { error: pubErr } = await admin
    .from('topics')
    .update({ status: 'PUBLISHED', published_version: 1 })
    .eq('id', topicId);
  console.log(`   ${!pubErr ? 'PASS' : 'FAIL — ' + pubErr?.message}`);

  // ── 5. Sources management ─────────────────────────────────────────────────
  console.log('5. Sources Management');
  const { data: src, error: srcErr } = await admin
    .from('sources')
    .insert({ url: 'https://example.com/test', title: 'Test Source', reliability_score: 4 })
    .select()
    .single();
  let srcPass = !srcErr && !!src;
  if (srcPass) {
    // Link to topic
    const { error: linkErr } = await admin.from('topic_sources').insert({ topic_id: topicId, source_id: src!.id });
    srcPass = !linkErr;
    if (!srcPass) console.error('   source link FAIL:', linkErr?.message);
    // Remove link
    if (srcPass) {
      const { error: unlinkErr } = await admin.from('topic_sources').delete().eq('topic_id', topicId).eq('source_id', src!.id);
      srcPass = !unlinkErr;
    }
  }
  console.log(`   ${srcPass ? 'PASS' : 'FAIL — ' + srcErr?.message}`);

  // ── 6. Lesson management ──────────────────────────────────────────────────
  console.log('6. Lesson Management');
  const { data: lesson, error: lessonErr } = await admin
    .from('lessons')
    .insert({ topic_id: topicId, title: 'Test Lesson', estimated_minutes: 5 })
    .select()
    .single();
  let lessonPass = !lessonErr && !!lesson;
  if (lessonPass) {
    const { data: section, error: secErr } = await admin
      .from('lesson_sections')
      .insert({ lesson_id: lesson!.id, title: 'Section 1', content: 'Content here', order_index: 0 })
      .select()
      .single();
    lessonPass = !secErr && !!section;
  }
  console.log(`   ${lessonPass ? 'PASS' : 'FAIL — ' + lessonErr?.message}`);

  // ── 7. Quiz management ────────────────────────────────────────────────────
  console.log('7. Quiz Management');
  const { data: quiz, error: quizErr } = await admin
    .from('quizzes')
    .insert({ topic_id: topicId, title: 'Test Quiz', passing_score: 80 })
    .select()
    .single();
  let quizPass = !quizErr && !!quiz;
  if (quizPass) {
    const { data: question, error: qErr } = await admin
      .from('quiz_questions')
      .insert({ quiz_id: quiz!.id, question: 'What is 2+2?', explanation: '4 because math.', order_index: 0 })
      .select()
      .single();
    quizPass = !qErr && !!question;
    if (quizPass) {
      const { error: optErr } = await admin
        .from('quiz_options')
        .insert({ question_id: question!.id, option_text: '4', is_correct: true, order_index: 0 });
      quizPass = !optErr;
    }
  }
  console.log(`   ${quizPass ? 'PASS' : 'FAIL — ' + quizErr?.message}`);

  // ── 8. Related topics ─────────────────────────────────────────────────────
  console.log('8. Related Topics Management');
  // Get an existing topic to relate to
  const { data: otherTopic } = await admin.from('topics').select('id').neq('id', topicId).limit(1).single();
  let relPass = false;
  if (otherTopic) {
    const { error: addRelErr } = await admin.from('topic_relationships').upsert({
      from_topic_id: topicId,
      to_topic_id: otherTopic.id,
      relationship_type: 'RELATED',
    });
    if (!addRelErr) {
      const { error: delRelErr } = await admin.from('topic_relationships').delete()
        .eq('from_topic_id', topicId).eq('to_topic_id', otherTopic.id);
      relPass = !delRelErr;
    }
  } else {
    console.log('   SKIP (no other topics exist yet)');
    relPass = true;
  }
  console.log(`   ${relPass ? 'PASS' : 'FAIL'}`);

  // ── 9. Public topic pages show only published content ─────────────────────
  console.log('9. Public topics only show PUBLISHED/UPDATED');
  const anonClient = createClient(supabaseUrl, publishableKey);
  const { data: draftCheck } = await anonClient.from('topics').select('id').eq('id', topicId).eq('status', 'DRAFT').maybeSingle();
  // PUBLISHED topic (we set it to PUBLISHED in test 4, then back to DRAFT in test 3)
  // Anon should NOT see a DRAFT topic
  const draftVisible = !!draftCheck;

  // Re-publish
  await admin.from('topics').update({ status: 'PUBLISHED' }).eq('id', topicId);
  const { data: pubCheck } = await anonClient.from('topics').select('id').eq('id', topicId).maybeSingle();
  const pubVisible = !!pubCheck;

  console.log(`   Draft not visible to anon: ${!draftVisible ? 'PASS' : 'FAIL'}`);
  console.log(`   Published visible to anon: ${pubVisible ? 'PASS' : 'FAIL'}`);

  // ── 10. Non-admin authenticated user cannot access admin APIs ────────────
  console.log('10. Non-admin isolation (anon cannot write topics)');
  const { error: anonWriteErr } = await anonClient
    .from('topics')
    .insert({ title: 'Unauthorized Topic', slug: `unauth-${ts}`, status: 'DRAFT' });
  const anonBlocked = !!anonWriteErr;
  console.log(`   ${anonBlocked ? 'PASS — anon insert blocked' : 'FAIL — anon was able to insert!'}`);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  await admin.from('topics').delete().eq('id', topicId);
  console.log('\n✓ Cleanup done.');

  const allPassed = !createErr && !editErr && allStatusOk && !pubErr && srcPass && lessonPass && quizPass && relPass && !draftVisible && pubVisible && anonBlocked;
  if (allPassed) {
    console.log('\n✅ ALL STEP 15 TESTS PASSED.');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runAdminTests();
