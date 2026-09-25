import { createAdminClient } from '../../lib/supabase/admin';

export async function seedLearningContent() {
  console.log('Seeding lessons, quizzes, sources, and topic relationships...');
  const supabase = createAdminClient();

  // Fetch all topics map by slug
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, slug, title');

  if (topicsError || !topics) {
    console.error('Failed to fetch topics for learning content seeding:', topicsError);
    return;
  }

  const topicMap = new Map<string, string>();
  topics.forEach((t) => topicMap.set(t.slug, t.id));

  // 1. Seed Topic Relationships (Related topics graph)
  const relationships = [
    { from: 'why-is-the-sky-blue', to: 'why-do-we-have-seasons' },
    { from: 'why-is-the-sky-blue', to: 'how-do-black-holes-work' },
    { from: 'how-does-the-internet-work', to: 'what-is-artificial-intelligence' },
    { from: 'how-does-the-internet-work', to: 'how-does-gps-work' },
    { from: 'what-is-artificial-intelligence', to: 'how-does-the-internet-work' },
    { from: 'what-is-artificial-intelligence', to: 'how-does-memory-work' },
    { from: 'how-do-black-holes-work', to: 'why-is-the-sky-blue' },
    { from: 'how-do-black-holes-work', to: 'why-do-we-have-seasons' },
    { from: 'how-does-memory-work', to: 'why-do-humans-need-sleep' },
    { from: 'how-does-memory-work', to: 'what-is-artificial-intelligence' },
    { from: 'what-causes-inflation', to: 'how-does-the-internet-work' },
    { from: 'why-do-we-have-seasons', to: 'why-is-the-sky-blue' },
    { from: 'how-does-gps-work', to: 'how-does-the-internet-work' },
    { from: 'what-is-evolution', to: 'why-do-humans-need-sleep' },
    { from: 'why-do-humans-need-sleep', to: 'how-does-memory-work' },
  ];

  for (const rel of relationships) {
    const fromId = topicMap.get(rel.from);
    const toId = topicMap.get(rel.to);
    if (fromId && toId) {
      await supabase
        .from('topic_relationships')
        .upsert({ from_topic_id: fromId, to_topic_id: toId, relationship_type: 'RELATED' }, { onConflict: 'from_topic_id,to_topic_id' });
    }
  }

  // 2. Seed Sources & Topic Sources
  const sourcesData = [
    {
      topicSlug: 'why-is-the-sky-blue',
      sources: [
        { title: 'Why is the Sky Blue?', publisher: 'NASA Space Place', url: 'https://spaceplace.nasa.gov/blue-sky/en/', reliability_score: 5 },
        { title: 'Rayleigh Scattering and Atmospheric Physics', publisher: 'NOAA JetStream', url: 'https://www.noaa.gov/jetstream/atmosphere', reliability_score: 5 },
      ],
    },
    {
      topicSlug: 'how-does-the-internet-work',
      sources: [
        { title: 'How the Internet Works', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work', reliability_score: 5 },
        { title: 'Internet Protocol Suite (RFC 1122)', publisher: 'IETF', url: 'https://www.ietf.org/rfc/rfc1122.txt', reliability_score: 5 },
      ],
    },
    {
      topicSlug: 'what-is-artificial-intelligence',
      sources: [
        { title: 'Artificial Intelligence Index Report', publisher: 'Stanford HAI', url: 'https://aiindex.stanford.edu/', reliability_score: 5 },
        { title: 'Introduction to Machine Learning', publisher: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/', reliability_score: 5 },
      ],
    },
    {
      topicSlug: 'how-do-black-holes-work',
      sources: [
        { title: 'Black Hole Science Overview', publisher: 'NASA Astrophysics', url: 'https://science.nasa.gov/astrophysics/focus-areas/black-holes/', reliability_score: 5 },
        { title: 'Event Horizon Telescope First Image of a Black Hole', publisher: 'ESO', url: 'https://www.eso.org/public/news/eso1907/', reliability_score: 5 },
      ],
    },
    {
      topicSlug: 'how-does-memory-work',
      sources: [
        { title: 'Fundamentals of Human Memory and Hippocampal Encoding', publisher: 'Harvard Brain Science', url: 'https://brain.harvard.edu/', reliability_score: 5 },
        { title: 'Brain Basics: Understanding Memory', publisher: 'NINDS / NIH', url: 'https://www.ninds.nih.gov/', reliability_score: 5 },
      ],
    },
  ];

  for (const item of sourcesData) {
    const topicId = topicMap.get(item.topicSlug);
    if (!topicId) continue;

    for (const src of item.sources) {
      const { data: sData, error: sErr } = await supabase
        .from('sources')
        .insert({ title: src.title, publisher: src.publisher, url: src.url, reliability_score: src.reliability_score })
        .select('id')
        .single();

      if (!sErr && sData) {
        await supabase
          .from('topic_sources')
          .upsert({ topic_id: topicId, source_id: sData.id }, { onConflict: 'topic_id,source_id' });
      }
    }
  }

  // 3. Seed Lessons & Lesson Sections
  const lessonsData = [
    {
      topicSlug: 'why-is-the-sky-blue',
      title: 'Understanding Rayleigh Scattering and Light Wavelengths',
      summary: 'Learn how light wavelengths interact with atmospheric particles to turn the daytime sky blue.',
      estimated_minutes: 3,
      sections: [
        {
          title: 'The Visible Light Spectrum',
          content: 'Visible sunlight appears white to our eyes, but it is actually made up of all the colors of the rainbow combined. Light travels in electromagnetic waves. Red light waves are longer and travel in broader cycles, while blue light waves are much shorter and choppy.',
          key_takeaway: 'Blue light has shorter wavelengths than red light.',
          order_index: 0,
        },
        {
          title: 'Atmospheric Gas Collisions',
          content: 'Earth’s atmosphere is composed primarily of nitrogen (78%) and oxygen (21%) gas molecules. Because blue light waves are small and short, they collide frequently with these gas particles, scattering in every direction across the sky in a process called Rayleigh scattering.',
          key_takeaway: 'Nitrogen and oxygen molecules scatter shorter blue wavelengths across the atmosphere.',
          order_index: 1,
        },
        {
          title: 'Why Sunsets Turn Red and Orange',
          content: 'At sunset, the Sun is low on the horizon, forcing sunlight to travel through a much thicker layer of atmosphere before reaching your eyes. Most of the blue light scatters away out of view, allowing the longer red and yellow wavelengths to pass directly to your vision.',
          key_takeaway: 'Sunsets appear red because blue light scatters out during the longer path through the atmosphere.',
          order_index: 2,
        },
      ],
    },
    {
      topicSlug: 'how-does-the-internet-work',
      title: 'Data Packets, DNS, and Global Routing',
      summary: 'Explore how binary data travels around the globe in milliseconds.',
      estimated_minutes: 4,
      sections: [
        {
          title: 'Data Packetization',
          content: 'Before information is sent across the internet, it is divided into small, manageable chunks called data packets. Each packet contains a payload (the data being sent) and a header with source and destination IP addresses.',
          key_takeaway: 'Packets allow large data transfers to move efficiently and independently across shared networks.',
          order_index: 0,
        },
        {
          title: 'The Domain Name System (DNS)',
          content: 'Computers communicate across networks using numerical IP addresses (like 192.0.2.1). DNS acts as the internet’s phonebook, translating human-readable names like swallern.com into IP addresses.',
          key_takeaway: 'DNS translates human-readable web domain names into numerical IP addresses.',
          order_index: 1,
        },
        {
          title: 'Routing and Packet Reassembly',
          content: 'Network routers inspect packet headers and determine the fastest available path over fiber-optic cables. When packets reach their destination, Transmission Control Protocol (TCP) reassembles them into the original file.',
          key_takeaway: 'TCP ensures all packets arrive in order without corruption.',
          order_index: 2,
        },
      ],
    },
    {
      topicSlug: 'what-is-artificial-intelligence',
      title: 'Foundations of AI and Machine Learning',
      summary: 'Understand how machine algorithms simulate cognitive decision-making.',
      estimated_minutes: 3,
      sections: [
        {
          title: 'What Makes Systems Intelligent?',
          content: 'Artificial Intelligence refers to computer systems engineered to perform complex tasks that traditionally require human intelligence, such as visual perception, speech recognition, and decision making.',
          key_takeaway: 'AI simulates human cognitive functions through mathematical algorithms.',
          order_index: 0,
        },
        {
          title: 'Machine Learning from Data',
          content: 'Modern AI relies heavily on machine learning algorithms trained on massive datasets. Instead of hand-coding every rule, engineers train models to discover statistical patterns independently.',
          key_takeaway: 'Machine learning extracts patterns from data without explicit hand-coded rules.',
          order_index: 1,
        },
      ],
    },
    {
      topicSlug: 'how-do-black-holes-work',
      title: 'Gravitational Collapse and Event Horizons',
      summary: 'Discover how massive stars collapse to form regions of infinite density.',
      estimated_minutes: 4,
      sections: [
        {
          title: 'Stellar Death and Core Collapse',
          content: 'When a supermassive star runs out of nuclear fuel, its core can no longer resist gravity. The core collapses inward under colossal force, crushing stellar mass into an infinitely dense singularity.',
          key_takeaway: 'Black holes form when massive stellar cores collapse under their own weight.',
          order_index: 0,
        },
        {
          title: 'The Event Horizon Boundary',
          content: 'Surrounding the singularity is the event horizon—the point of no return where escape velocity exceeds the speed of light. Anything crossing this boundary is trapped forever.',
          key_takeaway: 'Not even light can escape from inside the event horizon.',
          order_index: 1,
        },
      ],
    },
    {
      topicSlug: 'how-does-memory-work',
      title: 'Encoding, Storage, and Memory Consolidation',
      summary: 'Learn how your brain converts experiences into long-term memories.',
      estimated_minutes: 3,
      sections: [
        {
          title: 'Sensory Encoding',
          content: 'Sensory inputs are converted into electrical impulses in the brain. The hippocampus acts as an initial holding area to organize new sensory experiences.',
          key_takeaway: 'Encoding transforms sensory input into neural signals.',
          order_index: 0,
        },
        {
          title: 'Synaptic Consolidation',
          content: 'With repetition and sleep, neural connections strengthen through synaptic plasticity, transferring memories from short-term storage to the cerebral cortex for long-term retention.',
          key_takeaway: 'Memory consolidation stabilizes long-term neural pathways during rest.',
          order_index: 1,
        },
      ],
    },
  ];

  for (const lItem of lessonsData) {
    const topicId = topicMap.get(lItem.topicSlug);
    if (!topicId) continue;

    // Delete previous lesson for idempotency
    await supabase.from('lessons').delete().eq('topic_id', topicId);

    const { data: lessonObj, error: lErr } = await supabase
      .from('lessons')
      .insert({
        topic_id: topicId,
        title: lItem.title,
        summary: lItem.summary,
        estimated_minutes: lItem.estimated_minutes,
      })
      .select('id')
      .single();

    if (!lErr && lessonObj) {
      for (const sec of lItem.sections) {
        await supabase.from('lesson_sections').insert({
          lesson_id: lessonObj.id,
          title: sec.title,
          content: sec.content,
          key_takeaway: sec.key_takeaway,
          order_index: sec.order_index,
        });
      }
    }
  }

  // 4. Seed Quizzes, Questions, and Options
  const quizzesData = [
    {
      topicSlug: 'why-is-the-sky-blue',
      title: 'Why is the Sky Blue? Knowledge Check',
      passing_score: 80,
      questions: [
        {
          question: 'What physical phenomenon causes sunlight to scatter in Earth’s atmosphere?',
          explanation: 'Rayleigh scattering occurs when light collides with atmospheric gas particles much smaller than its wavelength.',
          order_index: 0,
          options: [
            { option_text: 'Mie Scattering', is_correct: false },
            { option_text: 'Rayleigh Scattering', is_correct: true },
            { option_text: 'Refraction through water droplets', is_correct: false },
            { option_text: 'Thermal Infrared Radiation', is_correct: false },
          ],
        },
        {
          question: 'Which visible light wavelength travels in shorter, smaller waves?',
          explanation: 'Blue light waves are shorter and higher frequency compared to red or yellow light.',
          order_index: 1,
          options: [
            { option_text: 'Red Light', is_correct: false },
            { option_text: 'Yellow Light', is_correct: false },
            { option_text: 'Blue Light', is_correct: true },
            { option_text: 'Infrared Light', is_correct: false },
          ],
        },
        {
          question: 'Which atmospheric gases primarily scatter blue light on Earth?',
          explanation: 'Nitrogen (~78%) and Oxygen (~21%) gas molecules make up 99% of air and scatter blue light.',
          order_index: 2,
          options: [
            { option_text: 'Carbon dioxide and methane', is_correct: false },
            { option_text: 'Nitrogen and oxygen', is_correct: true },
            { option_text: 'Helium and hydrogen', is_correct: false },
            { option_text: 'Water vapor and argon', is_correct: false },
          ],
        },
        {
          question: 'Why does the sky turn red and orange during a sunset?',
          explanation: 'Sunlight travels a longer path through the atmosphere at sunset; blue light scatters away leaving red wavelengths.',
          order_index: 3,
          options: [
            { option_text: 'The Sun changes chemical composition at night', is_correct: false },
            { option_text: 'Sunlight passes through a thicker atmosphere layer scattering blue light out', is_correct: true },
            { option_text: 'Cloud coverage absorbs all light except yellow', is_correct: false },
            { option_text: 'Air pressure drops instantly', is_correct: false },
          ],
        },
        {
          question: 'What color light travels in long, lazy waves?',
          explanation: 'Red light has the longest wavelength in the visible light spectrum.',
          order_index: 4,
          options: [
            { option_text: 'Blue light', is_correct: false },
            { option_text: 'Violet light', is_correct: false },
            { option_text: 'Red light', is_correct: true },
            { option_text: 'Ultraviolet light', is_correct: false },
          ],
        },
      ],
    },
    {
      topicSlug: 'how-does-the-internet-work',
      title: 'How the Internet Works Knowledge Check',
      passing_score: 80,
      questions: [
        {
          question: 'What are digital information chunks called when sent across the internet?',
          explanation: 'Information is broken into small data packets before routing across network links.',
          order_index: 0,
          options: [
            { option_text: 'Data streams', is_correct: false },
            { option_text: 'Data packets', is_correct: true },
            { option_text: 'Signal pulses', is_correct: false },
            { option_text: 'Byte frames', is_correct: false },
          ],
        },
        {
          question: 'What is the main role of the Domain Name System (DNS)?',
          explanation: 'DNS translates human-readable domain names (e.g. swallern.com) into numerical IP addresses.',
          order_index: 1,
          options: [
            { option_text: 'Encrypt web traffic', is_correct: false },
            { option_text: 'Translate domain names into numerical IP addresses', is_correct: true },
            { option_text: 'Cool server processors', is_correct: false },
            { option_text: 'Host database tables', is_correct: false },
          ],
        },
        {
          question: 'Which protocol ensures packets are delivered reliably and reassembled in order?',
          explanation: 'TCP (Transmission Control Protocol) manages connection reliability and packet sequence.',
          order_index: 2,
          options: [
            { option_text: 'UDP', is_correct: false },
            { option_text: 'TCP', is_correct: true },
            { option_text: 'FTP', is_correct: false },
            { option_text: 'DNS', is_correct: false },
          ],
        },
        {
          question: 'What hardware device inspects packet headers and forwards them across networks?',
          explanation: 'Routers inspect destination IP addresses and direct packets along optimal network paths.',
          order_index: 3,
          options: [
            { option_text: 'Modem', is_correct: false },
            { option_text: 'Router', is_correct: true },
            { option_text: 'Display Monitor', is_correct: false },
            { option_text: 'Hard Drive', is_correct: false },
          ],
        },
        {
          question: 'What unique address identifies every device connected to the internet?',
          explanation: 'An IP (Internet Protocol) address uniquely identifies devices on an IP network.',
          order_index: 4,
          options: [
            { option_text: 'MAC code', is_correct: false },
            { option_text: 'IP Address', is_correct: true },
            { option_text: 'Serial number', is_correct: false },
            { option_text: 'DNS Record', is_correct: false },
          ],
        },
      ],
    },
    {
      topicSlug: 'what-is-artificial-intelligence',
      title: 'Artificial Intelligence Knowledge Check',
      passing_score: 80,
      questions: [
        {
          question: 'What is Artificial Intelligence?',
          explanation: 'AI refers to software systems engineered to simulate human cognitive functions.',
          order_index: 0,
          options: [
            { option_text: 'Physical robots only', is_correct: false },
            { option_text: 'The simulation of human intelligence by machine systems', is_correct: true },
            { option_text: 'Computer monitor manufacturing', is_correct: false },
            { option_text: 'Manual spreadsheet calculation', is_correct: false },
          ],
        },
        {
          question: 'What branch of AI enables algorithms to learn patterns directly from data?',
          explanation: 'Machine Learning trains models on large datasets to make predictions without explicit rules.',
          order_index: 1,
          options: [
            { option_text: 'Machine Learning', is_correct: true },
            { option_text: 'Quantum Hardware', is_correct: false },
            { option_text: 'Static Scripting', is_correct: false },
            { option_text: 'Database Normalization', is_correct: false },
          ],
        },
        {
          question: 'What computing architecture is inspired by biological brain neurons?',
          explanation: 'Neural networks use interconnected node layers to process input features.',
          order_index: 2,
          options: [
            { option_text: 'Logic Gates', is_correct: false },
            { option_text: 'Neural Networks', is_correct: true },
            { option_text: 'Fiber Optic Switches', is_correct: false },
            { option_text: 'Binary Registers', is_correct: false },
          ],
        },
        {
          question: 'Which AI field focuses on enabling computers to understand human text and speech?',
          explanation: 'Natural Language Processing (NLP) handles human language comprehension and generation.',
          order_index: 3,
          options: [
            { option_text: 'Computer Vision', is_correct: false },
            { option_text: 'Natural Language Processing (NLP)', is_correct: true },
            { option_text: 'Robotic Motion Control', is_correct: false },
            { option_text: 'Database Indexing', is_correct: false },
          ],
        },
        {
          question: 'Why are large datasets crucial for modern AI models?',
          explanation: 'Statistical patterns and correlations become clear when models learn from extensive data.',
          order_index: 4,
          options: [
            { option_text: 'They take up hard drive space', is_correct: false },
            { option_text: 'They provide the statistical patterns needed to train model weights', is_correct: true },
            { option_text: 'They replace internet cables', is_correct: false },
            { option_text: 'They slow down network traffic', is_correct: false },
          ],
        },
      ],
    },
    {
      topicSlug: 'how-do-black-holes-work',
      title: 'Black Holes Knowledge Check',
      passing_score: 80,
      questions: [
        {
          question: 'How do stellar black holes form?',
          explanation: 'Massive star cores collapse under their own gravity when nuclear fuel expires.',
          order_index: 0,
          options: [
            { option_text: 'When planets collide', is_correct: false },
            { option_text: 'When massive stellar cores collapse under intense gravity', is_correct: true },
            { option_text: 'When comets enter Earth atmosphere', is_correct: false },
            { option_text: 'When solar flares erupt', is_correct: false },
          ],
        },
        {
          question: 'What is the boundary surrounding a black hole beyond which nothing can escape?',
          explanation: 'The event horizon marks the boundary where escape velocity exceeds light speed.',
          order_index: 1,
          options: [
            { option_text: 'Accretion Disk', is_correct: false },
            { option_text: 'Event Horizon', is_correct: true },
            { option_text: 'Corona', is_correct: false },
            { option_text: 'Photon Sphere', is_correct: false },
          ],
        },
        {
          question: 'What is the infinitely dense point at the center of a black hole called?',
          explanation: 'A singularity is the central point of infinite density where gravitational curvature peaks.',
          order_index: 2,
          options: [
            { option_text: 'Nebula', is_correct: false },
            { option_text: 'Singularity', is_correct: true },
            { option_text: 'Quasar', is_correct: false },
            { option_text: 'Supernova', is_correct: false },
          ],
        },
        {
          question: 'Can visible light escape from inside the event horizon?',
          explanation: 'The escape velocity inside the event horizon exceeds the speed of light.',
          order_index: 3,
          options: [
            { option_text: 'Yes, easily', is_correct: false },
            { option_text: 'No, light cannot escape', is_correct: true },
            { option_text: 'Only red light', is_correct: false },
            { option_text: 'Only ultraviolet light', is_correct: false },
          ],
        },
        {
          question: 'How do astronomers detect invisible black holes?',
          explanation: 'Astronomers detect black holes by observing gravitational effects on nearby stars and gas disks.',
          order_index: 4,
          options: [
            { option_text: 'By taking flashlight photos', is_correct: false },
            { option_text: 'By observing gravitational effects on surrounding stars and gas', is_correct: true },
            { option_text: 'They cannot be detected at all', is_correct: false },
            { option_text: 'By checking radio towers on Earth', is_correct: false },
          ],
        },
      ],
    },
    {
      topicSlug: 'how-does-memory-work',
      title: 'Memory Knowledge Check',
      passing_score: 80,
      questions: [
        {
          question: 'What is the initial stage of processing sensory input into brain signals called?',
          explanation: 'Encoding transforms sensory perception into neural signals stored in working memory.',
          order_index: 0,
          options: [
            { option_text: 'Retrieval', is_correct: false },
            { option_text: 'Encoding', is_correct: true },
            { option_text: 'Forgetting', is_correct: false },
            { option_text: 'Replication', is_correct: false },
          ],
        },
        {
          question: 'Which brain structure plays a key role in consolidating new long-term memories?',
          explanation: 'The hippocampus is essential for consolidating short-term experiences into long-term storage.',
          order_index: 1,
          options: [
            { option_text: 'Cerebellum', is_correct: false },
            { option_text: 'Hippocampus', is_correct: true },
            { option_text: 'Brainstem', is_correct: false },
            { option_text: 'Spinal Cord', is_correct: false },
          ],
        },
        {
          question: 'What process strengthens neural connections through repeated activation?',
          explanation: 'Synaptic plasticity allows brain circuits to adapt and strengthen memory pathways.',
          order_index: 2,
          options: [
            { option_text: 'Synaptic Plasticity', is_correct: true },
            { option_text: 'Cell Division', is_correct: false },
            { option_text: 'Blood Clotting', is_correct: false },
            { option_text: 'Muscle Contraction', is_correct: false },
          ],
        },
        {
          question: 'What is memory retrieval?',
          explanation: 'Retrieval is reactivating neural circuits to recall stored information.',
          order_index: 3,
          options: [
            { option_text: 'Deleting old memories', is_correct: false },
            { option_text: 'Reactivating stored neural circuits to recall information', is_correct: true },
            { option_text: 'Sleeping 8 hours', is_correct: false },
            { option_text: 'Forming new synapses only', is_correct: false },
          ],
        },
        {
          question: 'Why is sleep important for long-term memory?',
          explanation: 'Sleep facilitates memory consolidation, stabilizing synaptic connections made during the day.',
          order_index: 4,
          options: [
            { option_text: 'Sleep erases all memories', is_correct: false },
            { option_text: 'Sleep consolidates short-term memories into long-term storage', is_correct: true },
            { option_text: 'Sleep turns off neural signals completely', is_correct: false },
            { option_text: 'Sleep is unrelated to memory', is_correct: false },
          ],
        },
      ],
    },
  ];

  for (const qItem of quizzesData) {
    const topicId = topicMap.get(qItem.topicSlug);
    if (!topicId) continue;

    // Delete existing quiz for idempotency
    await supabase.from('quizzes').delete().eq('topic_id', topicId);

    const { data: qObj, error: qErr } = await supabase
      .from('quizzes')
      .insert({
        topic_id: topicId,
        title: qItem.title,
        passing_score: qItem.passing_score,
      })
      .select('id')
      .single();

    if (!qErr && qObj) {
      for (const quest of qItem.questions) {
        const { data: questObj, error: questErr } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: qObj.id,
            question: quest.question,
            explanation: quest.explanation,
            order_index: quest.order_index,
          })
          .select('id')
          .single();

        if (!questErr && questObj) {
          for (let optIdx = 0; optIdx < quest.options.length; optIdx++) {
            const opt = quest.options[optIdx];
            await supabase.from('quiz_options').insert({
              question_id: questObj.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              order_index: optIdx,
            });
          }
        }
      }
    }
  }

  console.log('Learning content seeding complete!');
}
