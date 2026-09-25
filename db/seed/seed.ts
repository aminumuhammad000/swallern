import { createAdminClient } from '../../lib/supabase/admin';

/**
 * Swallern Database Seed Script
 * 
 * Populates initial approved categories and the first 10 seed topics
 * from the Swallern Pre-Implementation specification.
 * 
 * Safe to execute multiple times (idempotent upserts).
 */

export const INITIAL_CATEGORIES = [
  { name: 'Science', slug: 'science', description: 'Explore natural phenomena, physics, chemistry, and scientific discoveries.' },
  { name: 'Technology', slug: 'technology', description: 'Computing, artificial intelligence, networks, and engineering.' },
  { name: 'Space', slug: 'space', description: 'Cosmology, stars, black holes, astrophysics, and space exploration.' },
  { name: 'History', slug: 'history', description: 'Pivotal events, ancient civilizations, revolutions, and world history.' },
  { name: 'Mathematics', slug: 'mathematics', description: 'Numbers, logic, geometry, patterns, and mathematical concepts.' },
  { name: 'Psychology', slug: 'psychology', description: 'Human cognition, memory, behavior, habits, and perception.' },
  { name: 'Economics', slug: 'economics', description: 'Markets, financial systems, money, trade, and economic principles.' },
  { name: 'Nature', slug: 'nature', description: 'Ecosystems, animal behavior, botany, and biodiversity.' },
  { name: 'Health & Biology', slug: 'health-biology', description: 'Human physiology, genetics, immunology, and medicine.' },
  { name: 'Culture & Society', slug: 'culture-society', description: 'Languages, traditions, human societies, and social structures.' },
];

export const FIRST_10_TOPICS = [
  {
    title: 'Why is the sky blue?',
    slug: 'why-is-the-sky-blue',
    categorySlug: 'science',
    difficulty: 'BEGINNER' as const,
    summary: 'Sunlight scatters in Earth’s atmosphere through Rayleigh scattering, dispersing shorter blue wavelengths more than other colors.',
    quickAnswer: 'The sky is blue because gases in Earth’s atmosphere scatter sunlight in all directions, and blue light is scattered more than other colors because it travels in smaller, shorter waves.',
    explanation: `Sunlight reaches Earth's atmosphere and is scattered in all directions by all the gases and particles in the air. 

Light travels in waves. Some light travels in short, choppy waves, while other light travels in long, lazy waves. Blue light waves are shorter and smaller than red light waves.

Because blue light travels as shorter, smaller waves, it collides with gas molecules in the atmosphere and scatters in every direction more easily than red, yellow, or green light. When we look up at the sky during the day, we see this scattered blue light filling the atmosphere.

At sunset, sunlight passes through a thicker layer of atmosphere. The blue light gets scattered away from our line of sight, allowing longer red and yellow wavelengths to pass directly to our eyes.`,
    keyConcepts: [
      {
        title: 'Rayleigh Scattering',
        description: 'The scattering of light by particles much smaller than the wavelength of the light, which affects shorter blue wavelengths most strongly.',
      },
      {
        title: 'Light Spectrum',
        description: 'Visible sunlight is composed of all colors of the rainbow, each traveling at different wavelengths.',
      },
      {
        title: 'Atmospheric Gases',
        description: 'Nitrogen and oxygen in Earth’s atmosphere act as the scattering medium for incoming solar radiation.',
      },
    ],
  },
  {
    title: 'How does the internet work?',
    slug: 'how-does-the-internet-work',
    categorySlug: 'technology',
    difficulty: 'BEGINNER' as const,
    summary: 'The internet is a global network of computers connected through standardized protocols that route data in packets across fiber optic cables, routers, and switches.',
    quickAnswer: 'The internet works by breaking information into tiny data packets, labeling them with IP addresses, and routing them across global interconnected networks using TCP/IP protocols.',
    explanation: `The internet is not a single physical entity, but a global network of networks. When you request a webpage or send a message, your device communicates with a local server, which forwards your request through a chain of interconnected networks.

Data sent across the internet is divided into small pieces called packets. Each packet contains a payload (the data being sent) and a header containing destination and source IP addresses. Routers along the path inspect packet headers and determine the fastest available path across fiber-optic cables, satellite links, and wireless towers.

When all packets arrive at their destination, the receiving device uses the Transmission Control Protocol (TCP) to reassemble them in the correct order, requesting any missing packets to ensure complete delivery.`,
    keyConcepts: [
      {
        title: 'Packet Switching',
        description: 'Breaking large messages into small data chunks that travel independently through network routes before reassembling at the destination.',
      },
      {
        title: 'IP Addressing & DNS',
        description: 'The Domain Name System translates human-readable names (like swallern.com) into numerical IP addresses that direct network traffic.',
      },
      {
        title: 'TCP/IP Protocol Suite',
        description: 'The standard set of communication protocols that establish connections, verify data integrity, and route internet traffic globally.',
      },
    ],
  },
  {
    title: 'What is artificial intelligence?',
    slug: 'what-is-artificial-intelligence',
    categorySlug: 'technology',
    difficulty: 'BEGINNER' as const,
    summary: 'Artificial intelligence (AI) refers to computer systems designed to perform tasks that typically require human cognition, such as reasoning, learning, and pattern recognition.',
    quickAnswer: 'Artificial intelligence is the simulation of human intelligence by machine systems using algorithms, data, and statistical models.',
    explanation: `Artificial intelligence enables machines to process information, recognize patterns, solve problems, and adapt to new inputs.

Modern AI systems rely heavily on machine learning algorithms trained on large datasets. These systems identify statistical relationships to make predictions, generate content, or automate decision-making.

Applications of AI range from natural language processing and computer vision to autonomous vehicles and medical diagnostics.`,
    keyConcepts: [
      {
        title: 'Machine Learning',
        description: 'A subset of AI where algorithms learn patterns from data without being explicitly programmed for every rule.',
      },
      {
        title: 'Neural Networks',
        description: 'Computing systems inspired by biological neural networks that process inputs across interconnected node layers.',
      },
      {
        title: 'Natural Language Processing',
        description: 'The branch of AI focusing on enabling computers to understand, interpret, and generate human speech and text.',
      },
    ],
  },
  {
    title: 'How do black holes work?',
    slug: 'how-do-black-holes-work',
    categorySlug: 'space',
    difficulty: 'BEGINNER' as const,
    summary: 'Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape from inside their event horizon.',
    quickAnswer: 'Black holes form when massive stars collapse under their own gravity, creating an extremely dense region where gravitational pull prevents anything from escaping.',
    explanation: `When a massive star exhausts its nuclear fuel, it can no longer support its own weight against gravity. The core collapses inward, concentrating immense mass into an infinitely small point known as a singularity.

Surrounding the singularity is the event horizon—the boundary beyond which the escape velocity exceeds the speed of light. Anything crossing this boundary is pulled inexorably toward the center.

Though invisible, black holes are detected by observing their gravitational influence on nearby stars, surrounding gas disks, and emitted gravitational waves.`,
    keyConcepts: [
      {
        title: 'Event Horizon',
        description: 'The boundary surrounding a black hole beyond which nothing, including light, can escape.',
      },
      {
        title: 'Singularity',
        description: 'A point of infinite density at the center of a black hole where current laws of physics break down.',
      },
      {
        title: 'Gravitational Pull',
        description: 'The extreme spacetime curvature created by concentrated mass attracting all nearby matter and energy.',
      },
    ],
  },
  {
    title: 'How does memory work?',
    slug: 'how-does-memory-work',
    categorySlug: 'psychology',
    difficulty: 'BEGINNER' as const,
    summary: 'Memory is the brain’s process of encoding, storing, and retrieving information through neural connections and synaptic pathways.',
    quickAnswer: 'Memory works in three key stages: encoding (processing sensory input), storage (maintaining information over time), and retrieval (accessing stored information).',
    explanation: `When you experience something, your brain converts sensory input into neural signals in a process called encoding.

Information is initially held in short-term memory before being consolidated into long-term memory through synaptic plasticity and structural changes in neural networks, primarily involving the hippocampus.

Retrieval occurs when neural pathways associated with a specific memory are reactivated, bringing stored information back into conscious awareness.`,
    keyConcepts: [
      {
        title: 'Encoding',
        description: 'The initial processing of sensory information that transforms it into a construct the brain can store.',
      },
      {
        title: 'Consolidation & Storage',
        description: 'The process by which short-term memories are stabilized into long-term neural connections.',
      },
      {
        title: 'Retrieval',
        description: 'Reactivating neural circuits to recall previously stored information into working memory.',
      },
    ],
  },
  {
    title: 'What causes inflation?',
    slug: 'what-causes-inflation',
    categorySlug: 'economics',
    difficulty: 'BEGINNER' as const,
    summary: 'Inflation occurs when the general price level of goods and services rises, eroding purchasing power over time.',
    quickAnswer: 'Inflation is primarily caused by demand-pull factors, cost-push pressures, and increases in the overall money supply.',
    explanation: `Inflation represents a sustained increase in prices across an economy over time, reducing the purchasing power of money.

Demand-pull inflation occurs when aggregate demand for goods and services outstrips available supply. Cost-push inflation happens when production costs rise (such as raw materials or wages), forcing businesses to increase prices.

Additionally, when central banks expand the money supply faster than economic growth, each monetary unit loses relative value.`,
    keyConcepts: [
      {
        title: 'Demand-Pull Inflation',
        description: 'Price increases driven by consumer demand exceeding total production capacity.',
      },
      {
        title: 'Cost-Push Inflation',
        description: 'Price hikes resulting from rising production costs passed on to end consumers.',
      },
      {
        title: 'Monetary Supply',
        description: 'The total amount of money circulating in an economy, regulated by central bank policies.',
      },
    ],
  },
  {
    title: 'Why do we have seasons?',
    slug: 'why-do-we-have-seasons',
    categorySlug: 'science',
    difficulty: 'BEGINNER' as const,
    summary: 'Seasons are caused by Earth’s 23.5-degree axial tilt as it orbits around the Sun.',
    quickAnswer: 'We have seasons because Earth’s axis is tilted, causing different hemispheres to receive varying amounts of direct sunlight throughout its year-long orbit.',
    explanation: `Earth orbits the Sun once every 365.25 days while spinning on an axis tilted at approximately 23.5 degrees relative to its orbital plane.

When the Northern Hemisphere is tilted toward the Sun, it receives direct sunlight at a high angle and experiences longer daylight hours, resulting in summer. At the same time, the Southern Hemisphere is tilted away, experiencing winter.

Six months later, the orientation relative to the Sun reverses. The distance between Earth and the Sun has minimal effect on seasons compared to axial tilt.`,
    keyConcepts: [
      {
        title: 'Axial Tilt',
        description: 'The 23.5-degree angle of Earth’s rotational axis relative to its orbital plane around the Sun.',
      },
      {
        title: 'Solar Angle',
        description: 'The angle at which sunlight strikes Earth’s surface, dictating heat intensity per unit area.',
      },
      {
        title: 'Orbital Motion',
        description: 'Earth’s annual path around the Sun that alters hemisphere orientation relative to solar radiation.',
      },
    ],
  },
  {
    title: 'How does GPS work?',
    slug: 'how-does-gps-work',
    categorySlug: 'technology',
    difficulty: 'BEGINNER' as const,
    summary: 'Global Positioning System (GPS) uses satellite signals and trilateration to calculate precise location coordinates anywhere on Earth.',
    quickAnswer: 'GPS receivers determine location by measuring the time it takes for microwave signals from at least four satellites to arrive.',
    explanation: `The Global Positioning System consists of a constellation of over 30 satellites orbiting Earth at an altitude of approximately 20,000 kilometers.

Each satellite continuously broadcasts radio signals containing precise atomic clock time stamps and orbital position data. A GPS receiver receives signals from multiple satellites simultaneously.

By calculating signal propagation delays, the receiver determines its distance from each satellite. Using trilateration with at least four satellites, it computes precise latitude, longitude, altitude, and time.`,
    keyConcepts: [
      {
        title: 'Trilateration',
        description: 'A mathematical method of calculating position by measuring distances from known reference points.',
      },
      {
        title: 'Satellite Constellation',
        description: 'A network of orbiting satellites positioned to ensure line-of-sight visibility globally.',
      },
      {
        title: 'Atomic Time Sync',
        description: 'High-precision clocks aboard satellites that enable microsecond signal timing measurements.',
      },
    ],
  },
  {
    title: 'What is evolution?',
    slug: 'what-is-evolution',
    categorySlug: 'science',
    difficulty: 'BEGINNER' as const,
    summary: 'Evolution is the change in inherited characteristics of biological populations over successive generations.',
    quickAnswer: 'Evolution occurs primarily through natural selection, where organisms with advantageous traits are more likely to survive and reproduce.',
    explanation: `Biological evolution describes how species change over time through modifications in genetic material passed from parents to offspring.

Random genetic mutations create diversity within a population. Environmental pressures favor individuals with traits best suited for survival and reproduction, a process known as natural selection.

Over long periods, accumulation of small genetic changes can lead to speciation, explaining the vast diversity of life on Earth from common ancestors.`,
    keyConcepts: [
      {
        title: 'Natural Selection',
        description: 'The mechanism by which advantageous heritable traits become more common in successive generations.',
      },
      {
        title: 'Genetic Variation',
        description: 'Differences in DNA sequences among individuals that provide raw material for evolutionary change.',
      },
      {
        title: 'Common Descent',
        description: 'The scientific principle that all living organisms share a shared evolutionary lineage.',
      },
    ],
  },
  {
    title: 'Why do humans need sleep?',
    slug: 'why-do-humans-need-sleep',
    categorySlug: 'health-biology',
    difficulty: 'BEGINNER' as const,
    summary: 'Sleep is essential for brain function, tissue repair, memory consolidation, immune system maintenance, and metabolic regulation.',
    quickAnswer: 'Humans need sleep to allow the brain to clear metabolic waste, consolidate memories, repair cellular damage, and restore body energy.',
    explanation: `Sleep is a vital physiological process required for physical health and cognitive performance.

During deep sleep, the brain’s glymphatic system clears cellular waste products that accumulate during waking hours, including proteins linked to neurodegenerative conditions.

Sleep is also crucial for memory consolidation, allowing the brain to organize and store new information while pruning unnecessary synaptic connections.`,
    keyConcepts: [
      {
        title: 'Glymphatic Clearance',
        description: 'The brain’s waste clearance mechanism active primarily during sleep to remove metabolic byproducts.',
      },
      {
        title: 'Memory Consolidation',
        description: 'The stabilization and integration of short-term experiences into long-term memory storage.',
      },
      {
        title: 'Restorative Functions',
        description: 'Cellular repair, tissue growth, hormone release, and immune system strengthening during sleep.',
      },
    ],
  },
];

/**
 * Executes the seed process using Supabase Admin Client.
 * Safe to execute multiple times (idempotent upserts).
 */
export async function seedDatabase(): Promise<{ categoriesSeeded: number; topicsSeeded: number }> {
  const supabase = createAdminClient();

  // 1. Seed Categories
  const categoryMap = new Map<string, string>();
  let categoriesSeeded = 0;

  for (const cat of INITIAL_CATEGORIES) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name: cat.name, slug: cat.slug, description: cat.description }, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (!error && data) {
      categoryMap.set(data.slug, data.id);
      categoriesSeeded++;
    }
  }

  // 2. Seed Topics & Topic Versions
  let topicsSeeded = 0;

  for (const topic of FIRST_10_TOPICS) {
    const categoryId = categoryMap.get(topic.categorySlug) || null;

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .upsert(
        {
          title: topic.title,
          slug: topic.slug,
          category_id: categoryId,
          difficulty: topic.difficulty,
          status: 'PUBLISHED',
          summary: topic.summary,
          published_version: 1,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();

    if (!topicError && topicData) {
      // Seed Version 1
      await supabase.from('topic_versions').upsert(
        {
          topic_id: topicData.id,
          version: 1,
          quick_answer: topic.quickAnswer,
          explanation: topic.explanation,
          key_concepts: JSON.parse(JSON.stringify(topic.keyConcepts)),
        },
        { onConflict: 'topic_id,version' }
      );

      topicsSeeded++;
    }
  }

  return { categoriesSeeded, topicsSeeded };
}
