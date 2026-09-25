/**
 * Swallern Visual System v1 — Master Environments Registry
 * Section 8: Reusable contextual environments across Education, Technology, Agriculture,
 * Science, Business, Nature, Health, and Space.
 */

import { VisualAsset } from './assets';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export interface EnvironmentDefinition {
  environmentId: string;
  name: string;
  category: string;
  description: string;
  lightingStyle: string;
  palette: string[];
  safeOverlayArea: 'top' | 'bottom' | 'center' | 'left' | 'right';
  elements: string[];
}

export const MASTER_ENVIRONMENTS: Record<string, EnvironmentDefinition> = {
  // Education
  classroom: {
    environmentId: 'classroom',
    name: 'Educational Classroom',
    category: 'education',
    description: 'Clean modern classroom with wooden student desks, soft light green chalk slate, and high ceiling',
    lightingStyle: 'Bright overhead daylight, warm soft shadows',
    palette: ['#F8FAFC', '#E2E8F0', '#064E3B', '#8B4513'],
    safeOverlayArea: 'top',
    elements: ['blackboard', 'student_desk', 'bookshelf', 'clock'],
  },
  library: {
    environmentId: 'library',
    name: 'Quiet Library Archive',
    category: 'education',
    description: 'Cozy academic library with organized wooden shelves, warm reading lamps, and study alcoves',
    lightingStyle: 'Warm golden reading light',
    palette: ['#FEF3C7', '#D97706', '#78350F', '#1E293B'],
    safeOverlayArea: 'bottom',
    elements: ['bookshelves', 'reading_lamp', 'oak_table', 'globe'],
  },
  computer_lab: {
    environmentId: 'computer_lab',
    name: 'School Computer Lab',
    category: 'education',
    description: 'Organized computer lab with uniform workstations, glowing monitors, and projector screen',
    lightingStyle: 'Crisp balanced white illumination',
    palette: ['#EFF6FF', '#3B82F6', '#1E293B', '#F8FAFC'],
    safeOverlayArea: 'top',
    elements: ['desktop_monitors', 'keyboards', 'ethernet_cables', 'whiteboard'],
  },

  // Technology
  tech_office: {
    environmentId: 'tech_office',
    name: 'Modern Tech Workspace',
    category: 'technology',
    description: 'Open-plan technology office with standing desks, indoor plants, and architectural glass partitions',
    lightingStyle: 'Soft diffused natural daylight',
    palette: ['#F8FAFC', '#0D9488', '#3B82F6', '#0F172A'],
    safeOverlayArea: 'top',
    elements: ['standing_desk', 'monitors', 'potted_plants', 'glass_board'],
  },
  data_center: {
    environmentId: 'data_center',
    name: 'Enterprise Data Center',
    category: 'technology',
    description: 'High-security server room aisle flanked by tall black rack units glowing with cyan status LEDs',
    lightingStyle: 'Moody high-contrast cyan and cool white LED strips',
    palette: ['#0F172A', '#06B6D4', '#3B82F6', '#0284C7'],
    safeOverlayArea: 'center',
    elements: ['server_racks', 'cable_trays', 'cooling_vents', 'access_panel'],
  },
  hardware_workshop: {
    environmentId: 'hardware_workshop',
    name: 'Hardware Engineering Workshop',
    category: 'technology',
    description: 'Maker workshop equipped with soldering station, oscilloscope, component bins, and 3D printers',
    lightingStyle: 'Direct workbench task lighting',
    palette: ['#FFFBEB', '#F59E0B', '#475569', '#0F172A'],
    safeOverlayArea: 'top',
    elements: ['soldering_iron', 'oscilloscope', 'circuit_boards', 'parts_bin'],
  },

  // Agriculture
  farm_field: {
    environmentId: 'farm_field',
    name: 'Open Crop Farm & Field',
    category: 'agriculture',
    description: 'Expansive agricultural crop rows extending to the horizon under a clear sunny sky',
    lightingStyle: 'Bright sunny golden morning light',
    palette: ['#FEF08A', '#10B981', '#78350F', '#60A5FA'],
    safeOverlayArea: 'top',
    elements: ['crop_rows', 'tractor_tracks', 'horizon_hills', 'irrigation_line'],
  },
  greenhouse: {
    environmentId: 'greenhouse',
    name: 'Climate-Controlled Greenhouse',
    category: 'agriculture',
    description: 'Glass-paneled greenhouse with tiered plant nursery benches, misting nozzles, and sunlight beams',
    lightingStyle: 'Filtered translucent solar illumination with soft mist glow',
    palette: ['#ECFDF5', '#10B981', '#059669', '#0284C7'],
    safeOverlayArea: 'top',
    elements: ['glass_panels', 'planter_benches', 'misting_nozzles', 'seedling_trays'],
  },
  barn_ranch: {
    environmentId: 'barn_ranch',
    name: 'Pasture & Livestock Barn',
    category: 'agriculture',
    description: 'Rustic red wooden barn surrounded by fenced green pastures and grazing hills',
    lightingStyle: 'Warm pastoral afternoon sunlight',
    palette: ['#FEF2F2', '#DC2626', '#10B981', '#78350F'],
    safeOverlayArea: 'top',
    elements: ['red_barn', 'wooden_fence', 'hay_bale', 'grazing_pasture'],
  },

  // Science
  laboratory: {
    environmentId: 'laboratory',
    name: 'Science Research Laboratory',
    category: 'science',
    description: 'Ultra-clean white and cyan research facility with glassware, chemical fume hood, and optical bench',
    lightingStyle: 'Crisp sterile daylight',
    palette: ['#ECFEFF', '#06B6D4', '#0284C7', '#0F172A'],
    safeOverlayArea: 'top',
    elements: ['fume_hood', 'microscopes', 'glassware_rack', 'lab_bench'],
  },
  observatory: {
    environmentId: 'observatory',
    name: 'High-Altitude Observatory',
    category: 'science',
    description: 'Open dome observatory with giant reflective telescope aimed at the celestial starlit sky',
    lightingStyle: 'Subtle red night-vision task lighting and brilliant starry night',
    palette: ['#0F172A', '#312E81', '#38BDF8', '#FDE047'],
    safeOverlayArea: 'center',
    elements: ['telescope_dome', 'observation_deck', 'starry_sky', 'control_console'],
  },

  // Business
  meeting_room: {
    environmentId: 'meeting_room',
    name: 'Executive Boardroom',
    category: 'business',
    description: 'Polished conference room with large boardroom table, presentation display, and panoramic city views',
    lightingStyle: 'Warm recessed architectural ceiling lighting',
    palette: ['#F8FAFC', '#334155', '#0F172A', '#3B82F6'],
    safeOverlayArea: 'top',
    elements: ['boardroom_table', 'leather_chairs', 'presentation_display', 'glass_view'],
  },
  logistics_warehouse: {
    environmentId: 'logistics_warehouse',
    name: 'Logistics Fulfillment Center',
    category: 'business',
    description: 'High-bay warehouse with organized pallet racks, automated conveyor lines, and forklift aisles',
    lightingStyle: 'High-bay industrial overhead luminaires',
    palette: ['#F1F5F9', '#F97316', '#475569', '#0F172A'],
    safeOverlayArea: 'top',
    elements: ['pallet_racks', 'conveyor_belt', 'forklift', 'shipping_boxes'],
  },

  // Nature
  forest: {
    environmentId: 'forest',
    name: 'Temperate Forest Canopy',
    category: 'nature_environment',
    description: 'Lush woodland with tall pine trees, mossy forest floor, and filtered sunlight shafts',
    lightingStyle: 'Dappled sunlight filtering through green leaves',
    palette: ['#ECFDF5', '#059669', '#064E3B', '#F59E0B'],
    safeOverlayArea: 'top',
    elements: ['pine_trees', 'moss_rocks', 'winding_trail', 'sun_rays'],
  },
  ocean_marine: {
    environmentId: 'ocean_marine',
    name: 'Marine Ocean Ecosystem',
    category: 'nature_environment',
    description: 'Sunlit underwater ocean scene with gentle light caustics and soft coral reef silhouettes',
    lightingStyle: 'Sub-surface aquatic light rays',
    palette: ['#F0F9FF', '#0284C7', '#0369A1', '#0C4A6E'],
    safeOverlayArea: 'top',
    elements: ['coral_reef', 'water_caustics', 'bubble_columns', 'seabed'],
  },
  mountain_vista: {
    environmentId: 'mountain_vista',
    name: 'Alpine Mountain Vista',
    category: 'nature_environment',
    description: 'Majestic rounded alpine mountains with snowcaps under vast crisp blue sky',
    lightingStyle: 'Bright high-altitude clear sun',
    palette: ['#EFF6FF', '#3B82F6', '#1E40AF', '#0F172A'],
    safeOverlayArea: 'bottom',
    elements: ['snow_peaks', 'alpine_meadow', 'distant_clouds', 'rocky_ridge'],
  },

  // Space
  space_station: {
    environmentId: 'space_station',
    name: 'Orbital Space Station',
    category: 'space',
    description: 'Pressurized space station module with viewing cupola overlooking Earth and starry cosmos',
    lightingStyle: 'Dramatic high-contrast solar reflection against deep cosmic vacuum',
    palette: ['#0F172A', '#581C87', '#3B82F6', '#FACC15'],
    safeOverlayArea: 'center',
    elements: ['cupola_window', 'earth_horizon', 'control_panels', 'docking_port'],
  },
};

/**
 * Master Canonical Environment Visual Assets
 */
export const CANONICAL_ENVIRONMENT_ASSETS: VisualAsset[] = Object.values(MASTER_ENVIRONMENTS).map((env) => ({
  id: `env_${env.environmentId}_v1`,
  version: '1.0',
  name: env.environmentId,
  displayName: env.name,
  family: 'environment',
  categoryIds: [env.category],
  tags: [env.environmentId, env.category, 'environment', 'setting', 'scene', ...env.elements],
  aliases: [env.name.toLowerCase(), `${env.environmentId} background`],
  visualStyle: SWALLERN_VISUAL_STYLE_V1,
  assetType: 'illustration',
  source: 'curated_builtin',
  status: 'active',
  reusable: true,
  complexity: 'scene',
  description: env.description,
  defaultColor: env.palette[0],
  metadata: {
    lightingStyle: env.lightingStyle,
    palette: env.palette,
    safeOverlayArea: env.safeOverlayArea,
    elements: env.elements,
  },
}));
