'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { loadSwaModel, cloneSwaScene } from './SwaLoader';
import { SwaController } from './SwaController';
import { SwaAnimation, SwaExpression, SwaReaction } from './SwaTypes';

interface SwaSceneProps {
  expression: SwaExpression;
  animation: SwaAnimation;
  reaction?: SwaReaction | null;
  float: boolean;
  autoRotate: boolean;
  reducedMotion: boolean;
  playbackSpeed?: number;
  modelUrl?: string;
  cameraDistance?: number;
  cameraHeight?: number;
  showSkeletonHelper?: boolean;
  onReactionComplete?: () => void;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

export const SwaScene: React.FC<SwaSceneProps> = ({
  expression,
  animation,
  reaction,
  float,
  autoRotate,
  reducedMotion,
  playbackSpeed = 1.0,
  modelUrl,
  cameraDistance = 1.0,
  cameraHeight = 0.95,
  showSkeletonHelper = false,
  onReactionComplete,
  onLoaded,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SwaController | null>(null);

  // Keep latest props in refs to avoid recreation on every prop change
  const propsRef = useRef({
    expression,
    animation,
    reaction,
    float,
    autoRotate,
    reducedMotion,
    playbackSpeed,
    onReactionComplete,
  });

  useEffect(() => {
    propsRef.current = {
      expression,
      animation,
      reaction,
      float,
      autoRotate,
      reducedMotion,
      playbackSpeed,
      onReactionComplete,
    };
  }, [
    expression,
    animation,
    reaction,
    float,
    autoRotate,
    reducedMotion,
    playbackSpeed,
    onReactionComplete,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let animationFrameId: number;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Standard framing for Swa v2 (1.70m tall, centered at chest/head)
    camera.position.set(0, cameraHeight, 3.4 * cameraDistance);
    camera.lookAt(0, 0.85, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 2. Studio 3-Point Lighting for Swallern Quality
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.95);
    scene.add(ambientLight);

    // Key Light (Warm Front-Right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2.5, 3.5, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light (Cool Front-Left)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.7);
    fillLight.position.set(-2.5, 1.5, 2.0);
    scene.add(fillLight);

    // Rim Light (Teal Silhouette Backlight)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(0, 2.5, -3.0);
    scene.add(rimLight);

    // 3. Ground Contact Shadow Disk
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.12)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // 4. Model Loading & Instantiation
    let modelRoot: THREE.Group | null = null;
    let skeletonHelper: THREE.SkeletonHelper | null = null;

    loadSwaModel(modelUrl)
      .then((data) => {
        if (!isMounted) return;

        modelRoot = cloneSwaScene(data.originalScene);

        // Ground the model so feet rest cleanly at Y = 0
        modelRoot.position.set(0, 0, 0);

        scene.add(modelRoot);

        // Optional Skeleton Wireframe Helper for live rig inspection
        if (showSkeletonHelper) {
          skeletonHelper = new THREE.SkeletonHelper(modelRoot);
          scene.add(skeletonHelper);
        }

        // Instantiate behavior controller with AnimationMixer & procedural motions
        const controller = new SwaController(modelRoot, data.animations);
        controllerRef.current = controller;

        onLoaded?.();
      })
      .catch((err) => {
        if (!isMounted) return;
        onError?.(err);
      });

    // 5. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth || 200;
      const height = container.clientHeight || 200;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // 6. Render Loop (Calm, stable, no mouse tracking)
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (controllerRef.current) {
        const p = propsRef.current;
        controllerRef.current.update({
          expression: p.expression,
          animation: p.animation,
          reaction: p.reaction,
          float: p.float,
          autoRotate: p.autoRotate,
          reducedMotion: p.reducedMotion,
          playbackSpeed: p.playbackSpeed,
          onReactionComplete: p.onReactionComplete,
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup & Resource Disposal
    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      if (controllerRef.current) {
        controllerRef.current.dispose();
      }

      if (skeletonHelper) {
        scene.remove(skeletonHelper);
        skeletonHelper.geometry.dispose();
        if (Array.isArray(skeletonHelper.material)) {
          skeletonHelper.material.forEach((m) => m.dispose());
        } else {
          skeletonHelper.material.dispose();
        }
      }

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      renderer.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();

      if (modelRoot) {
        modelRoot.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
          }
        });
      }
    };
  }, [modelUrl, cameraDistance, cameraHeight]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    />
  );
};
