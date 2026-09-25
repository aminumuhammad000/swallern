# Swallern Visual System — Master Visual Taxonomy & Asset Registry Guide

## 1. Overview & Core Philosophy

The **Swallern Visual System** is the visual vocabulary and asset orchestration infrastructure powering educational visuals across Swallern. 

Swallern teaches a broad spectrum of subjects — from **technology, AI, science, and agriculture** to **business, finance, healthcare, history, and everyday life**. Instead of generating isolated, one-off illustrations for every lesson, Swallern utilizes a **scalable visual language** built on reusable, consistent, and semantically tagged visual components.

> **Core Principle: One recognizable Swallern visual language capable of explaining almost anything.**

### Reusability Over Regeneration
Swallern adheres to a strict product principle: **REUSE over REGENERATE**. When 50 lessons require a laptop, router, or microscope, they reference the canonical asset from the registry rather than generating 50 divergent images.

---

## 2. Conceptual Architecture

The visual system is structured as a hierarchical pipeline:

```text
CATEGORY (e.g. Technology)
    ↓
DOMAIN (e.g. Networking)
    ↓
ASSET FAMILY (e.g. Object / Concept / Diagram)
    ↓
ASSET (e.g. router_v1, laptop_v1)
    ↓
COMPOSITION (e.g. Router + Laptop + Radio Waves)
    ↓
LESSON VISUAL (e.g. "How Wi-Fi Works")
```

---

## 3. Foundational Asset Families

The registry divides all visual entities into 9 master asset families (`VisualAssetFamily`):

| Family | Description | Examples |
| :--- | :--- | :--- |
| **`mascot`** | Swallern Bear v1 (`swallern_bear_v1`) — controlled canonical mascot with approved emotions and poses. | `swallern_bear_v1` |
| **`character`** | Reusable human roles with configurable clothing, poses, expressions, and accessories. | `student`, `teacher`, `scientist`, `doctor`, `farmer`, `developer`, `engineer` |
| **`object`** | Tangible physical items across technology, science, agriculture, business, and everyday life. | `laptop_v1`, `router_v1`, `microscope_v1`, `seed_v1`, `tractor_v1`, `credit_card_v1` |
| **`concept`** | Non-physical abstractions represented using approved Swallern visual metaphors. | `concept_data_particles_v1`, `concept_network_nodes_v1`, `concept_energy_flow_v1`, `concept_growth_stages_v1` |
| **`environment`** | Reusable contextual settings and scene locations. | `env_classroom_v1`, `env_data_center_v1`, `env_farm_field_v1`, `env_laboratory_v1` |
| **`diagram`** | Structured educational flows, cycles, timelines, comparisons, and system maps. | `diagram_water_cycle_v1`, `diagram_internet_request_v1` |
| **`background`** | Calm, low-contrast canvas backdrops that never compete with focal educational content. | `bg_plain_canvas_v1`, `bg_soft_gradient_v1`, `bg_tech_grid_v1` |
| **`ambient`** | Subtle atmospheric environmental accents supporting classroom feel. | `ambient_cloud_v1`, `ambient_star_v1`, `ambient_plant_v1`, `ambient_wall_note_v1` |
| **`symbol`** | Pedagogical visual elements used inside diagrams (distinct from application UI buttons). | `symbol_flow_arrow_v1`, `symbol_success_check_v1`, `symbol_warning_alert_v1` |

---

## 4. Master Category Taxonomy & Domain Model

The taxonomy defines 30 master categories (`VisualCategory`) in [`lib/visuals/categories.ts`](file:///home/ameetech/Desktop/swallern/lib/visuals/categories.ts). Each category supports an extensible, nested domain model (`VisualDomain`):

1. `technology` (Computers, Hardware, Software, Programming, Internet, Networking, Cybersecurity, Cloud, Robotics, Electronics, Telecom)
2. `artificial_intelligence` (Machine Learning, Deep Learning, Generative AI, Computer Vision, NLP, Speech, AI Agents, Datasets, Safety)
3. `science` (Physics, Chemistry, Biology, Laboratory, Scientific Method)
4. `nature_environment` (Wildlife, Botany, Ecosystems, Climate, Conservation)
5. `agriculture` (Crops, Soil, Irrigation, Livestock, Machinery, Greenhouse, AgTech)
6. `business` (Management, Operations, Marketing, Commerce, Workplace)
7. `finance_economics` (Banking, Markets, Macroeconomics, Personal Finance)
8. `health` (Nutrition, Fitness, Mental Health)
9. `medicine` (Clinical Care, Anatomy, Pharmaceuticals)
10. `engineering` (Mechanical, Civil, Electrical)
11. `energy` (Renewable, Power Grid & Storage)
12. `transportation` (Road Vehicles, Rail/Air/Sea Transit)
13. `space` (Astronomy, Spaceflight)
14. `geography` (Physical Geography, Cartography)
15. `history` (Ancient Eras, Modern History)
16. `government_civics` (Civic Systems & Law)
17. `education` (Classroom & Tools, Pedagogy)
18. `mathematics` (Geometry & Algebra, Probability & Stats)
19. `arts_design` (Visual Art, Graphic Design)
20. `music` (Instruments & Theory)
21. `literature_language` (Storytelling & Writing)
22. `psychology` (Cognition & Emotion)
23. `society_culture` (Community & Traditions)
24. `food_cooking` (Culinary Preparation)
25. `architecture_construction` (Architectural Design & Build)
26. `manufacturing_industry` (Industrial Production)
27. `communication_media` (Broadcasting & Media Systems)
28. `everyday_life` (Home & Daily Items)
29. `sports_games` (Sports & Strategic Games)
30. `travel_exploration` (Expeditions & Travel)

---

## 5. Asset Lifecycle & Status Transitions

Assets transition through formal lifecycle states (`VisualAssetStatus`):

```text
planned ──> generated ──> review ──> approved ──> active
                                                    │
                                                    └──> deprecated
```

* **`planned`**: Outlined in foundational manifests with prompt directives and metadata.
* **`generated`**: Visual medium created by generator pipeline.
* **`review`**: Undergoing automated Brand QA and human verification.
* **`approved`**: Verified against the 6-pillar Golden Rule standard.
* **`active`**: Available for immediate resolution and assembly in lessons.
* **`deprecated`**: Superseded by a newer major asset version.

---

## 6. Semantic IDs & Versioning Rules

Asset and composition IDs are **semantic identifiers**, never raw file paths or arbitrary hashes.

* **Asset ID Convention**: `<name>_v<major>` (e.g. `laptop_v1`, `router_v1`) or `<category>_<domain>_<name>_v<major>` (e.g. `technology_networking_router_v1`).
* **Multi-Category Association**: Assets are defined once with multi-category tags. For example, `laptop_v1` has `categoryIds: ['technology', 'business', 'education', 'everyday_life']`. Do **not** create duplicate `business_laptop` and `education_laptop` files.
* **Aliases**: Assets define search aliases (e.g. `router_v1` defines `aliases: ['wifi router', 'wireless router', 'network gateway']`).

---

## 7. How to Add a New Asset

To register a new canonical asset:

1. Locate or create the entry in the corresponding family module (`lib/visuals/objects.ts`, `concepts.ts`, etc.) or manifest.
2. Define the strongly-typed `VisualAsset` schema:

```ts
import { VisualAsset } from '@/lib/visuals/assets';
import { SWALLERN_VISUAL_STYLE_V1 } from '@/lib/visuals/tokens';

export const SOLAR_PANEL_ASSET: VisualAsset = {
  id: 'solar_panel_v1',
  version: '1.0',
  name: 'solar_panel',
  displayName: 'Photovoltaic Solar Panel',
  family: 'object',
  categoryIds: ['energy', 'engineering', 'nature_environment'],
  domainIds: ['renewable', 'electrical'],
  tags: ['solar', 'energy', 'photovoltaic', 'clean_energy', 'panel'],
  aliases: ['solar cell', 'pv panel', 'solar array'],
  visualStyle: SWALLERN_VISUAL_STYLE_V1,
  assetType: 'illustration',
  source: 'curated_builtin',
  status: 'active',
  reusable: true,
  complexity: 'simple',
  compatibleWith: ['ambient_sun_v1', 'concept_energy_flow_v1', 'battery_v1'],
  description: 'Angled blue photovoltaic panel capturing golden sunlight beams.',
  defaultColor: '#3B82F6',
};
```

3. Register with the Master Visual Registry:

```ts
import { masterVisualRegistry } from '@/lib/visuals/registry';
masterVisualRegistry.registerAsset(SOLAR_PANEL_ASSET);
```

4. Validate the asset:

```ts
import { validateVisualAsset } from '@/lib/visuals/qa';
const { isValid, errors } = validateVisualAsset(SOLAR_PANEL_ASSET);
```

---

## 8. How to Add a New Category or Domain

To extend the category taxonomy, add the definition to `MASTER_VISUAL_CATEGORIES` in [`lib/visuals/categories.ts`](file:///home/ameetech/Desktop/swallern/lib/visuals/categories.ts):

```ts
export const MASTER_VISUAL_CATEGORIES: Record<string, VisualCategory> = {
  // ...
  astronomy_advanced: {
    id: 'astronomy_advanced',
    name: 'Advanced Astronomy',
    displayName: 'Deep Space Astrophysics',
    description: 'Black holes, gravitational lensing, and cosmic radiation',
    icon: '🔭',
    primaryColor: '#6366F1',
    accentColor: '#4338CA',
    order: 31,
    tags: ['astrophysics', 'space', 'gravity', 'cosmology'],
    domains: [
      {
        id: 'gravitational_lensing',
        categoryId: 'astronomy_advanced',
        name: 'Gravitational Lensing',
        displayName: 'Gravitational Lensing & Warping',
        description: 'Light bending around massive galactic clusters',
        tags: ['light', 'gravity', 'lensing', 'relativity'],
      },
    ],
  },
};
```

---

## 9. Compositions: Referencing & Assembling Assets

Compositions assemble multiple assets into educational scenes or diagrams without duplicating code.

```ts
import { VisualComposition } from '@/lib/visuals/compositions';

export const WIFI_COMPOSITION: VisualComposition = {
  id: 'how_wifi_works_v1',
  version: '1.0',
  name: 'how_wifi_works',
  title: 'How Wi-Fi Works',
  type: 'process',
  complexity: 'explainer',
  categoryIds: ['technology', 'education'],
  tags: ['wifi', 'wireless', 'internet', 'router', 'laptop'],
  status: 'approved',
  reusable: true,
  layout: {
    type: 'flow_horizontal',
    direction: 'ltr',
    backgroundId: 'bg_plain_canvas_v1',
    overlayText: ['Laptop Request', 'Wi-Fi Broadcast', 'Router Relay'],
  },
  assets: [
    { assetId: 'laptop_v1', role: 'focal', position: { x: 15, y: 50 }, scale: 1.0, zIndex: 2 },
    { assetId: 'symbol_flow_arrow_v1', role: 'connector', position: { x: 35, y: 50 }, scale: 0.8, zIndex: 1 },
    { assetId: 'router_v1', role: 'focal', position: { x: 50, y: 50 }, scale: 1.1, zIndex: 3 },
    { assetId: 'symbol_flow_arrow_v1', role: 'connector', position: { x: 65, y: 50 }, scale: 0.8, zIndex: 1 },
    { assetId: 'server_v1', role: 'supporting', position: { x: 85, y: 50 }, scale: 1.0, zIndex: 2 },
  ],
};
```

---

## 10. Lesson Visual Resolution Pipeline

When a lesson generator requires a visual, it requests educational intent (`VisualRequirement`) rather than an image URL:

```text
Lesson Generator
    ↓
Visual Requirement ({ concept: "wifi_connection", category: "technology", requiredAssets: ["router", "laptop"] })
    ↓
masterVisualRegistry.resolveVisualRequirement(req)
    ↓
Check Existing Compositions ──(Found)──> Return 'how_wifi_works_v1'
    │ (Not Found)
    ↓
Check Individual Assets ──(All Found)──> Assemble 'assemble_from_assets'
    │ (Missing)
    ↓
Dispatch Generation Manifest Request ──> Human/QA Review ──> Active Asset
```

### Code Example:
```ts
import { buildVisualRequirement } from '@/lib/visuals/requirements';
import { resolveVisualRequirement } from '@/lib/visuals/registry';

const req = buildVisualRequirement('How Wi-Fi Works', 'Wireless data transmission', {
  category: 'technology',
  requiredAssets: ['router_v1', 'laptop_v1'],
});

const resolution = resolveVisualRequirement(req);

if (resolution.recommendation === 'use_existing_composition') {
  console.log(`Using approved composition: ${resolution.matchingComposition?.title}`);
} else if (resolution.recommendation === 'assemble_from_assets') {
  console.log(`Assembled ${resolution.matchedAssets.length} canonical assets`);
} else {
  console.log(`Needs generation for: ${resolution.missingAssetConcepts.join(', ')}`);
}
```

---

## 11. Visual QA & Golden Rule Compliance

Every visual asset and composition is verified against the **6 Brand QA Pillars** ([`lib/visuals/qa.ts`](file:///home/ameetech/Desktop/swallern/lib/visuals/qa.ts)):

1. **Style**: Strictly adheres to Swallern v1 soft geometry vector standard.
2. **Consistency**: Seamlessly belongs beside existing visual assets (passes the Golden Rule test).
3. **Clarity**: Educational concept is immediately discernible without cognitive friction.
4. **Scalability**: Clean silhouettes maintain legibility at compact thumbnail sizes.
5. **Reusability**: Designed to be referenced across multiple lessons.
6. **Educational Usefulness**: Directly supports curriculum learning objectives.
