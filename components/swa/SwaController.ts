import * as THREE from 'three';
import {
  SwaAnimation,
  SwaExpression,
  SwaReaction,
  SwaClipName,
  SWA_REACTIONS,
} from './SwaTypes';

/**
 * Maps logical Swallern animation states to actual GLTF animation clips in swa_v2.glb.
 */
export const SWA_CLIP_MAP: Record<string, SwaClipName> = {
  walk: 'Walking',
  run: 'Running',
  rest: 'restpose',
  Walking: 'Walking',
  Running: 'Running',
  restpose: 'restpose',
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
  private currentClipName?: string;
  private clock = new THREE.Clock();

  // Root base transform
  private basePosition = new THREE.Vector3(0, 0, 0);

  // Skeletal bone references for Swa v2 (Mixamo rig hierarchy)
  private headBone?: THREE.Bone;
  private neckBone?: THREE.Bone;
  private spineBone?: THREE.Bone;
  private spine2Bone?: THREE.Bone;
  private leftArmBone?: THREE.Bone;
  private rightArmBone?: THREE.Bone;
  private leftForeArmBone?: THREE.Bone;
  private rightForeArmBone?: THREE.Bone;

  // Stored rest bind-pose quaternions
  private restHeadQuat = new THREE.Quaternion();
  private restNeckQuat = new THREE.Quaternion();
  private restSpineQuat = new THREE.Quaternion();
  private restSpine2Quat = new THREE.Quaternion();
  private restLeftArmQuat = new THREE.Quaternion();
  private restRightArmQuat = new THREE.Quaternion();
  private restLeftForeArmQuat = new THREE.Quaternion();
  private restRightForeArmQuat = new THREE.Quaternion();

  // Scratch objects for zero-allocation math
  private deltaEuler = new THREE.Euler();
  private deltaQuat = new THREE.Quaternion();

  // State Machine for Educational Reactions
  private activeReaction: SwaReaction | null = null;
  private reactionTimer: number = 0;
  private reactionDuration: number = 0;

  constructor(root: THREE.Object3D, animations: THREE.AnimationClip[] = []) {
    this.root = root;
    this.basePosition.copy(root.position);

    // Initialize AnimationMixer if clips exist
    if (animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(root);
      animations.forEach((clip) => {
        const action = this.mixer!.clipAction(clip);
        this.actions.set(clip.name, action);
      });
    }

    // Locate standard bones in swa_v2.glb
    root.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const name = child.name;
        if (name === 'mixamorig:Head' || name === 'Head' || name === 'Bone_017') {
          this.headBone = child;
          this.restHeadQuat.copy(child.quaternion);
        } else if (name === 'mixamorig:Neck' || name === 'Neck' || name === 'Bone_018') {
          this.neckBone = child;
          this.restNeckQuat.copy(child.quaternion);
        } else if (name === 'mixamorig:Spine' || name === 'Spine') {
          this.spineBone = child;
          this.restSpineQuat.copy(child.quaternion);
        } else if (name === 'mixamorig:Spine2' || name === 'Spine2') {
          this.spine2Bone = child;
          this.restSpine2Quat.copy(child.quaternion);
        } else if (name === 'mixamorig:LeftArm' || name === 'LeftArm') {
          this.leftArmBone = child;
          this.restLeftArmQuat.copy(child.quaternion);
        } else if (name === 'mixamorig:RightArm' || name === 'RightArm') {
          this.rightArmBone = child;
          this.restRightArmQuat.copy(child.quaternion);
        } else if (name === 'mixamorig:LeftForeArm' || name === 'LeftForeArm') {
          this.leftForeArmBone = child;
          this.restLeftForeArmQuat.copy(child.quaternion);
        } else if (name === 'mixamorig:RightForeArm' || name === 'RightForeArm') {
          this.rightForeArmBone = child;
          this.restRightForeArmQuat.copy(child.quaternion);
        }
      }
    });

    // Default to restpose if available
    this.playClip('restpose', 0.1);
  }

  /**
   * Smoothly cross-fades into a target animation clip.
   */
  public playClip(clipName: string, fadeDuration: number = 0.3): void {
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
    nextAction.setEffectiveTimeScale(1);
    nextAction.setEffectiveWeight(1);
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
      this.playClip(config.clip, 0.25);
    }
  }

  /**
   * Main animation tick update.
   */
  public update(config: SwaControllerConfig): void {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.mixer) {
      this.mixer.timeScale = config.playbackSpeed || 1.0;
    }

    // 1. Check for new reaction trigger
    if (config.reaction && config.reaction !== this.activeReaction) {
      this.triggerReaction(config.reaction);
    }

    // 2. Handle active reaction timer
    let effectiveExpression = config.expression;
    let isSkeletalClipActive = false;

    if (this.activeReaction) {
      this.reactionTimer += delta;
      const reactionCfg = SWA_REACTIONS[this.activeReaction];
      if (reactionCfg) {
        effectiveExpression = reactionCfg.expression;
      }

      if (this.reactionTimer >= this.reactionDuration) {
        // Reaction finished, return to baseline animation
        this.activeReaction = null;
        this.reactionTimer = 0;
        config.onReactionComplete?.();

        const baselineClip = SWA_CLIP_MAP[config.animation] || 'restpose';
        this.playClip(baselineClip, 0.4);
      } else {
        isSkeletalClipActive = true;
      }
    } else {
      // Normal animation state
      const targetClip = SWA_CLIP_MAP[config.animation];
      if (targetClip) {
        this.playClip(targetClip, 0.35);
        isSkeletalClipActive = targetClip !== 'restpose';
      } else {
        this.playClip('restpose', 0.4);
      }
    }

    // 3. Advance skeletal mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 4. Reduced Motion: Hold clean, dignified rest posture
    if (config.reducedMotion) {
      this.root.position.copy(this.basePosition);
      this.root.rotation.set(0, 0, 0);

      if (this.headBone) this.headBone.quaternion.copy(this.restHeadQuat);
      if (this.neckBone) this.neckBone.quaternion.copy(this.restNeckQuat);
      if (this.spineBone) this.spineBone.quaternion.copy(this.restSpineQuat);
      if (this.spine2Bone) this.spine2Bone.quaternion.copy(this.restSpine2Quat);
      if (this.leftArmBone) this.leftArmBone.quaternion.copy(this.restLeftArmQuat);
      if (this.rightArmBone) this.rightArmBone.quaternion.copy(this.restRightArmQuat);
      return;
    }

    // 5. Calm Vertical Floating Breath (Organic micro-motion)
    let breathFreq = 1.35;
    let breathAmp = 0.02;

    if (effectiveExpression === 'happy' || effectiveExpression === 'celebrating') {
      breathFreq = 2.4;
      breathAmp = 0.035;
    } else if (effectiveExpression === 'thinking') {
      breathFreq = 1.0;
      breathAmp = 0.015;
    }

    if (config.float) {
      const bob = Math.sin(elapsedTime * breathFreq) * breathAmp;
      this.root.position.y = this.basePosition.y + bob;
    } else {
      this.root.position.y = this.basePosition.y;
    }

    // 6. Subtle Auto-Rotation if enabled
    if (config.autoRotate) {
      this.root.rotation.y = elapsedTime * 0.25;
    } else {
      this.root.rotation.set(0, 0, 0);
    }

    // 7. Layered Procedural Micro-Animations (When not completely driven by running clip)
    if (!isSkeletalClipActive || this.currentClipName === 'restpose') {
      // A. Attentive Head Nodding Cycle
      // A natural 5.2s cycle: gentle thoughtful dip and attentive rise
      const cyclePeriod = 5.2;
      const cycleTime = elapsedTime % cyclePeriod;
      let nodPitch = 0;

      if (cycleTime < 1.3) {
        const t = cycleTime / 1.3;
        nodPitch = Math.sin(t * Math.PI) * Math.sin(t * Math.PI * 2.0) * 0.11;
      } else {
        nodPitch = Math.sin(elapsedTime * breathFreq) * 0.02;
      }

      // B. Expression-driven posture tilts
      let headRoll = 0;
      let headYaw = 0;

      switch (effectiveExpression) {
        case 'curious':
          headRoll = -0.12; // Inquisitive bird tilt
          headYaw = -0.06;
          break;
        case 'thinking':
          headRoll = 0.08;
          nodPitch += 0.06; // Chin up gaze
          break;
        case 'happy':
          nodPitch += Math.sin(elapsedTime * 3.2) * 0.04;
          break;
        case 'celebrating':
          nodPitch += Math.sin(elapsedTime * 4.2) * 0.06;
          headRoll = Math.sin(elapsedTime * 2.8) * 0.07;
          break;
        case 'concerned':
          headRoll = 0.09;
          nodPitch -= 0.05; // Gentle empathetic downward tilt
          break;
        case 'proud':
          nodPitch += 0.07;
          break;
        default:
          break;
      }

      // Apply Head & Neck posture
      if (this.headBone) {
        this.deltaEuler.set(nodPitch, headYaw, headRoll);
        this.deltaQuat.setFromEuler(this.deltaEuler);
        this.headBone.quaternion.copy(this.restHeadQuat).multiply(this.deltaQuat);
      }

      if (this.neckBone) {
        this.deltaEuler.set(nodPitch * 0.45, headYaw * 0.35, headRoll * 0.35);
        this.deltaQuat.setFromEuler(this.deltaEuler);
        this.neckBone.quaternion.copy(this.restNeckQuat).multiply(this.deltaQuat);
      }

      // C. Wing/Arm Settling & Flexion
      let wingFlex = Math.sin(elapsedTime * breathFreq) * 0.05;

      // Subtle feather settle flutter every 4.0s
      if (cycleTime > 3.0 && cycleTime < 3.7) {
        const flutterT = (cycleTime - 3.0) / 0.7;
        wingFlex += Math.sin(flutterT * Math.PI * 3.0) * 0.035;
      }

      if (effectiveExpression === 'celebrating') {
        wingFlex += Math.sin(elapsedTime * 4.0) * 0.14;
      }

      if (this.leftArmBone) {
        this.deltaEuler.set(0, 0, wingFlex);
        this.deltaQuat.setFromEuler(this.deltaEuler);
        this.leftArmBone.quaternion.copy(this.restLeftArmQuat).multiply(this.deltaQuat);
      }

      if (this.rightArmBone) {
        this.deltaEuler.set(0, 0, -wingFlex);
        this.deltaQuat.setFromEuler(this.deltaEuler);
        this.rightArmBone.quaternion.copy(this.restRightArmQuat).multiply(this.deltaQuat);
      }
    }
  }

  public dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}
