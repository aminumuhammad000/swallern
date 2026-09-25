import { getPublishedTopicBySlug } from '../lib/content/topics';

async function testLearningEngine() {
  console.log('Testing Core Learning Content Engine...');

  // 1. Fetch "why-is-the-sky-blue"
  const t1 = await getPublishedTopicBySlug('why-is-the-sky-blue');
  console.log('--- Test 1: "why-is-the-sky-blue" ---');
  console.log(`Title: ${t1?.title}`);
  console.log(`Quick Answer: ${t1?.quick_answer ? 'YES' : 'NO'}`);
  console.log(`Explanation length: ${t1?.explanation?.length}`);
  console.log(`Key concepts count: ${t1?.key_concepts?.length}`);
  console.log(`Sources count: ${t1?.sources?.length}`);
  console.log(`Related topics count: ${t1?.related_topics?.length}`);
  console.log(`Has Lesson: ${t1?.has_lesson} (${t1?.lesson?.sections?.length} sections)`);
  console.log(`Has Quiz: ${t1?.has_quiz} (${t1?.quiz?.questions?.length} questions)`);

  // 2. Fetch "how-does-the-internet-work"
  const t2 = await getPublishedTopicBySlug('how-does-the-internet-work');
  console.log('\n--- Test 2: "how-does-the-internet-work" ---');
  console.log(`Title: ${t2?.title}`);
  console.log(`Has Lesson: ${t2?.has_lesson} (${t2?.lesson?.sections?.length} sections)`);
  console.log(`Has Quiz: ${t2?.has_quiz} (${t2?.quiz?.questions?.length} questions)`);

  // 3. Verify Related Topics navigation links
  const relatedNavPass = (t1?.related_topics?.length || 0) > 0 && t1?.related_topics?.every((rt) => typeof rt.slug === 'string' && rt.slug.length > 0);

  const pass1 = !!t1 && t1.has_lesson && t1.has_quiz && (t1.sources?.length || 0) > 0 && (t1.related_topics?.length || 0) > 0;
  const pass2 = !!t2 && t2.has_lesson && t2.has_quiz;

  console.log('\n--- LEARNING ENGINE TEST SUMMARY ---');
  console.log(`Topic 1 (sky-blue) complete content: ${pass1 ? 'PASS' : 'FAIL'}`);
  console.log(`Topic 2 (internet) lesson & quiz: ${pass2 ? 'PASS' : 'FAIL'}`);
  console.log(`Related topics navigation integrity: ${relatedNavPass ? 'PASS' : 'FAIL'}`);

  if (pass1 && pass2 && relatedNavPass) {
    console.log('\nALL LEARNING ENGINE TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('\nLEARNING ENGINE TEST FAILED.');
    process.exit(1);
  }
}

testLearningEngine();
