import { getPublishedCategories, getExploreTopics } from '../lib/content/topics';

async function testExplore() {
  console.log('Testing Explore & Trending data layer...');

  // 1. Categories
  const categories = await getPublishedCategories();
  console.log(`Fetched categories count: ${categories.length}`);

  // 2. All topics (/explore)
  const allResult = await getExploreTopics();
  console.log(`--- Test /explore (all topics) ---`);
  console.log(`Topics count: ${allResult.topics.length}`);

  // 3. Science category (/explore?category=science)
  const scienceResult = await getExploreTopics('science');
  console.log(`--- Test /explore?category=science ---`);
  console.log(`Active category: ${scienceResult.activeCategory?.name}`);
  console.log(`Science topics count: ${scienceResult.topics.length}`);
  scienceResult.topics.forEach((t) => console.log(`  - ${t.title} [${t.category.name}]`));

  // 4. Technology category (/explore?category=technology)
  const techResult = await getExploreTopics('technology');
  console.log(`--- Test /explore?category=technology ---`);
  console.log(`Active category: ${techResult.activeCategory?.name}`);
  console.log(`Tech topics count: ${techResult.topics.length}`);
  techResult.topics.forEach((t) => console.log(`  - ${t.title} [${t.category.name}]`));

  // 5. Unknown category (/explore?category=nonexistentcategory)
  const unknownResult = await getExploreTopics('nonexistentcategory');
  console.log(`--- Test /explore?category=nonexistentcategory ---`);
  console.log(`Unknown category flag: ${unknownResult.isUnknownCategory}`);

  const passCategories = categories.length >= 10;
  const passAllTopics = allResult.topics.length === 10;
  const passScience = scienceResult.topics.length > 0 && scienceResult.topics.every((t) => t.category.slug === 'science');
  const passTech = techResult.topics.length > 0 && techResult.topics.every((t) => t.category.slug === 'technology');
  const passUnknown = unknownResult.isUnknownCategory === true;

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Categories count >= 10: ${passCategories ? 'PASS' : 'FAIL'}`);
  console.log(`/explore (10 topics): ${passAllTopics ? 'PASS' : 'FAIL'}`);
  console.log(`/explore?category=science: ${passScience ? 'PASS' : 'FAIL'}`);
  console.log(`/explore?category=technology: ${passTech ? 'PASS' : 'FAIL'}`);
  console.log(`unknown category handling: ${passUnknown ? 'PASS' : 'FAIL'}`);

  if (passCategories && passAllTopics && passScience && passTech && passUnknown) {
    console.log('\nALL EXPLORE TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('\nEXPLORE TEST FAILED.');
    process.exit(1);
  }
}

testExplore();
