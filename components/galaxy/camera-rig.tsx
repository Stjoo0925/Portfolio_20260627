"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import {
  clamp01,
  easeAnticipate,
  easeInOutCubic,
  useGalaxyStore,
} from "@/store/galaxy-store";

const BASE_POSITION = new THREE.Vector3(0, 1.2, 26);
const BASE_LOOK = new THREE.Vector3(0, 0.5, -6);
/** Opening vantage: higher and further out, drifting down into the idle view. */
const FORMING_POSITION = new THREE.Vector3(0, 5.6, 39);
const FORMING_LOOK = new THREE.Vector3(0, 2.2, -6);

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
      formingPos: new THREE.Vector3(),
      formingLook: new THREE.Vector3(),
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
    const { phase, phaseStart, selectedId, reducedMotion, formingMs, focusMs, returnMs } =
      useGalaxyStore.getState();
    const r = rig.current;
    const camera = state.camera;
    const now = performance.now();
    const t = state.clock.elapsedTime;

    // Portrait phones (identity text anchored to the bottom of the
    // viewport via CSS) need the node cluster pulled back and pitched
    // toward the top of frame — otherwise, at a landscape-tuned FOV and
    // framing, nodes end up visually colliding with the hero text and the
    // widest-spread nodes bleed off the narrow left/right edges. Aspect is
    // read live from the R3F canvas size so this also adapts to orientation
    // changes and resizing, not just a one-time device check.
    //
    // A small world-space Y/look offset barely moves the apparent pitch at
    // this camera distance (the shift is tiny relative to ~40 units of
    // depth), so the actual framing fix is a fixed extra downward pitch
    // rotation applied directly to the camera after every lookAt below —
    // pitching the camera down shifts elevated world content (the node
    // cluster) up toward the top of the frame, clear of the bottom-anchored
    // text. zBoost alone handles the horizontal edge-clipping.
    const aspect = state.size.width / state.size.height;
    const portrait = clamp01((0.86 - aspect) / 0.5);
    const zBoost = 1 + portrait * 0.55;
    const portraitPitch = portrait * 0.32;

    // Idle target: slow drift + pointer parallax + drag/wheel offsets.
    // Amplitude kept low so the idle scene settles rather than perpetually
    // drifting — the warp/selection moments should read as the exception,
    // not one motion among many of similar intensity.
    scratch.desired.set(
      BASE_POSITION.x + Math.sin(t * 0.05) * 0.4 + state.pointer.x * 1.5 + r.dragYaw * 7,
      BASE_POSITION.y + Math.cos(t * 0.04) * 0.25 - state.pointer.y * 0.9 - r.dragPitch * 4,
      BASE_POSITION.z * zBoost + Math.sin(t * 0.03) * 0.35 + r.depth,
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
      if (portraitPitch > 0.0001) camera.rotateX(-portraitPitch);
      return;
    }

    const damp = 1 - Math.exp(-delta * 2.4);

    if (phase === "forming") {
      // Opening dolly: ease from the elevated vantage down into the exact
      // idle drift target so the exploring hand-off is seamless. The
      // vantage itself gets the same portrait pull-back as the idle target
      // (scaled down slightly since it starts further out already).
      r.capturedPhase = "forming";
      scratch.formingPos.set(
        FORMING_POSITION.x,
        FORMING_POSITION.y,
        FORMING_POSITION.z * (1 + portrait * 0.3),
      );
      scratch.formingLook.copy(FORMING_LOOK);
      const p = easeInOutCubic(clamp01((now - phaseStart) / formingMs));
      camera.position.lerpVectors(scratch.formingPos, scratch.desired, p);
      r.look.lerpVectors(scratch.formingLook, scratch.desiredLook, p);
      camera.lookAt(r.look);
      if (portraitPitch > 0.0001) camera.rotateX(-portraitPitch);
      return;
    }

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
        // Anticipation: the camera eases back slightly before the dive (p
        // briefly negative, extrapolating backward along the savedPos→
        // focusEnd line) — a wound-up launch instead of an instant snap
        // toward the node.
        const tp = clamp01((now - phaseStart) / focusMs);
        const p = easeAnticipate(tp);
        camera.position.lerpVectors(r.savedPos, scratch.focusEnd, p);
        r.look.lerpVectors(r.savedLook, scratch.nodeCenter, Math.min(1, Math.max(0, p) * 1.6));
      }
    } else if (phase === "returning") {
      if (r.capturedPhase !== "returning") {
        r.capturedPhase = "returning";
        // Reverse warp: start pressed toward the node we came out of and pull
        // back out to the idle vantage (the un-dim fade masks the initial cut)
        const node = selectedId ? nodeById.get(selectedId) : null;
        if (node) {
          scratch.nodeCenter.set(...node.position);
          r.returnFromPos.copy(scratch.desired).lerp(scratch.nodeCenter, 0.55);
          r.returnFromLook.copy(scratch.nodeCenter);
        } else {
          r.returnFromPos.copy(camera.position);
          r.returnFromLook.copy(r.look);
        }
      }
      const p = easeInOutCubic(clamp01((now - phaseStart) / returnMs));
      camera.position.lerpVectors(r.returnFromPos, scratch.desired, p);
      r.look.lerpVectors(r.returnFromLook, scratch.desiredLook, p);
    } else if (phase === "project") {
      // 3D Spatial Camera Glide: Smoothly lerp camera position and focus
      // toward active route node's 3D coordinates on navbar/route navigation
      const activeNode = selectedId
        ? nodeById.get(selectedId)
        : (typeof window !== "undefined" ? findNodeByPathname(window.location.pathname) : null);

      if (activeNode) {
        scratch.desired.set(
          activeNode.position[0] * 0.45 + Math.sin(t * 0.05) * 0.5 + state.pointer.x * 1.2,
          activeNode.position[1] * 0.45 + 0.4 + Math.cos(t * 0.04) * 0.35 - state.pointer.y * 0.7,
          18,
        );
        scratch.desiredLook.set(
          activeNode.position[0] * 0.25 + state.pointer.x * 0.6,
          activeNode.position[1] * 0.25 - state.pointer.y * 0.4,
          0,
        );
      }

      camera.position.lerp(scratch.desired, damp);
      r.look.lerp(scratch.desiredLook, damp);
    }

    camera.lookAt(r.look);
    // Only the idle/explore framing (and its converge/return neighbours)
    // needs the portrait pitch correction — focusing/project already frame
    // a single node deliberately and shouldn't get an extra tilt on top.
    if (
      portraitPitch > 0.0001 &&
      (phase === "exploring" || phase === "converging" || phase === "returning")
    ) {
      camera.rotateX(-portraitPitch);
    }

    // Warp FOV kick: widen through the fly-in, relax back on return/idle
    const cam = camera as THREE.PerspectiveCamera;
    let targetFov = 55;
    if (phase === "focusing") {
      // Clamped anticipation: FOV holds near its resting value through the
      // pull-back beat, then kicks wide once the dive actually starts.
      const p = Math.max(0, easeAnticipate(clamp01((now - phaseStart) / focusMs)));
      targetFov = 55 + 26 * p * p;
    } else if (phase === "returning") {
      const p = clamp01((now - phaseStart) / returnMs);
      targetFov = 55 + 22 * (1 - p) * (1 - p);
    }
    if (Math.abs(cam.fov - targetFov) > 0.02) {
      cam.fov += (targetFov - cam.fov) * Math.min(1, delta * 10);
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
