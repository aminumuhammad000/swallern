/**
 * Swallern Visual System v1 — Master Diagrams Architecture & Registry
 * Section 9: Semantic diagram types, structural node & edge graph schemas,
 * and standard pedagogical flow templates.
 */

import { VisualAsset } from './assets';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export type SemanticDiagramType =
  | 'flow'
  | 'cycle'
  | 'timeline'
  | 'comparison'
  | 'hierarchy'
  | 'process'
  | 'system'
  | 'network'
  | 'anatomy'
  | 'map'
  | 'sequence'
  | 'cause_effect'
  | 'input_output'
  | 'before_after'
  | 'layered_structure';

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  assetId?: string;
  color?: string;
  x?: number;
  y?: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'pulse';
  bidirectional?: boolean;
}

export interface DiagramStep {
  stepNumber: number;
  title: string;
  description: string;
  assetIds: string[];
}

export interface DiagramStructure {
  diagramType: SemanticDiagramType;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  steps?: DiagramStep[];
}

/**
 * Approved Semantic Diagram Type Specifications
 */
export const SEMANTIC_DIAGRAM_TYPES: Record<SemanticDiagramType, { name: string; description: string; bestFor: string[] }> = {
  flow: { name: 'Flow Diagram', description: 'Step-by-step directional progression with decision branches', bestFor: ['algorithms', 'user journeys', 'logic trees'] },
  cycle: { name: 'Cyclical Loop', description: 'Continuous recurring regenerative cycle returning to beginning', bestFor: ['water cycle', 'rock cycle', 'photosynthesis', 'feedback loops'] },
  timeline: { name: 'Chronological Timeline', description: 'Horizontal or vertical milestones arranged by time progression', bestFor: ['history', 'evolution', 'project milestones'] },
  comparison: { name: 'Side-by-Side Comparison', description: 'Parallel contrast between two or more contrasting concepts', bestFor: ['pros vs cons', 'mitosis vs meiosis', 'ac vs dc'] },
  hierarchy: { name: 'Tree Hierarchy', description: 'Top-down or radial organizational tree structure', bestFor: ['taxonomies', 'org charts', 'file systems', 'food webs'] },
  process: { name: 'Sequential Process', description: 'Linear sequential stage-by-stage pipeline', bestFor: ['how wifi works', 'manufacturing assembly', 'digestion'] },
  system: { name: 'System Architecture', description: 'Complex interconnected sub-systems with feedback loops', bestFor: ['internet architecture', 'circulatory system', 'operating systems'] },
  network: { name: 'Network Graph', description: 'Distributed mesh of interconnected peer or client-server nodes', bestFor: ['social networks', 'computer networks', 'neural synapses'] },
  anatomy: { name: 'Anatomical Callout', description: 'Cross-section or exploded view with labeled components', bestFor: ['cell anatomy', 'engine anatomy', 'earth layers'] },
  map: { name: 'Geographic / Concept Map', description: 'Spatial layout with labeled territories and migration paths', bestFor: ['geography', 'migration paths', 'trade routes'] },
  sequence: { name: 'Step Sequence', description: 'Numbered orderly instructional instructions', bestFor: ['recipes', 'experiments', 'math proofs'] },
  cause_effect: { name: 'Cause & Effect Tree', description: 'Fishbone or directional graph mapping root causes to outcomes', bestFor: ['climate impacts', 'historical wars', 'economic inflation'] },
  input_output: { name: 'Input-Process-Output Box', description: 'Black box / transparent box transformation model', bestFor: ['functions', 'photosynthesis input/output', 'economic production'] },
  before_after: { name: 'Before & After Transformation', description: 'State transition showing initial and resultant conditions', bestFor: ['chemical reactions', 'urban development', 'erosion'] },
  layered_structure: { name: 'Layered Stack Architecture', description: 'Horizontal layered stack showing abstraction layers', bestFor: ['osi network layers', 'earth crust layers', 'software stack'] },
};

/**
 * Master Canonical Diagram Visual Assets
 */
export const CANONICAL_DIAGRAM_ASSETS: VisualAsset[] = [
  {
    id: 'diagram_water_cycle_v1',
    version: '1.0',
    name: 'water_cycle_diagram',
    displayName: 'The Water Cycle',
    family: 'diagram',
    categoryIds: ['nature_environment', 'science', 'geography'],
    domainIds: ['climate', 'ecosystems', 'physical_geography'],
    tags: ['water_cycle', 'evaporation', 'condensation', 'precipitation', 'collection', 'cycle'],
    aliases: ['hydrologic cycle', 'water loop', 'rain cycle'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'diagram',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'diagram',
    compatibleWith: ['sun_v1', 'cloud_ambient_v1', 'mountain_v1', 'ocean_marine_v1'],
    description: 'Circular educational diagram explaining evaporation, condensation, precipitation, and collection.',
    defaultColor: '#3B82F6',
    metadata: {
      diagramType: 'cycle',
      steps: [
        { stepNumber: 1, title: 'Evaporation', description: 'Sun heats ocean water turning it into vapor.', assetIds: ['sun_v1', 'ocean_marine_v1'] },
        { stepNumber: 2, title: 'Condensation', description: 'Water vapor cools in the atmosphere forming clouds.', assetIds: ['cloud_ambient_v1'] },
        { stepNumber: 3, title: 'Precipitation', description: 'Moisture falls back to earth as rain or snow.', assetIds: ['cloud_ambient_v1', 'mountain_v1'] },
        { stepNumber: 4, title: 'Collection', description: 'Runoff collects in streams, rivers, and returns to oceans.', assetIds: ['ocean_marine_v1'] },
      ],
    },
  },
  {
    id: 'diagram_internet_request_v1',
    version: '1.0',
    name: 'internet_request_flow',
    displayName: 'Internet Client-Server Request Flow',
    family: 'diagram',
    categoryIds: ['technology', 'education'],
    domainIds: ['internet', 'networking', 'software'],
    tags: ['internet', 'request', 'response', 'client', 'server', 'dns', 'router', 'packets'],
    aliases: ['how the web works', 'client server diagram', 'http request flow'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'diagram',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'diagram',
    compatibleWith: ['laptop_v1', 'router_v1', 'server_v1', 'concept_data_particles_v1'],
    description: 'Step-by-step diagram showing a browser sending an HTTP request through a router to a cloud server.',
    defaultColor: '#0D9488',
    metadata: {
      diagramType: 'process',
      steps: [
        { stepNumber: 1, title: 'Device Request', description: 'Browser enters URL and creates DNS lookup request.', assetIds: ['laptop_v1'] },
        { stepNumber: 2, title: 'Wireless Routing', description: 'Home router routes packet over internet backbone.', assetIds: ['router_v1'] },
        { stepNumber: 3, title: 'Server Processing', description: 'Data center server processes query and returns HTML/JSON.', assetIds: ['server_v1'] },
        { stepNumber: 4, title: 'Visual Rendering', description: 'Device renders the webpage on screen.', assetIds: ['laptop_v1'] },
      ],
    },
  },
];
