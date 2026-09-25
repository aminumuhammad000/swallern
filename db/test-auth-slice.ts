import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '../lib/supabase/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vkcouzkkroyoneptaoil.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

async function testAuthSlice() {
  console.log('Testing Step 14 Auth + User Learning Slice...');

  const adminClient = createAdminClient();

  // 1. Create unique test accounts via Admin API (bypasses rate limit)
  const timestamp = Date.now();
  const emailA = `swallern_test_a_${timestamp}@gmail.com`;
  const emailB = `swallern_test_b_${timestamp}@gmail.com`;
  const pass = 'TestPassword123!';

  console.log(`Creating test user A: ${emailA}`);
  const { data: signUpA, error: errA } = await adminClient.auth.admin.createUser({
    email: emailA,
    password: pass,
    email_confirm: true,
  });

  if (errA || !signUpA.user) {
    console.error('Create user A failed:', errA?.message);
    process.exit(1);
  }
  const userA = signUpA.user;

  console.log(`Creating test user B: ${emailB}`);
  const { data: signUpB, error: errB } = await adminClient.auth.admin.createUser({
    email: emailB,
    password: pass,
    email_confirm: true,
  });

  if (errB || !signUpB.user) {
    console.error('Create user B failed:', errB?.message);
    process.exit(1);
  }
  const userB = signUpB.user;

  // 2. Client A session
  const clientA = createClient(supabaseUrl, supabaseKey);
  const { error: loginErrA } = await clientA.auth.signInWithPassword({ email: emailA, password: pass });
  if (loginErrA) {
    console.error('Login A failed:', loginErrA.message);
    process.exit(1);
  }

  // 3. Test Save Topic for User A
  console.log('Testing topic save for User A...');
  const { data: topic } = await clientA.from('topics').select('id').eq('slug', 'why-is-the-sky-blue').single();
  if (!topic) {
    console.error('Topic why-is-the-sky-blue not found');
    process.exit(1);
  }

  const { error: saveErr } = await clientA.from('saved_topics').insert({ user_id: userA.id, topic_id: topic.id });
  const passSave = !saveErr;
  console.log(`Save topic: ${passSave ? 'PASS' : 'FAIL (' + saveErr?.message + ')'}`);

  // 4. Test Lesson Progress for User A
  console.log('Testing lesson progress save for User A...');
  const { data: lesson } = await clientA.from('lessons').select('id').eq('topic_id', topic.id).single();
  let passLesson = false;
  if (lesson) {
    const { error: lErr } = await clientA.from('lesson_progress').upsert({
      user_id: userA.id,
      lesson_id: lesson.id,
      completed: true,
    });
    passLesson = !lErr;
  }
  console.log(`Lesson progress save: ${passLesson ? 'PASS' : 'FAIL'}`);

  // 5. Test Quiz Attempt for User A
  console.log('Testing quiz attempt save for User A...');
  const { data: quiz } = await clientA.from('quizzes').select('id').eq('topic_id', topic.id).single();
  let passQuiz = false;
  if (quiz) {
    const { error: qErr } = await clientA.from('quiz_attempts').insert({
      user_id: userA.id,
      quiz_id: quiz.id,
      score: 100,
      total_questions: 5,
      passed: true,
      answers: [],
    });
    passQuiz = !qErr;
  }
  console.log(`Quiz attempt save: ${passQuiz ? 'PASS' : 'FAIL'}`);

  // 6. Test RLS Isolation: Client B querying User A's saved topics & quiz attempts
  console.log('Testing RLS User Isolation...');
  const clientB = createClient(supabaseUrl, supabaseKey);
  await clientB.auth.signInWithPassword({ email: emailB, password: pass });

  const { data: bSaved } = await clientB.from('saved_topics').select('*').eq('user_id', userA.id);
  const { data: bQuiz } = await clientB.from('quiz_attempts').select('*').eq('user_id', userA.id);

  const passIsolation = (bSaved?.length || 0) === 0 && (bQuiz?.length || 0) === 0;
  console.log(`RLS User Isolation: ${passIsolation ? 'PASS' : 'FAIL'}`);

  if (passSave && passLesson && passQuiz && passIsolation) {
    console.log('\nALL AUTH & USER LEARNING SLICE TESTS PASSED.');
    process.exit(0);
  } else {
    console.error('\nTEST FAILED.');
    process.exit(1);
  }
}

testAuthSlice();
