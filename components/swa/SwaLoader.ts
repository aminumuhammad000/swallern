import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

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
 * Loads and caches the canonical Swa GLB model (swa_v2.glb / Meshy_AI_Twinklefin_All_Animations.glb).
 * Sanitizes bone node names and animation track names so Three.js PropertyBinding binds all 28 joints.
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

        // 1. Sanitize all bone and node names in the scene hierarchy (e.g. 'mixamorig:Hips' -> 'mixamorigHips')
        // Three.js PropertyBinding splits on colons ':' as directory delimiters, which breaks track binding if not sanitized.
        scene.traverse((child) => {
          if (child.name && child.name.includes(':')) {
            child.name = THREE.PropertyBinding.sanitizeNodeName(child.name);
          }
        });

        // 2. Sanitize all animation clip tracks to match sanitized bone names
        (gltf.animations || []).forEach((clip) => {
          clip.tracks.forEach((track) => {
            const dotIndex = track.name.lastIndexOf('.');
            if (dotIndex !== -1) {
              const nodePath = track.name.slice(0, dotIndex);
              const propPath = track.name.slice(dotIndex);
              if (nodePath.includes(':')) {
                track.name = THREE.PropertyBinding.sanitizeNodeName(nodePath) + propPath;
              }
            }
          });
        });

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
 * Clones the Swa scene hierarchy using Three.js SkeletonUtils.
 * Ensures that SkinnedMeshes, Skeletons, and AnimationMixers are correctly associated.
 */
export function cloneSwaScene(source: THREE.Group): THREE.Group {
  return SkeletonUtils.clone(source) as THREE.Group;
}
