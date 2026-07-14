"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { nodeById } from "@/lib/galaxy/nodes";
import {
  FOCUS_MS,
  RETURN_MS,
  clamp01,
  easeInOutCubic,
  useGalaxyStore,
} from "@/store/galaxy-store";

const BASE_POSITION = new THREE.Vector3(0, 1.2, 26);
const BASE_LOOK = new THREE.Vector3(0, 0.5, -6);

/**
 * Controlled exploration camera: near-imperceptible idle drift, light pointer
 * parallax, limited drag rotation and wheel depth. During selection it flies
 * into the chosen node and back out on return.
 */
export function CameraRig() {
  const gl = useThree((state) => state.gl);

  const rig = useRef({
    depth: 0,
    dragYaw: 0,
    dragPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    look: BASE_LOOK.clone(),
    savedPos: BASE_POSITION.clone(),
    savedLook: BASE_LOOK.clone(),
    returnFromPos: new THREE.Vector3(),
    returnFromLook: new THREE.Vector3(),
    capturedPhase: "" as string,
  });

  const scratch = useMemo(
    () => ({
      desired: new THREE.Vector3(),
      desiredLook: new THREE.Vector3(),
      nodeCenter: new THREE.Vector3(),
      focusEnd: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    const element = gl.domElement;
    const state = rig.current;

    const onWheel = (event: WheelEvent) => {
      if (useGalaxyStore.getState().phase !== "exploring") return;
      state.depth = THREE.MathUtils.clamp(state.depth + event.deltaY * 0.006, -6, 9);
    };
    const onPointerDown = (event: PointerEvent) => {
      state.dragging = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!state.dragging) return;
      if (useGalaxyStore.getState().phase !== "exploring") return;
      state.dragYaw = THREE.MathUtils.clamp(
        state.dragYaw + (event.clientX - state.lastX) * 0.004,
        -1,
        1,
      );
      state.dragPitch = THREE.MathUtils.clamp(
        state.dragPitch + (event.clientY - state.lastY) * 0.003,
        -0.7,
        0.7,
      );
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };
    const onPointerUp = () => {
      state.dragging = false;
    };

    element.addEventListener("wheel", onWheel, { passive: true });
    element.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const { phase, phaseStart, selectedId, reducedMotion } =
      useGalaxyStore.getState();
    const r = rig.current;
    const camera = state.camera;
    const now = performance.now();
    const t = state.clock.elapsedTime;

    // Idle target: slow drift + pointer parallax + drag/wheel offsets
    scratch.desired.set(
      BASE_POSITION.x + Math.sin(t * 0.05) * 0.7 + state.pointer.x * 1.5 + r.dragYaw * 7,
      BASE_POSITION.y + Math.cos(t * 0.04) * 0.45 - state.pointer.y * 0.9 - r.dragPitch * 4,
      BASE_POSITION.z + Math.sin(t * 0.03) * 0.6 + r.depth,
    );
    scratch.desiredLook.set(
      BASE_LOOK.x + state.pointer.x * 0.9 + r.dragYaw * 3,
      BASE_LOOK.y - state.pointer.y * 0.5 - r.dragPitch * 2,
      BASE_LOOK.z,
    );

    if (reducedMotion) {
      camera.position.copy(BASE_POSITION);
      r.look.copy(BASE_LOOK);
      camera.lookAt(r.look);
      return;
    }

    const damp = 1 - Math.exp(-delta * 2.4);

    if (phase === "exploring") {
      r.capturedPhase = "";
      camera.position.lerp(scratch.desired, damp);
      r.look.lerp(scratch.desiredLook, damp);
    } else if (phase === "converging") {
      // Freeze exploration; remember where we left from
      if (r.capturedPhase !== "converging") {
        r.capturedPhase = "converging";
        r.savedPos.copy(camera.position);
        r.savedLook.copy(r.look);
      }
      const node = selectedId ? nodeById.get(selectedId) : null;
      if (node) {
        // Slight anticipation lean toward the node
        scratch.nodeCenter.set(...node.position);
        scratch.desired.copy(r.savedPos).lerp(scratch.nodeCenter, 0.02);
        camera.position.lerp(scratch.desired, damp);
        r.look.lerp(scratch.nodeCenter, damp * 0.4);
      }
    } else if (phase === "focusing" && selectedId) {
      const node = nodeById.get(selectedId);
      if (node) {
        if (r.capturedPhase !== "focusing") r.capturedPhase = "focusing";
        scratch.nodeCenter.set(...node.position);
        scratch.focusEnd
          .copy(r.savedPos)
          .sub(scratch.nodeCenter)
          .normalize()
          .multiplyScalar(2.4)
          .add(scratch.nodeCenter);
        const p = easeInOutCubic(clamp01((now - phaseStart) / FOCUS_MS));
        camera.position.lerpVectors(r.savedPos, scratch.focusEnd, p);
        r.look.lerpVectors(r.savedLook, scratch.nodeCenter, Math.min(1, p * 1.6));
      }
    } else if (phase === "returning") {
      if (r.capturedPhase !== "returning") {
        r.capturedPhase = "returning";
        r.returnFromPos.copy(camera.position);
        r.returnFromLook.copy(r.look);
      }
      const p = easeInOutCubic(clamp01((now - phaseStart) / RETURN_MS));
      camera.position.lerpVectors(r.returnFromPos, scratch.desired, p);
      r.look.lerpVectors(r.returnFromLook, scratch.desiredLook, p);
    }
    // phase === "project": hold the last frame while the page is open

    camera.lookAt(r.look);
  });

  return null;
}
