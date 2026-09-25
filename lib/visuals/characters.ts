/**
 * Swallern Visual System v1 — Canonical Character & Mascot Registry
 * Defines canonical mascot specifications (Swallern Bear v1), reusable character roles,
 * expressions, poses, educational actions, and clothing/props configurations.
 * Enforces zero character drift across lessons.
 */

import { VisualAsset } from './assets';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export type CharacterExpression =
  | 'happy'
  | 'curious'
  | 'excited'
  | 'surprised'
  | 'confused'
  | 'thinking'
  | 'focused'
  | 'sleepy'
  | 'proud'
  | 'celebrating';

export type CharacterPose =
  | 'standing'
  | 'walking'
  | 'sitting'
  | 'reading'
  | 'thinking'
  | 'pointing'
  | 'waving'
  | 'studying'
  | 'looking_at_object'
  | 'holding_object'
  | 'celebrating'
  | 'sleeping'
  | 'discovering';

export type EducationalAction =
  | 'explaining'
  | 'comparing'
  | 'investigating'
  | 'measuring'
  | 'observing'
  | 'reading'
  | 'writing'
  | 'experimenting'
  | 'exploring'
  | 'asking_question';

export type HumanCharacterRole =
  | 'person'
  | 'student'
  | 'teacher'
  | 'scientist'
  | 'doctor'
  | 'engineer'
  | 'farmer'
  | 'developer'
  | 'designer'
  | 'business_person'
  | 'researcher'
  | 'astronaut'
  | 'artist'
  | 'chef'
  | 'builder'
  | 'pilot'
  | 'driver';

export interface CharacterSpecification {
  characterId: string;
  name: string;
  species: string;
  role?: HumanCharacterRole | 'mascot';
  description: string;
  bodyProportions: string;
  faceStructure: string;
  eyeStyle: string;
  primaryColorPalette: string[];
  clothing: string;
  accessories: string[];
  silhouette: string;
  renderingStyle: string;
  approvedExpressions: CharacterExpression[];
  approvedPoses: CharacterPose[];
  approvedActions: EducationalAction[];
}

/**
 * Primary Mascot: Swallern Bear v1
 */
export const SWALLERN_BEAR_V1: CharacterSpecification = {
  characterId: 'swallern_bear_v1',
  name: 'Swallern Bear',
  species: 'Brown Bear (Ursus arctos)',
  role: 'mascot',
  description: 'Friendly, intelligent brown bear with soft rounded ears, expressively warm eyes, wearing an iconic bright blue backpack',
  bodyProportions: 'Chubby friendly torso, short soft arms and legs, rounded head with soft curves',
  faceStructure: 'Light tan snout, soft dark brown nose, friendly warm smile, expressive dark oval eyes',
  eyeStyle: 'Large dark expressive pupils with bright white highlight reflection spots',
  primaryColorPalette: ['#8B4513', '#D2B48C', '#3B82F6', '#F59E0B'],
  clothing: 'Iconic bright Swallern Blue backpack with yellow zippers and clean straps',
  accessories: ['Blue backpack', 'Magnifying glass (optional)', 'Notebook (optional)'],
  silhouette: 'Rounded friendly bear silhouette with visible backpack outline on shoulder',
  renderingStyle: 'Swallern Visual System v1 soft vector illustration with subtle depth gradients',
  approvedExpressions: [
    'happy',
    'curious',
    'excited',
    'surprised',
    'confused',
    'thinking',
    'focused',
    'sleepy',
    'proud',
    'celebrating',
  ],
  approvedPoses: [
    'standing',
    'walking',
    'sitting',
    'reading',
    'thinking',
    'pointing',
    'waving',
    'studying',
    'looking_at_object',
    'holding_object',
    'celebrating',
    'sleeping',
    'discovering',
  ],
  approvedActions: [
    'explaining',
    'comparing',
    'investigating',
    'measuring',
    'observing',
    'reading',
    'writing',
    'experimenting',
    'exploring',
    'asking_question',
  ],
};

/**
 * Reusable Human Character Archetypes (Section 4)
 */
export const REUSABLE_HUMAN_ROLES: Record<HumanCharacterRole, { name: string; description: string; clothing: string; defaultProps: string[]; categoryIds: string[] }> = {
  person: { name: 'Everyday Person', description: 'Friendly everyday learner in casual attire', clothing: 'Teal sweater and dark trousers', defaultProps: ['Smartphone', 'Notebook'], categoryIds: ['everyday_life', 'society_culture'] },
  student: { name: 'Student Learner', description: 'Curious student with backpack and study notes', clothing: 'Navy hoodie with backpack', defaultProps: ['Books', 'Pencil', 'Backpack'], categoryIds: ['education', 'everyday_life'] },
  teacher: { name: 'Educational Teacher', description: 'Engaging instructor at a blackboard or podium', clothing: 'Smart casual blazer with glasses', defaultProps: ['Pointer', 'Book', 'Chalkboard'], categoryIds: ['education'] },
  scientist: { name: 'Research Scientist', description: 'Laboratory researcher conducting experiments', clothing: 'White lab coat with safety glasses', defaultProps: ['Flask', 'Microscope', 'Clipboard'], categoryIds: ['science', 'health', 'medicine'] },
  doctor: { name: 'Medical Doctor', description: 'Healthcare professional providing diagnosis and care', clothing: 'Teal medical scrubs with stethoscope', defaultProps: ['Stethoscope', 'Chart'], categoryIds: ['health', 'medicine'] },
  engineer: { name: 'Systems Engineer', description: 'Technical specialist building structural and mechanical systems', clothing: 'Work vest or modern tech jacket with hardhat/safety gear', defaultProps: ['Blueprint', 'Wrench', 'Tablet'], categoryIds: ['engineering', 'technology', 'energy'] },
  farmer: { name: 'Agricultural Farmer', description: 'Agronomist and farmer managing crops and soil', clothing: 'Durable denim overalls with brimmed sun hat', defaultProps: ['Trowel', 'Harvest basket', 'Seed packet'], categoryIds: ['agriculture', 'nature_environment', 'food_cooking'] },
  developer: { name: 'Software Developer', description: 'Programmer writing algorithms and building digital tools', clothing: 'Dark sweater with headphones', defaultProps: ['Laptop', 'Mechanical keyboard', 'Monitor'], categoryIds: ['technology', 'artificial_intelligence'] },
  designer: { name: 'Visual Designer', description: 'Creative designer composing visual layouts and color schemes', clothing: 'Stylized modern casual with sketchbook', defaultProps: ['Stylus', 'Tablet', 'Color swatch'], categoryIds: ['arts_design'] },
  business_person: { name: 'Business Professional', description: 'Executive or manager presenting business strategy', clothing: 'Navy business suit or smart blazer', defaultProps: ['Briefcase', 'Financial chart', 'Tablet'], categoryIds: ['business', 'finance_economics'] },
  researcher: { name: 'Academic Researcher', description: 'Scholar analyzing data, archives, and findings', clothing: 'Cardigan with reading glasses', defaultProps: ['Magnifying glass', 'Research binder', 'Laptop'], categoryIds: ['science', 'education', 'history'] },
  astronaut: { name: 'Space Astronaut', description: 'Explorer conducting orbital and extraterrestrial missions', clothing: 'Pressurized white spacesuit with gold visor', defaultProps: ['Helmet', 'Telemetry pad', 'Sample container'], categoryIds: ['space', 'science', 'engineering'] },
  artist: { name: 'Visual Artist', description: 'Painter expressing concepts through form and pigment', clothing: 'Artist smock with paint flecks', defaultProps: ['Easel', 'Paintbrush', 'Palette'], categoryIds: ['arts_design', 'culture_society'] },
  chef: { name: 'Culinary Chef', description: 'Culinary expert preparing dishes and exploring ingredients', clothing: 'White chef coat with toque hat', defaultProps: ['Whisk', 'Chef knife', 'Sauté pan'], categoryIds: ['food_cooking'] },
  builder: { name: 'Construction Builder', description: 'Builder assembling architectural structures and frameworks', clothing: 'High-visibility vest and yellow hardhat', defaultProps: ['Level', 'Hammer', 'Tool belt'], categoryIds: ['architecture_construction', 'manufacturing_industry'] },
  pilot: { name: 'Aviation Pilot', description: 'Aviator navigating transport routes and flight instruments', clothing: 'Navy aviator uniform with gold epaulets', defaultProps: ['Flight bag', 'Navigation chart', 'Headset'], categoryIds: ['transportation', 'travel_exploration'] },
  driver: { name: 'Transit Driver', description: 'Operator of road transit vehicles and transport logistics', clothing: 'Uniform polo and cap', defaultProps: ['Steering wheel', 'Logbook', 'Route tablet'], categoryIds: ['transportation'] },
};

/**
 * Mascot: Swallern Bird v1 — Canonical Course Journey Companion
 * A stylised 3D cybernetic bird. Distinct from the Bear; used as the
 * learner's intelligent guide across Course Journey experiences.
 */
export type BirdExpression =
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'thinking'
  | 'surprised'
  | 'focused'
  | 'confused'
  | 'proud'
  | 'celebrating'
  | 'encouraging';

export type BirdPose =
  | 'standing'
  | 'looking'
  | 'pointing'
  | 'thinking'
  | 'waving'
  | 'discovering'
  | 'celebrating';

/** Controlled dialogue lines keyed by learning context */
export type BirdDialogueContext =
  | 'course_intro'        // Opening a new course
  | 'course_resume'       // Returning to an in-progress course
  | 'course_complete'     // Course finished
  | 'milestone_enter'     // Starting a specific lesson
  | 'milestone_complete'  // Finishing a lesson
  | 'near_finish'         // Last 1–2 lessons remaining
  | 'correct_answer'      // Knowledge check correct
  | 'incorrect_answer'    // Knowledge check wrong
  | 'encouragement'       // Generic encouragement
  | 'idle';               // No specific context

export const BIRD_DIALOGUE: Record<BirdDialogueContext, string[]> = {
  course_intro: [
    "Ready to see what's really going on here?",
    "Something interesting is hiding in this one.",
    "Let's find out how this actually works.",
  ],
  course_resume: [
    "Right where we left off.",
    "Welcome back. Ready to keep going?",
    "Let's pick this back up.",
  ],
  course_complete: [
    "You made it.",
    "That's the full picture.",
    "Journey complete.",
  ],
  milestone_enter: [
    "Here's where it gets interesting.",
    "This one's worth paying attention to.",
    "First, the big idea.",
  ],
  milestone_complete: [
    "That's one piece of the puzzle.",
    "Good. Moving forward.",
    "Nice. That makes sense now.",
  ],
  near_finish: [
    "Almost there.",
    "One more discovery.",
    "Getting close to the destination.",
  ],
  correct_answer: [
    "Exactly right.",
    "Yep. You got it.",
    "That's the one.",
  ],
  incorrect_answer: [
    "Close. Let's look at that again.",
    "Not quite — check the detail.",
    "Interesting guess. Here's why it's different.",
  ],
  encouragement: [
    "Keep going.",
    "You're doing well.",
    "One step at a time.",
  ],
  idle: [],
};

/**
 * Pick a single dialogue line for a given context (deterministic by index mod)
 */
export function getBirdDialogue(
  context: BirdDialogueContext,
  seed: number = 0
): string | null {
  const lines = BIRD_DIALOGUE[context];
  if (!lines || lines.length === 0) return null;
  return lines[seed % lines.length];
}

export const SWALLERN_BIRD_V1: CharacterSpecification = {
  characterId: 'swallern_bird_v1',
  name: 'Swallern Bird',
  species: 'Cybernetic Swallern (fictional)',
  role: 'mascot',
  description:
    'Intelligent cybernetic bird with teal-blue plumage, amber-gold expressive eyes, ' +
    'subtle mechanical wing articulation, and a luminescent chest emblem. ' +
    'Designed as the learner\'s guide across the Course Journey experience.',
  bodyProportions: 'Compact rounded body, prominent expressive head, elegant tail, articulated wings with subtle mechanical joints',
  faceStructure: 'Cream-white facial disc, large amber-gold eyes, slim dark beak with slight curvature suggesting intelligence',
  eyeStyle: 'Large amber-gold eyes with circuit-glow highlight, capable of wide expression range',
  primaryColorPalette: ['#0D9488', '#3B82F6', '#0F172A', '#F59E0B', '#F8FAFC'],
  clothing: 'Subtle luminescent Swallern chest emblem, refined metallic wing-joint accents',
  accessories: ['Mechanical wing articulation rings', 'Luminescent chest emblem'],
  silhouette: 'Distinct compact bird silhouette with visible wing structure and upright intelligent posture',
  renderingStyle: 'Polished 3D character — stylised realism, soft studio lighting, premium educational-product quality',
  approvedExpressions: [
    'happy', 'curious', 'excited', 'surprised', 'confused',
    'thinking', 'focused', 'sleepy', 'proud', 'celebrating',
  ],
  approvedPoses: [
    'standing', 'walking', 'sitting', 'reading', 'thinking',
    'pointing', 'waving', 'studying', 'looking_at_object',
    'holding_object', 'celebrating', 'sleeping', 'discovering',
  ],
  approvedActions: [
    'explaining', 'comparing', 'investigating', 'measuring', 'observing',
    'reading', 'writing', 'experimenting', 'exploring', 'asking_question',
  ],
};

/**
 * Character Registry
 */
export const CANONICAL_CHARACTERS: Record<string, CharacterSpecification> = {
  swallern_bear_v1: SWALLERN_BEAR_V1,
  swallern_bird_v1: SWALLERN_BIRD_V1,
};

/**
 * Helper to fetch character spec by ID
 */
export function getCharacterSpec(characterId: string = 'swallern_bear_v1'): CharacterSpecification {
  return CANONICAL_CHARACTERS[characterId] || SWALLERN_BEAR_V1;
}

/**
 * Convert Mascot Spec into VisualAsset record
 */
export const SWALLERN_BEAR_ASSET: VisualAsset = {
  id: 'swallern_bear_v1',
  version: '1.0',
  name: 'swallern_bear',
  displayName: 'Swallern Bear',
  family: 'mascot',
  categoryIds: ['education', 'nature_environment', 'everyday_life'],
  domainIds: ['classroom_learning', 'wildlife'],
  tags: ['bear', 'mascot', 'swallern', 'student', 'guide', 'friend'],
  aliases: ['mascot', 'bear', 'swallern bear', 'swallern mascot'],
  visualStyle: SWALLERN_VISUAL_STYLE_V1,
  assetType: 'illustration',
  source: 'curated_builtin',
  status: 'active',
  reusable: true,
  complexity: 'simple',
  compatibleWith: ['laptop_v1', 'swallern_book_v1', 'swallern_microscope_v1', 'swallern_backpack_v1', 'swallern_magnifying_glass_v1'],
  description: 'Canonical Swallern mascot with blue backpack and warm expressive personality.',
  defaultColor: '#8B4513',
  metadata: {
    species: SWALLERN_BEAR_V1.species,
    approvedExpressions: SWALLERN_BEAR_V1.approvedExpressions,
    approvedPoses: SWALLERN_BEAR_V1.approvedPoses,
    approvedActions: SWALLERN_BEAR_V1.approvedActions,
  },
};

/**
 * Swallern Bird v1 — Visual Asset Registry Entry
 * Course Journey companion character. Versioned and separate from the Bear.
 */
export const SWALLERN_BIRD_ASSET: VisualAsset = {
  id: 'swallern_bird_v1',
  version: '1.0',
  name: 'swallern_bird',
  displayName: 'Swallern Bird',
  family: 'mascot',
  categoryIds: ['education', 'technology', 'everyday_life'],
  domainIds: ['course_journey', 'classroom_learning', 'exploration'],
  tags: ['bird', 'mascot', 'swallern', 'cybernetic', 'guide', 'companion', 'learning', 'journey'],
  aliases: ['bird', 'swallern bird', 'course guide', 'journey companion'],
  visualStyle: SWALLERN_VISUAL_STYLE_V1,
  assetType: 'illustration',
  source: 'curated_builtin',
  status: 'active',
  reusable: true,
  complexity: 'moderate',
  compatibleWith: ['course_journey_v1', 'journey_roadmap_v1'],
  description:
    'Intelligent cybernetic bird — the Swallern Course Journey companion. ' +
    'Teal-blue plumage, amber-gold eyes, subtle mechanical wing articulation. ' +
    'Designed to guide learners across course journeys without being the main attraction.',
  defaultColor: '#0D9488',
  metadata: {
    species: SWALLERN_BIRD_V1.species,
    approvedExpressions: SWALLERN_BIRD_V1.approvedExpressions,
    approvedPoses: SWALLERN_BIRD_V1.approvedPoses,
    approvedActions: SWALLERN_BIRD_V1.approvedActions,
    renderAssets: {
      neutral:     '/mascot/swallern_bird_v1_neutral.jpg',
      curious:     '/mascot/swallern_bird_v1_curious.jpg',
      celebrating: '/mascot/swallern_bird_v1_celebrating.jpg',
    },
    modelAsset: '/characters/swa/swa_v2.glb',
  },
};

