/**
 * Swallern Classroom Theme System
 * 6 curated themes, each linked to an EnvironmentType and a matching
 * visual/colour palette. The user's choice is persisted to localStorage.
 * Smart defaults map topic categories to sensible opening themes.
 */

export type ClassroomThemeId =
  | 'classic_study'
  | 'nature_explorer'
  | 'science_lab'
  | 'library'
  | 'space_observatory'
  | 'minimal';

export interface ClassroomTheme {
  id: ClassroomThemeId;
  label: string;
  /** Short phrase shown in the picker */
  tagline: string;
  /** Background gradient / solid for the classroom shell */
  shellBackground: string;
  /** Card surface background */
  cardBackground: string;
  /** Card border colour */
  cardBorder: string;
  /** Accent colour used for progress bars, badges, highlights */
  accent: string;
  /** Header surface background */
  headerBackground: string;
  /** EnvironmentType for SwallernVisual / SwallernBackground */
  environment: string;
  /** SVG decorative colour token set */
  decorPrimary: string;
  decorSecondary: string;
  decorTertiary: string;
}

export const CLASSROOM_THEMES: Record<ClassroomThemeId, ClassroomTheme> = {
  classic_study: {
    id: 'classic_study',
    label: 'Classic Study',
    tagline: 'Warm and focused',
    shellBackground: 'linear-gradient(160deg, #FDFAF6 0%, #F5F0E8 100%)',
    cardBackground: '#FFFDF8',
    cardBorder: '#E8DFC8',
    accent: '#6366F1',
    headerBackground: 'rgba(255, 253, 248, 0.95)',
    environment: 'classroom',
    decorPrimary: '#C9A96E',
    decorSecondary: '#E8DFC8',
    decorTertiary: '#F0E6CC',
  },
  nature_explorer: {
    id: 'nature_explorer',
    label: 'Nature Explorer',
    tagline: 'Fresh and curious',
    shellBackground: 'linear-gradient(160deg, #F0FDF4 0%, #ECFCE4 100%)',
    cardBackground: '#F9FEFB',
    cardBorder: '#BBF7D0',
    accent: '#059669',
    headerBackground: 'rgba(240, 253, 244, 0.95)',
    environment: 'forest',
    decorPrimary: '#16A34A',
    decorSecondary: '#BBF7D0',
    decorTertiary: '#D1FAE5',
  },
  science_lab: {
    id: 'science_lab',
    label: 'Science Lab',
    tagline: 'Precise and energetic',
    shellBackground: 'linear-gradient(160deg, #EFF6FF 0%, #EDE9FE 100%)',
    cardBackground: '#F8FAFF',
    cardBorder: '#C7D2FE',
    accent: '#4F46E5',
    headerBackground: 'rgba(239, 246, 255, 0.95)',
    environment: 'laboratory',
    decorPrimary: '#4F46E5',
    decorSecondary: '#C7D2FE',
    decorTertiary: '#E0E7FF',
  },
  library: {
    id: 'library',
    label: 'Library',
    tagline: 'Quiet and rich',
    shellBackground: 'linear-gradient(160deg, #FDF8F0 0%, #FAF0E6 100%)',
    cardBackground: '#FEFCF8',
    cardBorder: '#DDD0B8',
    accent: '#92400E',
    headerBackground: 'rgba(253, 248, 240, 0.95)',
    environment: 'library',
    decorPrimary: '#92400E',
    decorSecondary: '#DDD0B8',
    decorTertiary: '#F5ECD8',
  },
  space_observatory: {
    id: 'space_observatory',
    label: 'Space Observatory',
    tagline: 'Deep and vast',
    shellBackground: 'linear-gradient(160deg, #0B0F1A 0%, #0D1B3E 100%)',
    cardBackground: '#0F172A',
    cardBorder: '#1E3A5F',
    accent: '#38BDF8',
    headerBackground: 'rgba(11, 15, 26, 0.97)',
    environment: 'space',
    decorPrimary: '#38BDF8',
    decorSecondary: '#1E3A5F',
    decorTertiary: '#0F3460',
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    tagline: 'Clean and calm',
    shellBackground: '#F8FAFC',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    accent: '#6366F1',
    headerBackground: 'rgba(255, 255, 255, 0.97)',
    environment: 'abstract',
    decorPrimary: '#E2E8F0',
    decorSecondary: '#F1F5F9',
    decorTertiary: '#F8FAFC',
  },
};

const THEME_STORAGE_KEY = 'swallern_classroom_theme_v1';

/** Category slug → default theme */
const CATEGORY_DEFAULT_MAP: Record<string, ClassroomThemeId> = {
  science: 'science_lab',
  biology: 'nature_explorer',
  environment: 'nature_explorer',
  nature: 'nature_explorer',
  space: 'space_observatory',
  astronomy: 'space_observatory',
  physics: 'science_lab',
  chemistry: 'science_lab',
  history: 'library',
  literature: 'library',
  philosophy: 'library',
  art: 'classic_study',
  music: 'classic_study',
  mathematics: 'science_lab',
  technology: 'minimal',
  programming: 'minimal',
};

export function getSmartDefaultTheme(categorySlug?: string): ClassroomThemeId {
  if (!categorySlug) return 'classic_study';
  const lower = categorySlug.toLowerCase();
  // Check for partial matches
  for (const [key, themeId] of Object.entries(CATEGORY_DEFAULT_MAP)) {
    if (lower.includes(key)) return themeId;
  }
  return 'classic_study';
}

export function loadSavedTheme(): ClassroomThemeId | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved in CLASSROOM_THEMES) return saved as ClassroomThemeId;
  } catch {
    // ignore
  }
  return null;
}

export function saveTheme(themeId: ClassroomThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore
  }
}

export function resolveTheme(
  categorySlug?: string,
  topicSlugForOverride?: string,
): ClassroomTheme {
  // User choice always wins
  const saved = loadSavedTheme();
  const themeId = saved ?? getSmartDefaultTheme(categorySlug);
  return CLASSROOM_THEMES[themeId];
}
