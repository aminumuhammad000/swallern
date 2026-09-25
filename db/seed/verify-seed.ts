import { createAdminClient } from '../../lib/supabase/admin';
import { getPublishedTopicBySlug } from '../../lib/content/topics';

const APPROVED_SLUGS = [
  'why-is-the-sky-blue',
  'how-does-the-internet-work',
  'what-is-artificial-intelligence',
  'how-do-black-holes-work',
  'how-does-memory-work',
  'what-causes-inflation',
  'why-do-we-have-seasons',
  'how-does-gps-work',
  'what-is-evolution',
  'why-do-humans-need-sleep',
];

async function verify() {
  console.log('Starting post-seed verification...');
  const supabase = createAdminClient();

  // 1. Query all topics in database
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, slug, title, status, category_id');

  if (topicsError) {
    console.error('Failed to query topics:', topicsError.message);
    process.exit(1);
  }

  console.log(`Total topics in DB: ${topics?.length}`);

  // Check count
  const countMatch = topics?.length === 10;
  console.log(`Exactly 10 topics: ${countMatch ? 'YES' : 'NO'}`);

  // Check unique slugs & expected topics
  const dbSlugs = (topics || []).map((t) => t.slug);
  const uniqueSlugs = new Set(dbSlugs);
  const isUnique = uniqueSlugs.size === dbSlugs.length;
  console.log(`Unique slugs: ${isUnique ? 'YES' : 'NO'}`);

  const unexpectedTopics = dbSlugs.filter((s) => !APPROVED_SLUGS.includes(s));
  const missingTopics = APPROVED_SLUGS.filter((s) => !dbSlugs.includes(s));
  console.log(`Unexpected topics: ${unexpectedTopics.length > 0 ? unexpectedTopics.join(', ') : 'NONE'}`);
  console.log(`Missing topics: ${missingTopics.length > 0 ? missingTopics.join(', ') : 'NONE'}`);

  // Check lifecycle/status
  const nonPublished = (topics || []).filter((t) => t.status !== 'PUBLISHED' && t.status !== 'UPDATED');
  console.log(`Non-published topics: ${nonPublished.length}`);

  // 2. Query categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, name');

  if (catError) {
    console.error('Failed to query categories:', catError.message);
    process.exit(1);
  }

  console.log(`Total categories in DB: ${categories?.length}`);

  // 3. Verify topic retrieval via getPublishedTopicBySlug
  const retrievedTopic = await getPublishedTopicBySlug('why-is-the-sky-blue');
  const retrievalPass = retrievedTopic !== null && retrievedTopic.title === 'Why is the sky blue?';
  console.log(`Topic retrieval test (why-is-the-sky-blue): ${retrievalPass ? 'PASS' : 'FAIL'}`);

  if (countMatch && isUnique && unexpectedTopics.length === 0 && missingTopics.length === 0 && retrievalPass) {
    console.log('ALL SEED VERIFICATIONS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('VERIFICATION FAILED!');
    process.exit(1);
  }
}

verify();
