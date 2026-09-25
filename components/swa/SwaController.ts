import * as THREE from 'three';
import {
  SwaAnimation,
  SwaExpression,
  SwaReaction,
  SwaClipName,
  SWA_REACTIONS,
} from './SwaTypes';

/**
 * Maps logical Swallern animation states to actual GLTF animation clips in swa_v2.glb
 * (canonical asset: Meshy_AI_Twinklefin_All_Animations.glb).
 *
 * Real clips contained in the GLB:
 *  - "Running"  (0.67s cycle, 56 keyframe tracks animating all 28 joints)
 *  - "Walking"  (1.04s cycle, 56 keyframe tracks animating all 28 joints)
 *  - "restpose" (0.08s clip, 56 keyframe tracks)
 */
export const SWA_CLIP_MAP: Record<string, SwaClipName> = {
  // ── Movement clips (only these two should move Swa's legs) ──
  run:      'Running',
  Running:  'Running',
  walk:     'Walking',
  Walking:  'Walking',

  // ── Still / calm states → stand in rest pose ──
  idle:      'restpose',
  rest:      'restpose',
  restpose:  'restpose',
  happy:     'restpose',
  excited:   'restpose',
  celebrate: 'restpose',
  curious:   'restpose',
  thinking:  'restpose',
  wave:      'restpose',
  point:     'restpose',
  discover:  'restpose',
};

export interface SwaControllerConfig {
  expression: SwaExpression;
  animation: SwaAnimation;
  reaction?: SwaReaction | null;
  float: boolean;
  autoRotate: boolean;
  reducedMotion: boolean;
  playbackSpeed: number;
  onReactionComplete?: () => void;
}

export class SwaController {
  private root: THREE.Object3D;
  private mixer?: THREE.AnimationMixer;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private currentAction?: THREE.AnimationAction;
  private currentClipName: string = 'restpose';
  private clock = new THREE.Clock();

  // Root base transform for positioning in local scene
  private basePosition = new THREE.Vector3(0, 0, 0);

  // Skeletal bone references for Swa rig (Mixamo hierarchy)
  private hipsBone?: THREE.Bone;
  private spineBone?: THREE.Bone;
  private spine2Bone?: THREE.Bone;
  private neckBone?: THREE.Bone;
  private headBone?: THREE.Bone;
  private leftArmBone?: THREE.Bone;
  private rightArmBone?: THREE.Bone;
  private leftForeArmBone?: THREE.Bone;
  private rightForeArmBone?: THREE.Bone;
  private leftLegBone?: THREE.Bone;
  private rightLegBone?: THREE.Bone;

  // Stored rest bind-pose quaternions
  private restHeadQuat = new THREE.Quaternion();
  private restNeckQuat = new THREE.Quaternion();

  // Scratch objects for zero-allocation math
  private deltaEuler = new THREE.Euler();
  private deltaQuat = new THREE.Quaternion();

  // State Machine for Educational Reactions
  private activeReaction: SwaReaction | null = null;
  private reactionTimer: number = 0;
  private reactionDuration: number = 0;

  // Cached bone names for inspector
  private discoveredBoneNames: string[] = [];

  constructor(root: THREE.Object3D, animations: THREE.AnimationClip[] = []) {
    this.root = root;
    this.basePosition.copy(root.position);

    // Initialize AnimationMixer on the root object
    if (animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(root);
      animations.forEach((clip) => {
        const action = this.mixer!.clipAction(clip);
        action.setEffectiveWeight(1);
        action.setEffectiveTimeScale(1);
        this.actions.set(clip.name, action);
      });
    }

    // Traverse and locate bones (supporting both sanitized and unsanitized names)
    root.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const name = child.name;
        this.discoveredBoneNames.push(name);

        if (name === 'mixamorigHips' || name === 'mixamorig:Hips' || name === 'Hips') {
          this.hipsBone = child;
        } else if (name === 'mixamorigSpine' || name === 'mixamorig:Spine' || name === 'Spine') {
          this.spineBone = child;
        } else if (name === 'mixamorigSpine2' || name === 'mixamorig:Spine2' || name === 'Spine2') {
          this.spine2Bone = child;
        } else if (name === 'mixamorigNeck' || name === 'mixamorig:Neck' || name === 'Neck') {
          this.neckBone = child;
          this.restNeckQuat.copy(child.quaternion);
        } else if (name === 'mixamorigHead' || name === 'mixamorig:Head' || name === 'Head') {
          this.headBone = child;
          this.restHeadQuat.copy(child.quaternion);
        } else if (name === 'mixamorigLeftArm' || name === 'mixamorig:LeftArm' || name === 'LeftArm') {
          this.leftArmBone = child;
        } else if (name === 'mixamorigRightArm' || name === 'mixamorig:RightArm' || name === 'RightArm') {
          this.rightArmBone = child;
        } else if (name === 'mixamorigLeftForeArm' || name === 'mixamorig:LeftForeArm' || name === 'LeftForeArm') {
          this.leftForeArmBone = child;
        } else if (name === 'mixamorigRightForeArm' || name === 'mixamorig:RightForeArm' || name === 'RightForeArm') {
          this.rightForeArmBone = child;
        } else if (name === 'mixamorigLeftLeg' || name === 'mixamorig:LeftLeg' || name === 'mixamorigLeftUpLeg') {
          this.leftLegBone = child;
        } else if (name === 'mixamorigRightLeg' || name === 'mixamorig:RightLeg' || name === 'mixamorigRightUpLeg') {
          this.rightLegBone = child;
        }
      }
    });

    // Start with rest pose (standing still)
    const initialClip = this.actions.has('restpose') ? 'restpose' : 'Walking';
    this.playClip(initialClip, 0.1);
  }

  /**
   * Smoothly cross-fades into a target skeletal animation clip.
   */
  public playClip(clipName: string, fadeDuration: number = 0.25): void {
    if (!this.mixer) return;
    const nextAction = this.actions.get(clipName);
    if (!nextAction) return;

    if (this.currentAction === nextAction && nextAction.isRunning()) {
      return;
    }

    const prevAction = this.currentAction;
    this.currentAction = nextAction;
    this.currentClipName = clipName;

    nextAction.reset();
    nextAction.setEffectiveWeight(1);
    if (clipName === 'restpose') {
      nextAction.setLoop(THREE.LoopOnce, 0);
      nextAction.clampWhenFinished = true;
    } else {
      nextAction.setLoop(THREE.LoopRepeat, Infinity);
      nextAction.clampWhenFinished = false;
    }
    nextAction.fadeIn(fadeDuration);
    nextAction.play();

    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(fadeDuration);
    }
  }

  /**
   * Trigger an educational learning reaction.
   */
  public triggerReaction(reaction: SwaReaction): void {
    this.activeReaction = reaction;
    const config = SWA_REACTIONS[reaction];
    this.reactionDuration = (config?.durationMs ?? 2500) / 1000;
    this.reactionTimer = 0;

    if (config?.clip) {
      this.playClip(config.clip, 0.2);
    }
  }

  /**
   * Main per-frame animation tick.
   * Advances the AnimationMixer to drive individual bones (legs, arms, head, spine)
   * while keeping world positioning clean and decoupled.
   */
  public update(config: SwaControllerConfig): void {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Check for new reaction trigger
    if (config.reaction && config.reaction !== this.activeReaction) {
      this.triggerReaction(config.reaction);
    }

    // 2. Handle active reaction timer or baseline animation
    let effectiveExpression = config.expression;
    let targetClipName: string;
    let speedModifier = 1.0;

    if (this.activeReaction) {
      this.reactionTimer += delta;
      const reactionCfg = SWA_REACTIONS[this.activeReaction];
      if (reactionCfg) {
        effectiveExpression = reactionCfg.expression;
        targetClipName = reactionCfg.clip || 'restpose';
      } else {
        targetClipName = 'restpose';
      }
      speedModifier = 1.25;

      if (this.reactionTimer >= this.reactionDuration) {
        // Reaction finished, return to baseline animation
        this.activeReaction = null;
        this.reactionTimer = 0;
        config.onReactionComplete?.();

        const baselineClip = SWA_CLIP_MAP[config.animation] || 'restpose';
        this.playClip(baselineClip, 0.35);
      }
    } else {
      // Normal animation state
      targetClipName = SWA_CLIP_MAP[config.animation] || 'restpose';

      // Adjust animation speed based on state
      if (config.animation === 'idle') {
        speedModifier = 0.65;
      } else if (config.animation === 'run') {
        speedModifier = 1.25;
      } else if (config.animation === 'celebrate' || config.animation === 'excited') {
        speedModifier = 1.35;
      }

      this.playClip(targetClipName, 0.25);
    }

    // 3. Update AnimationMixer timescale and step delta
    if (this.mixer) {
      const baseSpeed = config.playbackSpeed || 1.0;
      this.mixer.timeScale = config.reducedMotion ? 0.2 : baseSpeed * speedModifier;
      this.mixer.update(delta);
    }

    // 5. Ground positioning (stable and grounded, no floating or spinning)
    this.root.position.copy(this.basePosition);
    this.root.rotation.set(0, 0, 0);
  }

  // ─── INSPECTION TELEMETRY HELPERS ───

  public getClipNames(): string[] {
    return Array.from(this.actions.keys());
  }

  public getCurrentClipName(): string {
    return this.currentClipName;
  }

  public getDiscoveredBones(): string[] {
    return this.discoveredBoneNames;
  }

  public getLiveBoneTelemetry() {
    return {
      hips: {
        pos: this.hipsBone ? this.hipsBone.position.toArray() : [0, 0, 0],
        rot: this.hipsBone ? this.hipsBone.quaternion.toArray() : [0, 0, 0, 1],
      },
      head: {
        rot: this.headBone ? this.headBone.quaternion.toArray() : [0, 0, 0, 1],
      },
      leftArm: {
        rot: this.leftArmBone ? this.leftArmBone.quaternion.toArray() : [0, 0, 0, 1],
      },
      rightArm: {
        rot: this.rightArmBone ? this.rightArmBone.quaternion.toArray() : [0, 0, 0, 1],
      },
      leftLeg: {
        rot: this.leftLegBone ? this.leftLegBone.quaternion.toArray() : [0, 0, 0, 1],
      },
      rightLeg: {
        rot: this.rightLegBone ? this.rightLegBone.quaternion.toArray() : [0, 0, 0, 1],
      },
    };
  }

  public dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}
