/**
 * Swallern Visual System v1 — Master Category Taxonomy & Domain Registry
 * Defines 30 canonical master categories with nested, extensible domain models.
 * Decouples domain depth so categories can have customized hierarchy structures.
 */

export interface VisualSubdomain {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tags: string[];
}

export interface VisualDomain {
  id: string;
  categoryId: string;
  name: string;
  displayName: string;
  description: string;
  tags: string[];
  subdomains?: VisualSubdomain[];
}

export interface VisualCategory {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  primaryColor: string;
  accentColor: string;
  domains: VisualDomain[];
  tags: string[];
  order: number;
}

/**
 * Master List of 30 Visual Categories with Hierarchical Domains
 */
export const MASTER_VISUAL_CATEGORIES: Record<string, VisualCategory> = {
  technology: {
    id: 'technology',
    name: 'Technology',
    displayName: 'Technology & Computing',
    description: 'Hardware, software, computational systems, digital infrastructure, and digital tools',
    icon: '💻',
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    order: 1,
    tags: ['tech', 'computers', 'digital', 'hardware', 'software', 'internet'],
    domains: [
      { id: 'computers', categoryId: 'technology', name: 'Computers', displayName: 'Computers & Devices', description: 'Personal computing, laptops, tablets, and peripherals', tags: ['pc', 'laptop', 'desktop', 'screen'] },
      { id: 'hardware', categoryId: 'technology', name: 'Hardware', displayName: 'Computer Hardware', description: 'Internal components, processors, circuit boards, memory, and storage', tags: ['chip', 'motherboard', 'ram', 'cpu'] },
      { id: 'software', categoryId: 'technology', name: 'Software', displayName: 'Software Systems', description: 'Operating systems, applications, development tools, and user interfaces', tags: ['os', 'apps', 'code', 'ui'] },
      { id: 'programming', categoryId: 'technology', name: 'Programming', displayName: 'Programming & Coding', description: 'Algorithms, source code, data structures, and developer workflows', tags: ['coding', 'syntax', 'logic', 'functions'] },
      { id: 'internet', categoryId: 'technology', name: 'Internet', displayName: 'The Internet', description: 'Web protocols, browser architecture, web pages, and online communication', tags: ['web', 'http', 'browser', 'online'] },
      { id: 'networking', categoryId: 'technology', name: 'Networking', displayName: 'Computer Networks', description: 'Routers, switches, wireless signals, packets, LAN/WAN, and topologies', tags: ['router', 'wifi', 'switch', 'packets', 'ethernet'] },
      { id: 'cybersecurity', categoryId: 'technology', name: 'Cybersecurity', displayName: 'Cybersecurity & Privacy', description: 'Encryption, firewalls, threat defense, authentication, and protocols', tags: ['security', 'firewall', 'encryption', 'lock', 'keys'] },
      { id: 'cloud_computing', categoryId: 'technology', name: 'Cloud Computing', displayName: 'Cloud Infrastructure', description: 'Distributed servers, data centers, containers, and microservices', tags: ['cloud', 'server', 'storage', 'datacenter'] },
      { id: 'robotics', categoryId: 'technology', name: 'Robotics', displayName: 'Robotics & Automation', description: 'Robotic arms, autonomous drones, sensors, and actuators', tags: ['robot', 'automation', 'drone', 'actuator'] },
      { id: 'electronics', categoryId: 'technology', name: 'Electronics', displayName: 'Electronics & Circuits', description: 'Resistors, capacitors, microcontrollers, and soldering', tags: ['circuits', 'pcb', 'solder', 'signals'] },
      { id: 'telecommunications', categoryId: 'technology', name: 'Telecommunications', displayName: 'Telecommunications', description: 'Cellular towers, satellite links, fiber optics, and transmission', tags: ['telecom', 'satellite', '5g', 'fiber'] },
    ],
  },

  artificial_intelligence: {
    id: 'artificial_intelligence',
    name: 'Artificial Intelligence',
    displayName: 'AI & Data Science',
    description: 'Neural networks, machine learning models, generative AI, datasets, and AI safety',
    icon: '🧠',
    primaryColor: '#8B5CF6',
    accentColor: '#6D28D9',
    order: 2,
    tags: ['ai', 'machine_learning', 'neural_networks', 'deep_learning', 'data'],
    domains: [
      { id: 'machine_learning', categoryId: 'artificial_intelligence', name: 'Machine Learning', displayName: 'Machine Learning', description: 'Supervised, unsupervised, reinforcement learning, and training', tags: ['ml', 'training', 'weights', 'loss'] },
      { id: 'deep_learning', categoryId: 'artificial_intelligence', name: 'Deep Learning', displayName: 'Deep Neural Networks', description: 'Multi-layer perceptrons, convolutional layers, transformers, and attention', tags: ['neural_network', 'layers', 'transformer', 'attention'] },
      { id: 'generative_ai', categoryId: 'artificial_intelligence', name: 'Generative AI', displayName: 'Generative AI', description: 'Large language models, diffusion image generators, and prompt engineering', tags: ['llm', 'diffusion', 'prompt', 'generation'] },
      { id: 'computer_vision', categoryId: 'artificial_intelligence', name: 'Computer Vision', displayName: 'Computer Vision', description: 'Image recognition, object detection, segmentation, and feature extraction', tags: ['vision', 'detection', 'bounding_box', 'pixels'] },
      { id: 'natural_language_processing', categoryId: 'artificial_intelligence', name: 'Natural Language Processing', displayName: 'Natural Language Processing', description: 'Tokenization, syntax parsing, semantic embeddings, and language models', tags: ['nlp', 'tokens', 'embeddings', 'semantics'] },
      { id: 'speech', categoryId: 'artificial_intelligence', name: 'Speech', displayName: 'Speech & Audio AI', description: 'Voice synthesis, speech recognition, spectrograms, and audio processing', tags: ['speech', 'voice', 'spectrogram', 'tts', 'stt'] },
      { id: 'ai_agents', categoryId: 'artificial_intelligence', name: 'AI Agents', displayName: 'Autonomous AI Agents', description: 'Agentic workflows, tool use, reasoning loops, and multi-agent coordination', tags: ['agent', 'tools', 'planning', 'autonomy'] },
      { id: 'datasets', categoryId: 'artificial_intelligence', name: 'Datasets', displayName: 'Datasets & Data Engineering', description: 'Data labeling, feature vectors, data cleaning, and validation splits', tags: ['dataset', 'labels', 'features', 'vectors'] },
      { id: 'algorithms', categoryId: 'artificial_intelligence', name: 'Algorithms', displayName: 'Optimization & Algorithms', description: 'Gradient descent, backpropagation, clustering, and decision trees', tags: ['gradient_descent', 'backprop', 'clustering'] },
      { id: 'ai_safety', categoryId: 'artificial_intelligence', name: 'AI Safety', displayName: 'AI Safety & Alignment', description: 'Alignment, guardrails, interpretability, red-teaming, and ethics', tags: ['safety', 'alignment', 'guardrails', 'ethics'] },
    ],
  },

  science: {
    id: 'science',
    name: 'Science',
    displayName: 'Physical & Natural Sciences',
    description: 'Physics, chemistry, biology, scientific inquiry, experiments, and research methodologies',
    icon: '🔬',
    primaryColor: '#0D9488',
    accentColor: '#0F766E',
    order: 3,
    tags: ['science', 'physics', 'chemistry', 'biology', 'laboratory', 'experiment'],
    domains: [
      { id: 'physics', categoryId: 'science', name: 'Physics', displayName: 'Physics', description: 'Forces, thermodynamics, optics, electromagnetism, and quantum mechanics', tags: ['forces', 'gravity', 'optics', 'energy'] },
      { id: 'chemistry', categoryId: 'science', name: 'Chemistry', displayName: 'Chemistry', description: 'Molecules, chemical reactions, periodic table, solutions, and bonds', tags: ['molecules', 'reactions', 'elements', 'beakers'] },
      { id: 'biology', categoryId: 'science', name: 'Biology', displayName: 'Biology & Life Science', description: 'Cell biology, genetics, physiology, microbiology, and organisms', tags: ['cells', 'dna', 'microbiology', 'genes'] },
      { id: 'laboratory', categoryId: 'science', name: 'Laboratory', displayName: 'Laboratory & Research', description: 'Microscopes, test tubes, safety goggles, and measurement tools', tags: ['lab', 'microscope', 'test_tube', 'pipette'] },
      { id: 'scientific_method', categoryId: 'science', name: 'Scientific Method', displayName: 'Scientific Method', description: 'Hypothesis, experimentation, data collection, and peer review', tags: ['hypothesis', 'experiment', 'analysis', 'conclusion'] },
    ],
  },

  nature_environment: {
    id: 'nature_environment',
    name: 'Nature & Environment',
    displayName: 'Nature & Ecology',
    description: 'Ecosystems, flora, fauna, climate, geology, conservation, and planetary habitats',
    icon: '🌿',
    primaryColor: '#10B981',
    accentColor: '#047857',
    order: 4,
    tags: ['nature', 'environment', 'ecology', 'wildlife', 'forest', 'climate'],
    domains: [
      { id: 'wildlife', categoryId: 'nature_environment', name: 'Wildlife', displayName: 'Wildlife & Animals', description: 'Mammals, birds, reptiles, aquatic life, and animal behavior', tags: ['animals', 'bear', 'birds', 'fish'] },
      { id: 'botany', categoryId: 'nature_environment', name: 'Botany', displayName: 'Botany & Plants', description: 'Trees, flowers, photosynthesis, plant structure, and roots', tags: ['plants', 'trees', 'leaves', 'roots'] },
      { id: 'ecosystems', categoryId: 'nature_environment', name: 'Ecosystems', displayName: 'Ecosystems & Habitats', description: 'Forests, oceans, deserts, wetlands, and food webs', tags: ['forest', 'ocean', 'desert', 'food_web'] },
      { id: 'climate', categoryId: 'nature_environment', name: 'Climate', displayName: 'Climate & Meteorology', description: 'Weather systems, rain cycles, atmosphere, and climate change', tags: ['weather', 'clouds', 'rain', 'temperature'] },
      { id: 'conservation', categoryId: 'nature_environment', name: 'Conservation', displayName: 'Conservation & Sustainability', description: 'Reforestation, biodiversity preservation, and renewable resources', tags: ['conservation', 'recycle', 'protection'] },
    ],
  },

  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    displayName: 'Agriculture & Food Production',
    description: 'Crop farming, soil science, irrigation, livestock, harvesting, and agricultural technology',
    icon: '🌾',
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    order: 5,
    tags: ['agriculture', 'farming', 'crops', 'soil', 'irrigation', 'harvest'],
    domains: [
      { id: 'crops', categoryId: 'agriculture', name: 'Crops', displayName: 'Crops & Cultivation', description: 'Grains, vegetables, fruits, germination, and crop rotations', tags: ['crops', 'wheat', 'corn', 'seeds'] },
      { id: 'soil', categoryId: 'agriculture', name: 'Soil', displayName: 'Soil Science', description: 'Soil composition, nutrients, hummus, pH balance, and soil microbiome', tags: ['soil', 'nutrients', 'compost', 'earth'] },
      { id: 'irrigation', categoryId: 'agriculture', name: 'Irrigation', displayName: 'Irrigation & Water Systems', description: 'Drip irrigation, sprinklers, canals, water pumps, and conservation', tags: ['irrigation', 'water_pipe', 'sprinkler', 'pump'] },
      { id: 'livestock', categoryId: 'agriculture', name: 'Livestock', displayName: 'Livestock & Animal Husbandry', description: 'Cattle, sheep, poultry, pasturing, and veterinary care', tags: ['livestock', 'cattle', 'pasture', 'barn'] },
      { id: 'machinery', categoryId: 'agriculture', name: 'Machinery', displayName: 'Agricultural Machinery', description: 'Tractors, plows, combine harvesters, and seed drills', tags: ['tractor', 'plow', 'harvester', 'equipment'] },
      { id: 'greenhouse', categoryId: 'agriculture', name: 'Greenhouse', displayName: 'Greenhouse & Controlled Environments', description: 'Hydroponics, vertical farming, climate control, and nurseries', tags: ['greenhouse', 'hydroponics', 'vertical_farm'] },
      { id: 'agtech', categoryId: 'agriculture', name: 'Agricultural Technology', displayName: 'AgTech & Precision Farming', description: 'Drone crop monitoring, smart soil sensors, and automated harvesting', tags: ['agtech', 'drone', 'sensors', 'precision_farming'] },
    ],
  },

  business: {
    id: 'business',
    name: 'Business',
    displayName: 'Business & Management',
    description: 'Enterprise operations, organizational management, strategy, sales, supply chain, and marketing',
    icon: '💼',
    primaryColor: '#0F172A',
    accentColor: '#334155',
    order: 6,
    tags: ['business', 'management', 'office', 'enterprise', 'commerce'],
    domains: [
      { id: 'management', categoryId: 'business', name: 'Management', displayName: 'Management & Strategy', description: 'Leadership, organization charts, team alignment, and planning', tags: ['management', 'leadership', 'strategy', 'team'] },
      { id: 'operations', categoryId: 'business', name: 'Operations', displayName: 'Business Operations', description: 'Workflows, logistics, supply chain, quality assurance, and facilities', tags: ['operations', 'logistics', 'warehouse', 'supply_chain'] },
      { id: 'marketing', categoryId: 'business', name: 'Marketing', displayName: 'Marketing & Brand', description: 'Customer discovery, campaigns, funnel metrics, and branding', tags: ['marketing', 'brand', 'funnel', 'advertising'] },
      { id: 'sales_commerce', categoryId: 'business', name: 'Commerce', displayName: 'Sales & Commerce', description: 'Retail stores, e-commerce, negotiations, and contracts', tags: ['store', 'retail', 'sales', 'contracts'] },
      { id: 'workplace', categoryId: 'business', name: 'Workplace', displayName: 'Workplace & Collaboration', description: 'Office desks, meeting rooms, presentations, and remote work', tags: ['office', 'desk', 'meeting', 'collaboration'] },
    ],
  },

  finance_economics: {
    id: 'finance_economics',
    name: 'Finance & Economics',
    displayName: 'Finance & Economics',
    description: 'Banking, investment, currency, macroeconomics, market dynamics, and personal finance',
    icon: '📊',
    primaryColor: '#10B981',
    accentColor: '#059669',
    order: 7,
    tags: ['finance', 'economics', 'money', 'banking', 'markets', 'investment'],
    domains: [
      { id: 'banking', categoryId: 'finance_economics', name: 'Banking', displayName: 'Banking & Transactions', description: 'Bank branches, transaction processing, credit cards, and digital wallets', tags: ['bank', 'money', 'credit_card', 'vault'] },
      { id: 'markets', categoryId: 'finance_economics', name: 'Markets', displayName: 'Markets & Investing', description: 'Stock exchanges, price charts, portfolios, bonds, and commodities', tags: ['stocks', 'chart', 'investment', 'portfolio'] },
      { id: 'macroeconomics', categoryId: 'finance_economics', name: 'Macroeconomics', displayName: 'Macroeconomics', description: 'Supply & demand, inflation, GDP, central banks, and monetary policy', tags: ['supply_demand', 'inflation', 'gdp', 'economy'] },
      { id: 'personal_finance', categoryId: 'finance_economics', name: 'Personal Finance', displayName: 'Personal Finance', description: 'Budgeting, saving, piggy banks, taxes, and financial literacy', tags: ['budget', 'savings', 'piggy_bank'] },
    ],
  },

  health: {
    id: 'health',
    name: 'Health',
    displayName: 'Health & Wellness',
    description: 'Human wellness, nutrition, physical fitness, mental health, and healthy lifestyle habits',
    icon: '❤️',
    primaryColor: '#EF4444',
    accentColor: '#DC2626',
    order: 8,
    tags: ['health', 'wellness', 'nutrition', 'fitness', 'lifestyle'],
    domains: [
      { id: 'nutrition', categoryId: 'health', name: 'Nutrition', displayName: 'Nutrition & Diet', description: 'Vitamins, balanced meals, hydration, and nutritional energy', tags: ['food', 'vitamins', 'water', 'diet'] },
      { id: 'fitness', categoryId: 'health', name: 'Fitness', displayName: 'Physical Fitness', description: 'Exercise, cardio, muscle conditioning, and active lifestyle', tags: ['exercise', 'running', 'gym', 'stretching'] },
      { id: 'mental_health', categoryId: 'health', name: 'Mental Health', displayName: 'Mental & Emotional Well-being', description: 'Mindfulness, stress management, sleep quality, and emotional balance', tags: ['mindfulness', 'meditation', 'sleep', 'balance'] },
    ],
  },

  medicine: {
    id: 'medicine',
    name: 'Medicine',
    displayName: 'Medicine & Healthcare',
    description: 'Clinical care, medical diagnosis, pharmaceuticals, human anatomy, and hospital systems',
    icon: '🩺',
    primaryColor: '#0284C7',
    accentColor: '#0369A1',
    order: 9,
    tags: ['medicine', 'hospital', 'doctor', 'clinic', 'anatomy', 'diagnosis'],
    domains: [
      { id: 'clinical_care', categoryId: 'medicine', name: 'Clinical Care', displayName: 'Clinical Care & Hospitals', description: 'Hospitals, clinics, patient rooms, and emergency response', tags: ['hospital', 'clinic', 'bed', 'stethoscope'] },
      { id: 'anatomy_pathology', categoryId: 'medicine', name: 'Anatomy', displayName: 'Human Anatomy & Physiology', description: 'Organs, circulatory system, skeletal structure, and nervous system', tags: ['organs', 'heart', 'bones', 'brain'] },
      { id: 'pharmacy', categoryId: 'medicine', name: 'Pharmaceuticals', displayName: 'Pharmaceuticals & Treatments', description: 'Medications, vaccines, dosages, and therapeutic delivery', tags: ['pills', 'vaccine', 'syringe', 'prescription'] },
    ],
  },

  engineering: {
    id: 'engineering',
    name: 'Engineering',
    displayName: 'Engineering & Applied Science',
    description: 'Mechanical, civil, electrical, aerospace, and chemical engineering systems',
    icon: '⚙️',
    primaryColor: '#F97316',
    accentColor: '#EA580C',
    order: 10,
    tags: ['engineering', 'mechanics', 'gears', 'structures', 'applied_science'],
    domains: [
      { id: 'mechanical', categoryId: 'engineering', name: 'Mechanical', displayName: 'Mechanical Engineering', description: 'Gears, pulleys, engines, pneumatic systems, and thermodynamics', tags: ['gears', 'engine', 'pulley', 'mechanisms'] },
      { id: 'civil', categoryId: 'engineering', name: 'Civil Engineering', displayName: 'Civil & Structural Engineering', description: 'Bridges, dams, tunnels, foundation loads, and structural trusses', tags: ['bridge', 'dam', 'tunnel', 'truss'] },
      { id: 'electrical', categoryId: 'engineering', name: 'Electrical', displayName: 'Electrical Engineering', description: 'Power grids, transformers, circuits, high-voltage, and generators', tags: ['power', 'transformer', 'wires', 'generator'] },
    ],
  },

  energy: {
    id: 'energy',
    name: 'Energy',
    displayName: 'Energy & Power Systems',
    description: 'Renewable energy, solar, wind, hydroelectric, nuclear, power generation, and storage',
    icon: '⚡',
    primaryColor: '#F59E0B',
    accentColor: '#B45309',
    order: 11,
    tags: ['energy', 'power', 'solar', 'wind', 'electricity', 'battery'],
    domains: [
      { id: 'renewable', categoryId: 'energy', name: 'Renewable Energy', displayName: 'Renewable Energy', description: 'Solar panels, wind turbines, geothermal, and hydroelectric dams', tags: ['solar_panel', 'wind_turbine', 'hydro', 'green_energy'] },
      { id: 'storage_grid', categoryId: 'energy', name: 'Power Grid & Storage', displayName: 'Storage & Grid Distribution', description: 'Battery banks, power lines, substations, and smart grids', tags: ['battery', 'power_line', 'substation', 'grid'] },
    ],
  },

  transportation: {
    id: 'transportation',
    name: 'Transportation',
    displayName: 'Transportation & Mobility',
    description: 'Automotive, railway, aviation, maritime shipping, public transit, and logistics routes',
    icon: '🚀',
    primaryColor: '#3B82F6',
    accentColor: '#1E40AF',
    order: 12,
    tags: ['transport', 'vehicles', 'transit', 'cars', 'trains', 'planes'],
    domains: [
      { id: 'road', categoryId: 'transportation', name: 'Road Vehicles', displayName: 'Automotive & Road Mobility', description: 'Electric vehicles, bicycles, buses, trucks, and highways', tags: ['car', 'bicycle', 'bus', 'truck'] },
      { id: 'rail_air_sea', categoryId: 'transportation', name: 'Transit Systems', displayName: 'Rail, Aviation & Maritime', description: 'High-speed trains, airplanes, cargo ships, and airports', tags: ['train', 'airplane', 'ship', 'port'] },
    ],
  },

  space: {
    id: 'space',
    name: 'Space',
    displayName: 'Space & Astronomy',
    description: 'Planets, stars, galaxies, space exploration, satellites, rockets, and cosmological physics',
    icon: '🪐',
    primaryColor: '#6366F1',
    accentColor: '#4338CA',
    order: 13,
    tags: ['space', 'astronomy', 'planets', 'stars', 'rockets', 'cosmos'],
    domains: [
      { id: 'astronomy', categoryId: 'space', name: 'Astronomy', displayName: 'Celestial Astronomy', description: 'Stars, planets, orbits, black holes, nebulas, and constellations', tags: ['planet', 'star', 'galaxy', 'telescope'] },
      { id: 'spaceflight', categoryId: 'space', name: 'Spaceflight', displayName: 'Space Exploration', description: 'Rockets, space stations, lunar rovers, astronaut suits, and satellites', tags: ['rocket', 'space_station', 'rover', 'satellite'] },
    ],
  },

  geography: {
    id: 'geography',
    name: 'Geography',
    displayName: 'Geography & Earth Science',
    description: 'Cartography, landforms, continents, climate zones, oceans, and geopolitical territories',
    icon: '🗺️',
    primaryColor: '#0D9488',
    accentColor: '#115E59',
    order: 14,
    tags: ['geography', 'maps', 'earth', 'landforms', 'continents'],
    domains: [
      { id: 'physical_geography', categoryId: 'geography', name: 'Physical Geography', displayName: 'Physical Geography & Landforms', description: 'Mountains, rivers, valleys, islands, volcanos, and tectonic plates', tags: ['mountains', 'rivers', 'islands', 'volcano'] },
      { id: 'cartography', categoryId: 'geography', name: 'Cartography', displayName: 'Maps & Cartography', description: 'Globes, map projections, compass rose, GPS coordinates, and legends', tags: ['map', 'globe', 'compass', 'coordinates'] },
    ],
  },

  history: {
    id: 'history',
    name: 'History',
    displayName: 'History & Civilizations',
    description: 'Ancient civilizations, historical eras, revolutions, artifacts, archives, and timeline milestones',
    icon: '🏛️',
    primaryColor: '#B45309',
    accentColor: '#78350F',
    order: 15,
    tags: ['history', 'civilization', 'ancient', 'timeline', 'monuments'],
    domains: [
      { id: 'ancient_eras', categoryId: 'history', name: 'Ancient Eras', displayName: 'Ancient Civilizations', description: 'Egypt, Greece, Rome, Mesopotamia, pyramids, and ancient artifacts', tags: ['pyramids', 'ruins', 'scrolls', 'monuments'] },
      { id: 'modern_history', categoryId: 'history', name: 'Modern History', displayName: 'Modern & Global History', description: 'Industrial revolution, exploration voyages, and landmark discoveries', tags: ['timeline', 'archives', 'inventions'] },
    ],
  },

  government_civics: {
    id: 'government_civics',
    name: 'Government & Civics',
    displayName: 'Government & Civics',
    description: 'Democracy, legal systems, public policy, voting, rights, international relations, and civic duties',
    icon: '⚖️',
    primaryColor: '#1E293B',
    accentColor: '#0F172A',
    order: 16,
    tags: ['civics', 'government', 'law', 'democracy', 'policy'],
    domains: [
      { id: 'civic_systems', categoryId: 'government_civics', name: 'Civic Systems', displayName: 'Civic Systems & Law', description: 'Parliaments, courtrooms, voting booths, constitutions, and treaties', tags: ['court', 'law', 'voting', 'constitution'] },
    ],
  },

  education: {
    id: 'education',
    name: 'Education',
    displayName: 'Education & Pedagogy',
    description: 'Learning strategies, classroom setups, textbooks, pedagogical models, and student growth',
    icon: '📚',
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    order: 17,
    tags: ['education', 'learning', 'classroom', 'school', 'books', 'teaching'],
    domains: [
      { id: 'classroom_learning', categoryId: 'education', name: 'Classroom & Tools', displayName: 'Classroom Tools & Study', description: 'Desks, chalkboards, notebooks, backpacks, and flashcards', tags: ['blackboard', 'desk', 'notebook', 'study'] },
      { id: 'pedagogy', categoryId: 'education', name: 'Pedagogy', displayName: 'Pedagogical Methods', description: 'Instructional design, concept mapping, interactive quizzes, and mastery', tags: ['concept_map', 'quiz', 'curriculum'] },
    ],
  },

  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    displayName: 'Mathematics & Logic',
    description: 'Arithmetic, algebra, geometry, statistics, calculus, probability, and pure mathematical logic',
    icon: '📐',
    primaryColor: '#8B5CF6',
    accentColor: '#6D28D9',
    order: 18,
    tags: ['math', 'mathematics', 'geometry', 'statistics', 'calculus', 'numbers'],
    domains: [
      { id: 'geometry_algebra', categoryId: 'mathematics', name: 'Geometry & Algebra', displayName: 'Geometry & Algebra', description: 'Angles, shapes, algebraic equations, coordinate grids, and vectors', tags: ['angles', 'shapes', 'equations', 'graph'] },
      { id: 'probability_stats', categoryId: 'mathematics', name: 'Probability & Stats', displayName: 'Probability & Statistics', description: 'Distributions, bell curves, dice, sampling, and percentage pies', tags: ['statistics', 'probability', 'bell_curve', 'distribution'] },
    ],
  },

  arts_design: {
    id: 'arts_design',
    name: 'Arts & Design',
    displayName: 'Arts & Visual Design',
    description: 'Visual arts, graphic design, illustration, color theory, typography, sculpture, and aesthetics',
    icon: '🎨',
    primaryColor: '#EC4899',
    accentColor: '#DB2777',
    order: 19,
    tags: ['art', 'design', 'illustration', 'colors', 'drawing', 'creativity'],
    domains: [
      { id: 'visual_art', categoryId: 'arts_design', name: 'Visual Art', displayName: 'Fine Art & Painting', description: 'Canvases, paintbrushes, color wheels, palettes, and sketches', tags: ['easel', 'brush', 'palette', 'paint'] },
      { id: 'graphic_design', categoryId: 'arts_design', name: 'Graphic Design', displayName: 'Graphic Design & UI', description: 'Typography, layout grids, vector paths, and design principles', tags: ['typography', 'layout', 'vector', 'colors'] },
    ],
  },

  music: {
    id: 'music',
    name: 'Music',
    displayName: 'Music & Acoustics',
    description: 'Musical instruments, rhythm, acoustic sound waves, composition, performance, and musical theory',
    icon: '🎵',
    primaryColor: '#A855F7',
    accentColor: '#9333EA',
    order: 20,
    tags: ['music', 'instruments', 'sound', 'audio', 'notes', 'rhythm'],
    domains: [
      { id: 'instruments_theory', categoryId: 'music', name: 'Instruments', displayName: 'Instruments & Notation', description: 'Piano, guitar, violin, sheet music, staves, and treble clef', tags: ['piano', 'guitar', 'notes', 'sheet_music'] },
    ],
  },

  literature_language: {
    id: 'literature_language',
    name: 'Literature & Language',
    displayName: 'Literature & Linguistics',
    description: 'Storytelling, narrative arcs, linguistic structures, poetry, books, dialogue, and semantics',
    icon: '📖',
    primaryColor: '#D97706',
    accentColor: '#B45309',
    order: 21,
    tags: ['literature', 'language', 'reading', 'writing', 'grammar', 'stories'],
    domains: [
      { id: 'storytelling', categoryId: 'literature_language', name: 'Storytelling & Grammar', displayName: 'Storytelling & Writing', description: 'Parchment, quill, story structures, dialogue balloons, and books', tags: ['quill', 'story', 'book', 'speech_bubble'] },
    ],
  },

  psychology: {
    id: 'psychology',
    name: 'Psychology',
    displayName: 'Psychology & Cognitive Science',
    description: 'Human cognition, perception, memory, emotional intelligence, decision-making, and behavior',
    icon: '💡',
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    order: 22,
    tags: ['psychology', 'mind', 'cognition', 'behavior', 'emotions'],
    domains: [
      { id: 'cognition_emotion', categoryId: 'psychology', name: 'Cognition', displayName: 'Cognitive Processes & Emotion', description: 'Memory pathways, emotional awareness, thinking states, and focus', tags: ['thinking', 'memory', 'emotions', 'focus'] },
    ],
  },

  society_culture: {
    id: 'society_culture',
    name: 'Society & Culture',
    displayName: 'Society & Cultural Studies',
    description: 'Cultural traditions, global communities, social structures, customs, celebrations, and heritage',
    icon: '🌍',
    primaryColor: '#10B981',
    accentColor: '#059669',
    order: 23,
    tags: ['culture', 'society', 'community', 'tradition', 'celebration'],
    domains: [
      { id: 'community_tradition', categoryId: 'society_culture', name: 'Community', displayName: 'Community & Cultural Customs', description: 'Festivals, gatherings, traditional attire, and cultural artifacts', tags: ['community', 'festival', 'traditions'] },
    ],
  },

  food_cooking: {
    id: 'food_cooking',
    name: 'Food & Culinary Arts',
    displayName: 'Food & Culinary Arts',
    description: 'Cooking techniques, kitchen utensils, ingredients, recipes, nutrition science, and culinary history',
    icon: '🍳',
    primaryColor: '#F97316',
    accentColor: '#EA580C',
    order: 24,
    tags: ['food', 'cooking', 'kitchen', 'recipes', 'chef', 'ingredients'],
    domains: [
      { id: 'kitchen_culinary', categoryId: 'food_cooking', name: 'Culinary Arts', displayName: 'Culinary Preparation', description: 'Chef hat, pots, pans, cutting board, spices, and cooking steps', tags: ['chef', 'pan', 'pot', 'knife', 'recipe'] },
    ],
  },

  architecture_construction: {
    id: 'architecture_construction',
    name: 'Architecture & Construction',
    displayName: 'Architecture & Building',
    description: 'Building design, blueprints, structural architecture, materials, construction tools, and urban planning',
    icon: '🏗️',
    primaryColor: '#64748B',
    accentColor: '#475569',
    order: 25,
    tags: ['architecture', 'construction', 'buildings', 'blueprints', 'structures'],
    domains: [
      { id: 'building_design', categoryId: 'architecture_construction', name: 'Architecture', displayName: 'Architectural Design & Build', description: 'Blueprints, building foundations, cranes, scaffolding, and roofs', tags: ['blueprint', 'crane', 'scaffold', 'house'] },
    ],
  },

  manufacturing_industry: {
    id: 'manufacturing_industry',
    name: 'Manufacturing & Industry',
    displayName: 'Manufacturing & Industrial Production',
    description: 'Assembly lines, factory equipment, quality control, raw material processing, and industrial robotics',
    icon: '🏭',
    primaryColor: '#475569',
    accentColor: '#334155',
    order: 26,
    tags: ['manufacturing', 'factory', 'industry', 'production', 'assembly_line'],
    domains: [
      { id: 'industrial_production', categoryId: 'manufacturing_industry', name: 'Production', displayName: 'Industrial Production', description: 'Conveyor belts, robotic arms, storage crates, and factories', tags: ['factory', 'conveyor', 'assembly', 'crane'] },
    ],
  },

  communication_media: {
    id: 'communication_media',
    name: 'Communication & Media',
    displayName: 'Communication & Media',
    description: 'Broadcasting, journalism, podcasts, digital publishing, video production, and social channels',
    icon: '📡',
    primaryColor: '#0284C7',
    accentColor: '#0369A1',
    order: 27,
    tags: ['media', 'communication', 'broadcast', 'journalism', 'podcast'],
    domains: [
      { id: 'broadcast_media', categoryId: 'communication_media', name: 'Media Systems', displayName: 'Broadcasting & Media Production', description: 'Microphones, studio cameras, broadcast waves, and press articles', tags: ['microphone', 'camera', 'broadcast', 'news'] },
    ],
  },

  everyday_life: {
    id: 'everyday_life',
    name: 'Everyday Life',
    displayName: 'Everyday Life & Practical Skills',
    description: 'Home items, daily routines, clocks, furniture, personal organization, and practical knowledge',
    icon: '🏡',
    primaryColor: '#3B82F6',
    accentColor: '#2563EB',
    order: 28,
    tags: ['everyday', 'home', 'daily', 'routine', 'furniture', 'objects'],
    domains: [
      { id: 'home_daily', categoryId: 'everyday_life', name: 'Home & Daily', displayName: 'Home & Household Items', description: 'Chairs, tables, clocks, keys, lamps, backpacks, and cups', tags: ['chair', 'table', 'lamp', 'clock', 'cup', 'key'] },
    ],
  },

  sports_games: {
    id: 'sports_games',
    name: 'Sports & Games',
    displayName: 'Sports & Strategic Games',
    description: 'Athletics, team sports, chess, strategy games, game mechanics, and sportsmanship',
    icon: '⚽',
    primaryColor: '#10B981',
    accentColor: '#059669',
    order: 29,
    tags: ['sports', 'games', 'athletics', 'strategy', 'chess'],
    domains: [
      { id: 'athletics_games', categoryId: 'sports_games', name: 'Sports & Strategy', displayName: 'Sports & Board Games', description: 'Footballs, basketballs, chess pieces, timers, and trophies', tags: ['ball', 'chess', 'trophy', 'track'] },
    ],
  },

  travel_exploration: {
    id: 'travel_exploration',
    name: 'Travel & Exploration',
    displayName: 'Travel & Expedition',
    description: 'Exploration journeys, navigational tools, luggage, passports, outdoor trails, and world discoveries',
    icon: '🧭',
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    order: 30,
    tags: ['travel', 'exploration', 'expedition', 'adventure', 'compass'],
    domains: [
      { id: 'expedition_travel', categoryId: 'travel_exploration', name: 'Expeditions', displayName: 'Expeditions & Travel', description: 'Compass, backpack, tent, binoculars, maps, and travel tickets', tags: ['compass', 'tent', 'binoculars', 'passport'] },
    ],
  },
};

/**
 * Returns all master visual categories
 */
export function getAllCategories(): VisualCategory[] {
  return Object.values(MASTER_VISUAL_CATEGORIES).sort((a, b) => a.order - b.order);
}

/**
 * Fetch category by ID
 */
export function getCategoryById(categoryId: string): VisualCategory | undefined {
  return MASTER_VISUAL_CATEGORIES[categoryId];
}

/**
 * Check if category ID is valid
 */
export function isValidCategoryId(categoryId: string): boolean {
  return Boolean(MASTER_VISUAL_CATEGORIES[categoryId]);
}

/**
 * Fetch all domains for a category
 */
export function getDomainsForCategory(categoryId: string): VisualDomain[] {
  const cat = MASTER_VISUAL_CATEGORIES[categoryId];
  return cat ? cat.domains : [];
}

/**
 * Fetch specific domain across categories
 */
export function getDomainById(categoryId: string, domainId: string): VisualDomain | undefined {
  const cat = MASTER_VISUAL_CATEGORIES[categoryId];
  if (!cat) return undefined;
  return cat.domains.find(d => d.id === domainId);
}

/**
 * Validate a VisualCategory object
 */
export function validateVisualCategory(category: VisualCategory): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!category.id) errors.push('Category missing id');
  if (!category.name) errors.push('Category missing name');
  if (!category.displayName) errors.push('Category missing displayName');
  if (!Array.isArray(category.domains)) errors.push('Category domains must be an array');
  if (!category.primaryColor) errors.push('Category missing primaryColor');
  return {
    isValid: errors.length === 0,
    errors,
  };
}
