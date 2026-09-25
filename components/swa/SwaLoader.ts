import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const SWA_MODEL_URL = '/characters/swa/swa_v2.glb';

export interface SwaModelData {
  gltf: GLTF;
  originalScene: THREE.Group;
  animations: THREE.AnimationClip[];
  boundingBox: THREE.Box3;
  dimensions: THREE.Vector3;
  center: THREE.Vector3;
}

// In-memory cache keyed by model URL
const cachedModelPromises: Map<string, Promise<SwaModelData>> = new Map();

/**
 * Check if WebGL is available in the current browser context.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Loads and caches the canonical Swa GLB model (swa_v2.glb).
 */
export function loadSwaModel(url: string = SWA_MODEL_URL): Promise<SwaModelData> {
  const existing = cachedModelPromises.get(url);
  if (existing) {
    return existing;
  }

  const promise = new Promise<SwaModelData>((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;

        // Compute model bounds and center
        const box = new THREE.Box3().setFromObject(scene);
        const dimensions = new THREE.Vector3();
        box.getSize(dimensions);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Enhance material properties for Swallern visual clarity
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              const mat = child.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.55;
              mat.metalness = 0.15;
              mat.envMapIntensity = 1.0;
            }
          }
        });

        resolve({
          gltf,
          originalScene: scene,
          animations: gltf.animations || [],
          boundingBox: box,
          dimensions,
          center,
        });
      },
      undefined,
      (error) => {
        cachedModelPromises.delete(url);
        console.warn(`[SwaLoader] Failed to load Swa GLB model from ${url}:`, error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    );
  });

  cachedModelPromises.set(url, promise);
  return promise;
}

/**
 * Deep clones the Swa scene hierarchy while sharing geometries & textures.
 * This ensures independent transformations and animation mixers for each Swa instance.
 */
export function cloneSwaScene(source: THREE.Group): THREE.Group {
  const clone = source.clone(true);

  // Map bones from source to clone
  const clonedBones: Record<string, THREE.Bone> = {};
  clone.traverse((child) => {
    if (child instanceof THREE.Bone && child.name) {
      clonedBones[child.name] = child;
    }
  });

  // Re-bind cloned SkinnedMeshes to cloned bones
  clone.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.skeleton) {
      const newBones = child.skeleton.bones.map((b) => clonedBones[b.name] || b);
      child.bind(new THREE.Skeleton(newBones, child.skeleton.boneInverses), child.matrixWorld);
    }
  });

  return clone;
}
