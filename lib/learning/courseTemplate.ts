/**
 * Swallern Course Schema 1.1 Sample Template and Export Utilities
 * Provides standard course definitions compliant with Swallern bite-sized rules.
 */

export const SCHEMA_1_1_SAMPLE_COURSE = {
  schema_version: '1.1',
  course: {
    title: 'How Bears Prepare for Winter',
    summary: 'Discover how Katmai brown bears enter hyperphagia to rapidly build caloric fat reserves and slow down their metabolism for winter hibernation.',
    learning_objective: 'Understand the physiological, dietary, and behavioral mechanisms behind brown bear hibernation.',
    category: 'Biology',
    difficulty: 'BEGINNER',
    visibility: 'PUBLIC',
  },
  sections: [
    {
      id: 'sec_1',
      title: 'Hyperphagia and Metabolism',
      summary: 'Explore the extraordinary biological drive that forces brown bears to consume tens of thousands of calories each day before snowfall.',
      lessons: [
        {
          id: 'les_1_1',
          title: 'The Science of Hyperphagia',
          content: 'During late summer and autumn, brown bears enter a state called hyperphagia. In this phase, their brain suppresses satiety signals, driving relentless hunger. A single Katmai bear can consume upwards of forty pounds of nutrient-dense salmon every day, packing on four pounds of insulating fat daily.',
          key_concept: 'Hyperphagia is a biological state that suppresses fullness signals to maximize pre-winter fat storage.',
          visual: {
            mode: 'character',
            characterId: 'swallern_bear_v1',
            expression: 'curious',
            pose: 'standing',
          },
          knowledge_check: {
            question: 'What physiological change triggers hyperphagia in autumn bears?',
            options: [
              { text: 'Satiety signals are suppressed to encourage non-stop feeding', is_correct: true },
              { text: 'Metabolism speeds up to burn excess fat immediately', is_correct: false },
              { text: 'Bears stop drinking water to preserve internal salt levels', is_correct: false },
            ],
            explanation: 'Suppressed fullness signals drive bears to eat continuous high-calorie meals.',
          },
        },
        {
          id: 'les_1_2',
          title: 'Nutritional Value of Salmon',
          content: 'Salmon runs provide the highest concentration of healthy fats and protein available in the subarctic wilderness. Bears preferentially target fatty brains and skin from migrating sockeye salmon. This high-calorie intake creates a thick adipose layer essential for metabolic survival during months in the den.',
          key_concept: 'Selective consumption of fish brains and skin maximizes lipid absorption before denning.',
          visual: {
            mode: 'character',
            characterId: 'swallern_bear_v1',
            expression: 'excited',
            pose: 'celebrating',
          },
          knowledge_check: {
            question: 'Why do bears preferentially consume salmon skin and heads?',
            options: [
              { text: 'They contain the highest concentrations of fats and lipids', is_correct: true },
              { text: 'They are easier to digest than fish muscle tissue', is_correct: false },
              { text: 'Fish bones help maintain tooth strength throughout winter', is_correct: false },
            ],
            explanation: 'Lipid-rich fish tissues maximize energy density for hibernation fat storage.',
          },
        },
      ],
    },
    {
      id: 'sec_2',
      title: 'Metabolic Adaptation in Denning',
      summary: 'Learn how bears safely drop their heart rate and recycle metabolic waste without losing muscle density during winter.',
      lessons: [
        {
          id: 'les_2_1',
          title: 'Hibernation Physiology',
          content: 'During hibernation, a bear body temperature drops only slightly, but its heart rate slows from forty beats per minute down to eight. Remarkably, bears recycle urea into amino acids to preserve lean muscle tissue, allowing them to emerge strong in the spring without kidney damage.',
          key_concept: 'Urea nitrogen recycling prevents muscle atrophy and organ failure during winter torpor.',
          visual: {
            mode: 'character',
            characterId: 'swallern_bear_v1',
            expression: 'neutral',
            pose: 'thinking',
          },
          knowledge_check: {
            question: 'How do hibernating bears maintain muscle mass without eating?',
            options: [
              { text: 'They recycle metabolic nitrogen waste back into amino acids', is_correct: true },
              { text: 'They wake up periodically to exercise inside the den', is_correct: false },
              { text: 'They synthesize protein directly from stored water molecules', is_correct: false },
            ],
            explanation: 'Nitrogen recycling enables continuous muscle synthesis without food intake.',
          },
        },
      ],
    },
  ],
  final_quiz: {
    title: 'Bear Hibernation Biology Master Quiz',
    passing_score: 80,
    questions: [
      {
        question: 'What is the primary biological purpose of autumn hyperphagia in brown bears?',
        options: [
          { text: 'Accumulating massive caloric fat reserves before denning', is_correct: true },
          { text: 'Establishing territorial dominance before breeding season', is_correct: false },
          { text: 'Preparing fur coats for shedding in freezing temperatures', is_correct: false },
        ],
        explanation: 'Hyperphagia allows bears to survive up to 6 months without eating.',
      },
      {
        question: 'What enables bears to avoid muscle loss throughout months of torpor?',
        options: [
          { text: 'Recycling urea nitrogen back into muscle-building proteins', is_correct: true },
          { text: 'Consuming stored roots buried deep in the den floor', is_correct: false },
          { text: 'Entering complete cellular cryostasis during blizzards', is_correct: false },
        ],
        explanation: 'Unique biochemical pathways recycle waste nitrogen into essential proteins.',
      },
    ],
  },
  sources: [
    {
      id: 'src_1',
      title: 'Katmai Fat Bear Biology and Hyperphagia Guide',
      url: 'https://www.nps.gov/katm/learn/nature/fat-bear-week.htm',
      publisher: 'National Park Service',
    },
  ],
};

/**
 * Utility to download JSON data as a formatted .json file in the user's browser.
 */
export function downloadCourseJSON(
  data: any,
  filename = 'swallern-sample-course-v1.1.json'
): void {
  if (typeof window === 'undefined') return;

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
