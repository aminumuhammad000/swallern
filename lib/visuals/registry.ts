/**
 * Swallern Visual System v1 — Master Visual Asset Registry
 * Central registry and semantic search engine indexing all approved categories,
 * domains, assets, and compositions.
 * Enables lesson generators to resolve semantic requirements to reusable assets.
 */

import { VisualAsset, VisualAssetFamily, VisualAssetStatus } from './assets';
import { VisualComposition, CANONICAL_COMPOSITIONS } from './compositions';
import { MASTER_VISUAL_CATEGORIES, VisualCategory, VisualDomain } from './categories';
import { SWALLERN_BEAR_ASSET } from './characters';
import { CANONICAL_OBJECT_ASSETS } from './objects';
import { CANONICAL_CONCEPT_ASSETS } from './concepts';
import { CANONICAL_ENVIRONMENT_ASSETS } from './environments';
import { CANONICAL_BACKGROUND_ASSETS } from './backgrounds';
import { CANONICAL_DIAGRAM_ASSETS } from './diagrams';
import { CANONICAL_AMBIENT_ASSETS } from './ambient';
import { CANONICAL_SYMBOL_ASSETS } from './symbols';
import { VisualComplexity } from './tokens';
import { VisualRequirement } from './requirements';

export interface VisualAssetQuery {
  category?: string;
  domain?: string;
  tags?: string[];
  family?: VisualAssetFamily;
  status?: VisualAssetStatus;
  reusable?: boolean;
  query?: string;
  complexity?: VisualComplexity;
  limit?: number;
}

export interface VisualCompositionQuery {
  category?: string;
  domain?: string;
  tags?: string[];
  type?: string;
  status?: string;
  query?: string;
  limit?: number;
}

export interface RequirementResolutionResult {
  isSatisfied: boolean;
  matchingComposition?: VisualComposition;
  matchedAssets: VisualAsset[];
  missingAssetConcepts: string[];
  recommendation: 'use_existing_composition' | 'assemble_from_assets' | 'generate_new_assets';
}

export class MasterVisualRegistry {
  private assetsById: Map<string, VisualAsset> = new Map();
  private aliasMap: Map<string, string> = new Map();
  private compositionsById: Map<string, VisualComposition> = new Map();

  constructor() {
    this.seedInitialLibrary();
  }

  private seedInitialLibrary(): void {
    // Register Mascot
    this.registerAsset(SWALLERN_BEAR_ASSET);

    // Register Objects
    for (const obj of CANONICAL_OBJECT_ASSETS) {
      this.registerAsset(obj);
    }

    // Register Concepts
    for (const concept of CANONICAL_CONCEPT_ASSETS) {
      this.registerAsset(concept);
    }

    // Register Environments
    for (const env of CANONICAL_ENVIRONMENT_ASSETS) {
      this.registerAsset(env);
    }

    // Register Backgrounds
    for (const bg of CANONICAL_BACKGROUND_ASSETS) {
      this.registerAsset(bg);
    }

    // Register Diagrams
    for (const diagram of CANONICAL_DIAGRAM_ASSETS) {
      this.registerAsset(diagram);
    }

    // Register Ambient
    for (const amb of CANONICAL_AMBIENT_ASSETS) {
      this.registerAsset(amb);
    }

    // Register Symbols
    for (const sym of CANONICAL_SYMBOL_ASSETS) {
      this.registerAsset(sym);
    }

    // Register Compositions
    for (const comp of CANONICAL_COMPOSITIONS) {
      this.registerComposition(comp);
    }
  }

  /**
   * Register a new Visual Asset into the system
   */
  public registerAsset(asset: VisualAsset): void {
    this.assetsById.set(asset.id, asset);

    // Index canonical name
    this.aliasMap.set(asset.name.toLowerCase(), asset.id);
    this.aliasMap.set(asset.displayName.toLowerCase(), asset.id);

    // Index aliases
    if (asset.aliases) {
      for (const alias of asset.aliases) {
        this.aliasMap.set(alias.toLowerCase(), asset.id);
      }
    }
  }

  /**
   * Register a new Visual Composition into the system
   */
  public registerComposition(composition: VisualComposition): void {
    this.compositionsById.set(composition.id, composition);
  }

  /**
   * Retrieve asset directly by ID or alias
   */
  public getAssetById(idOrAlias: string): VisualAsset | undefined {
    if (this.assetsById.has(idOrAlias)) {
      return this.assetsById.get(idOrAlias);
    }
    const resolvedId = this.aliasMap.get(idOrAlias.toLowerCase());
    if (resolvedId && this.assetsById.has(resolvedId)) {
      return this.assetsById.get(resolvedId);
    }
    return undefined;
  }

  /**
   * Retrieve composition directly by ID
   */
  public getCompositionById(id: string): VisualComposition | undefined {
    return this.compositionsById.get(id);
  }

  /**
   * Returns all registered assets
   */
  public getAllAssets(): VisualAsset[] {
    return Array.from(this.assetsById.values());
  }

  /**
   * Returns all registered compositions
   */
  public getAllCompositions(): VisualComposition[] {
    return Array.from(this.compositionsById.values());
  }

  /**
   * Query & filter visual assets based on semantic criteria
   */
  public findVisualAssets(query: VisualAssetQuery): VisualAsset[] {
    let results = Array.from(this.assetsById.values());

    if (query.family) {
      results = results.filter(a => a.family === query.family);
    }

    if (query.category) {
      results = results.filter(a => a.categoryIds.includes(query.category!));
    }

    if (query.domain) {
      results = results.filter(a => a.domainIds?.includes(query.domain!));
    }

    if (query.status) {
      results = results.filter(a => a.status === query.status);
    }

    if (query.reusable !== undefined) {
      results = results.filter(a => a.reusable === query.reusable);
    }

    if (query.complexity) {
      results = results.filter(a => a.complexity === query.complexity);
    }

    if (query.tags && query.tags.length > 0) {
      const lowerTags = query.tags.map(t => t.toLowerCase());
      results = results.filter(a => 
        a.tags.some(tag => lowerTags.includes(tag.toLowerCase()))
      );
    }

    if (query.query) {
      const search = query.query.toLowerCase().trim();
      results = results.filter(a => {
        const idMatch = a.id.toLowerCase().includes(search);
        const nameMatch = a.displayName.toLowerCase().includes(search);
        const tagMatch = a.tags.some(t => t.toLowerCase().includes(search));
        const aliasMatch = a.aliases?.some(al => al.toLowerCase().includes(search));
        const descMatch = a.description?.toLowerCase().includes(search);
        return idMatch || nameMatch || tagMatch || aliasMatch || descMatch;
      });
    }

    if (query.limit && query.limit > 0) {
      return results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Query & filter visual compositions
   */
  public findVisualCompositions(query: VisualCompositionQuery): VisualComposition[] {
    let results = Array.from(this.compositionsById.values());

    if (query.category) {
      results = results.filter(c => c.categoryIds.includes(query.category!));
    }

    if (query.domain) {
      results = results.filter(c => c.domainIds?.includes(query.domain!));
    }

    if (query.type) {
      results = results.filter(c => c.type === query.type);
    }

    if (query.status) {
      results = results.filter(c => c.status === query.status);
    }

    if (query.tags && query.tags.length > 0) {
      const lowerTags = query.tags.map(t => t.toLowerCase());
      results = results.filter(c =>
        c.tags.some(tag => lowerTags.includes(tag.toLowerCase()))
      );
    }

    if (query.query) {
      const search = query.query.toLowerCase().trim();
      results = results.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search) ||
        c.tags.some(t => t.toLowerCase().includes(search)) ||
        c.description?.toLowerCase().includes(search)
      );
    }

    if (query.limit && query.limit > 0) {
      return results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Resolve a high-level educational VisualRequirement into existing assets/compositions
   */
  public resolveVisualRequirement(req: VisualRequirement): RequirementResolutionResult {
    // 1. Check if an exact or strong matching composition already exists
    const matchingCompositions = this.findVisualCompositions({
      category: req.category,
      query: req.concept || req.subject,
      status: 'approved',
    });

    if (matchingCompositions.length > 0) {
      const bestComposition = matchingCompositions[0];
      const matchedAssets: VisualAsset[] = [];
      for (const item of bestComposition.assets) {
        const asset = this.getAssetById(item.assetId);
        if (asset) matchedAssets.push(asset);
      }
      return {
        isSatisfied: true,
        matchingComposition: bestComposition,
        matchedAssets,
        missingAssetConcepts: [],
        recommendation: 'use_existing_composition',
      };
    }

    // 2. Resolve individual required assets
    const matchedAssets: VisualAsset[] = [];
    const missingAssetConcepts: string[] = [];

    const assetTokensToFind = req.requiredAssets || [req.subject];

    for (const concept of assetTokensToFind) {
      const asset = this.getAssetById(concept);
      if (asset) {
        matchedAssets.push(asset);
      } else {
        const searchMatches = this.findVisualAssets({
          query: concept,
          category: req.category,
          status: 'active',
          limit: 1,
        });

        if (searchMatches.length > 0) {
          matchedAssets.push(searchMatches[0]);
        } else {
          missingAssetConcepts.push(concept);
        }
      }
    }

    // Add optional mascot if specified
    if (req.characterId) {
      const charAsset = this.getAssetById(req.characterId);
      if (charAsset && !matchedAssets.some(a => a.id === charAsset.id)) {
        matchedAssets.push(charAsset);
      }
    }

    if (missingAssetConcepts.length === 0 && matchedAssets.length > 0) {
      return {
        isSatisfied: true,
        matchedAssets,
        missingAssetConcepts: [],
        recommendation: 'assemble_from_assets',
      };
    }

    return {
      isSatisfied: false,
      matchedAssets,
      missingAssetConcepts,
      recommendation: 'generate_new_assets',
    };
  }
}

/**
 * Singleton Master Visual Registry Instance
 */
export const masterVisualRegistry = new MasterVisualRegistry();

/**
 * Convenience helper functions
 */
export function findVisualAssets(query: VisualAssetQuery): VisualAsset[] {
  return masterVisualRegistry.findVisualAssets(query);
}

export function findVisualCompositions(query: VisualCompositionQuery): VisualComposition[] {
  return masterVisualRegistry.findVisualCompositions(query);
}

export function getVisualAsset(idOrAlias: string): VisualAsset | undefined {
  return masterVisualRegistry.getAssetById(idOrAlias);
}

export function getVisualComposition(id: string): VisualComposition | undefined {
  return masterVisualRegistry.getCompositionById(id);
}

export function resolveVisualRequirement(req: VisualRequirement): RequirementResolutionResult {
  return masterVisualRegistry.resolveVisualRequirement(req);
}
