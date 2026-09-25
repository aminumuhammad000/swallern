import { seedDatabase } from './seed';
import { seedLearningContent } from './seed-content';

async function main() {
  console.log('Starting remote Supabase seed execution...');
  try {
    const result = await seedDatabase();
    console.log(`Core seed completed: ${result.categoriesSeeded} categories, ${result.topicsSeeded} topics.`);

    await seedLearningContent();
    console.log('All learning content (lessons, quizzes, sources, relationships) seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed execution error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
