import { searchPublishedTopics } from '../lib/content/topics';

async function testSearch() {
  console.log('Testing searchPublishedTopics function...');

  // Test 1: internet
  const res1 = await searchPublishedTopics('internet');
  console.log('--- Test 1: "internet" ---');
  console.log(`Results count: ${res1.results.length}`);
  res1.results.forEach((r) => console.log(`  - [${r.category.name}] ${r.title} (/topics/${r.slug})`));

  // Test 2: artificial intelligence
  const res2 = await searchPublishedTopics('artificial intelligence');
  console.log('--- Test 2: "artificial intelligence" ---');
  console.log(`Results count: ${res2.results.length}`);
  res2.results.forEach((r) => console.log(`  - [${r.category.name}] ${r.title} (/topics/${r.slug})`));

  // Test 3: black holes
  const res3 = await searchPublishedTopics('black holes');
  console.log('--- Test 3: "black holes" ---');
  console.log(`Results count: ${res3.results.length}`);
  res3.results.forEach((r) => console.log(`  - [${r.category.name}] ${r.title} (/topics/${r.slug})`));

  // Test 4: no matching topic query
  const res4 = await searchPublishedTopics('quantum multiverse hyperdrive');
  console.log('--- Test 4: "quantum multiverse hyperdrive" ---');
  console.log(`Results count: ${res4.results.length}`);

  const pass1 = res1.results.length > 0 && res1.results.some((r) => r.slug === 'how-does-the-internet-work');
  const pass2 = res2.results.length > 0 && res2.results.some((r) => r.slug === 'what-is-artificial-intelligence');
  const pass3 = res3.results.length > 0 && res3.results.some((r) => r.slug === 'how-do-black-holes-work');
  const pass4 = res4.results.length === 0;

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`internet: ${pass1 ? 'PASS' : 'FAIL'}`);
  console.log(`artificial intelligence: ${pass2 ? 'PASS' : 'FAIL'}`);
  console.log(`black holes: ${pass3 ? 'PASS' : 'FAIL'}`);
  console.log(`no-result query: ${pass4 ? 'PASS' : 'FAIL'}`);

  if (pass1 && pass2 && pass3 && pass4) {
    console.log('\nALL SEARCH TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('\nSEARCH TEST FAILED.');
    process.exit(1);
  }
}

testSearch();
