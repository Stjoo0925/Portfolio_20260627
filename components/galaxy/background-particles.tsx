"use client";

/* eslint-disable react-hooks/immutability -- three.js objects are animated
   imperatively inside the R3F frame loop; they are not React-rendered state */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { findNodeByPathname, nodeById } from "@/lib/galaxy/nodes";
import { clamp01, useGalaxyStore } from "@/store/galaxy-store";

/** Disk/spiral center in the same local space as generated positions
 *  (everything below is authored with a -10 z offset from the group origin). */
const DISK_CENTER = new THREE.Vector2(0, -10);

/**
 * Shared GPU infall path for the opening sequence. Each particle waits for
 * its stagger delay, then flies from its scattered spawn point (aStart) to
 * its resting spiral position along a bowed arc. `form` 0→1 drives the whole
 * sequence; at form >= 1 the path collapses to the resting position exactly.
 */
const FORM_PATH_GLSL = /* glsl */ `
  float formProgress(float delay, float form) {
    // A brief flat hold (the opening's first beat: the field sits still and
    // dark) before any particle begins travelling, instead of the densest
    // (delay≈0) particles starting to move on frame one. Each particle's own
    // transit window (0.28) is narrower than the full stagger spread (0.68),
    // so only a minority of the field is ever mid-flight at once — a
    // trickling cascade of arrivals rather than a sustained mass of
    // overlapping streaks filling the whole frame simultaneously.
    float f = max(0.0, form - 0.06);
    return clamp((f - delay * 0.68) / 0.28, 0.0, 1.0);
  }

  vec3 formPos(vec3 target, vec3 start, float delay, float form) {
    float p = formProgress(delay, form);
    float e = 1.0 - pow(1.0 - p, 3.0);
    vec3 pos = mix(start, target, e);
    // Bow tangential to a rotation around the vertical (Y) axis at the
    // particle's OWN resting position — not perpendicular to its individual
    // travel direction. Every particle therefore curls the same way around
    // the same global axis as it falls in, so the field reads as one
    // coherent accretion-disk vortex. The previous version derived "side"
    // from cross(dir, up), which varies with each particle's own scattered
    // start point and produced a criss-cross of independently-angled arcs
    // (visual noise) instead of a unified swirl.
    vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), target) + vec3(0.0001, 0.0, 0.0));
    float dist = length(target - start);
    pos += side * sin(e * 3.14159265) * dist * 0.22;
    return pos;
  }
`;

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aStart;
  attribute float aDelay;
  attribute vec3 aColor;
  attribute float aSpike;
  uniform float uTime;
  uniform float uForm;
  uniform float uSpin;
  uniform vec3 uLensPos;
  uniform float uLensStrength;
  uniform vec2 uDiskCenter;
  varying float vAlpha;
  varying vec3 vColor;
  varying float vSpike;

  ${FORM_PATH_GLSL}

  void main() {
    vec3 p = formPos(position, aStart, aDelay, uForm);

    // Differential rotation: inner orbits shear ahead of the outer field
    // (real disk galaxies rotate faster near the core), oscillating within a
    // small bounded arc rather than accumulating — the sine itself keeps the
    // amount self-limiting so the arms never fully wind up or unwind.
    vec2 rel = p.xz - uDiskCenter;
    float rad = length(rel);
    float falloff = 1.0 / (rad * 0.12 + 1.0);
    float ang = uSpin * falloff;
    float ca = cos(ang);
    float sa = sin(ang);
    rel = vec2(rel.x * ca - rel.y * sa, rel.x * sa + rel.y * ca);
    p.xz = uDiskCenter + rel;

    // Gravity lens: stars near the hovered node drift into its well and
    // brighten, as if the sphere's mass bends the starlight around it
    vec3 toLens = uLensPos - p;
    float lensDist = length(toLens);
    float pull = uLensStrength * smoothstep(9.0, 1.4, lensDist);
    p += (toLens / max(lensDist, 0.001)) * pull * 1.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depthFade = clamp(1.0 - (-mv.z - 8.0) / 90.0, 0.12, 1.0);
    // Fainter twinkle amplitude — at idle this runs on every star at once,
    // and the previous strength made the whole field shimmer loudly rather
    // than reading as one calm backdrop behind the camera drift.
    float twinkle = 0.84 + 0.16 * sin(uTime * 0.6 + aPhase);
    float prog = formProgress(aDelay, uForm);
    // Pre-flight stars sit dim in the void; they flare while travelling
    float moving = sin(prog * 3.14159265);
    vAlpha = depthFade * twinkle * mix(0.3, 1.0, prog) * (1.0 + pull * 0.9);
    vColor = aColor;
    vSpike = aSpike;
    // Clamped so nothing balloons into a screen-filling blob as the camera
    // closes in during the warp fly-in — a star is a point, not a moon.
    gl_PointSize = min(46.0, aSize * twinkle * (1.0 + moving * 0.9) * (160.0 / -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  varying vec3 vColor;
  varying float vSpike;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Two-tier falloff: a small hard core (the visible "star") plus a much
    // softer, wider halo — a single smoothstep reads as a uniform blurred
    // dot at any size; the core is what sells it as a point of light.
    float core = smoothstep(0.16, 0.0, d);
    float halo = smoothstep(0.5, 0.14, d) * 0.42;
    float a = core + halo;

    // Four-point diffraction spike, reserved for the brightest few stars
    // (vSpike is 0 for the rest) — a cross of light through the point
    // rather than a uniform disc, the classic long-exposure star look.
    vec2 q = abs(gl_PointCoord - 0.5);
    float spike = max(
      smoothstep(0.5, 0.0, q.x * 14.0) * smoothstep(0.5, 0.0, q.y),
      smoothstep(0.5, 0.0, q.y * 14.0) * smoothstep(0.5, 0.0, q.x)
    );
    a += spike * vSpike * 0.5;

    vec3 color = uColor * vColor;
    gl_FragColor = vec4(color, a * vAlpha * 0.85);
  }
`;

/**
 * Light-streak companion layer: a tapered camera-facing quad per streaked
 * particle (screen-space "fat line" technique — 4 verts/2 tris, width in
 * pixels via uResolution) rather than a 1px hairline. Two modes share the
 * geometry (they never overlap in time):
 * - forming: stretched between the infall path "now" and slightly in the
 *   past; brightness follows travel speed, so only flight leaves a trace.
 * - warp (focusing/returning): classic hyperspace — the tail is displaced
 *   radially outward from the screen centre in view space, so every star
 *   becomes a speed line pointing away from the travel direction.
 */
const STREAK_VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aEnd;
  attribute float aSide;
  uniform float uForm;
  uniform float uWarp;
  uniform vec2 uResolution;
  varying float vAlpha;
  varying float vAcross;

  ${FORM_PATH_GLSL}

  void main() {
    vec3 head = formPos(position, aStart, aDelay, uForm);
    // A small fixed sample offset — the ease-out curve's velocity spikes
    // hugely in a particle's first instant of motion (leaving its far-off
    // scattered spawn point), so a larger offset here produced streaks that
    // were mostly just that initial burst: long lines slicing across most
    // of the frame. Sampling closer in time keeps streak length tied to the
    // particle's actual current speed instead of its peak.
    vec3 tail = formPos(position, aStart, aDelay, uForm - 0.016);
    vec4 mvHead = modelViewMatrix * vec4(head, 1.0);
    vec4 mvTail = modelViewMatrix * vec4(tail, 1.0);

    // Hyperspace stretch pulls only the tail outward from screen centre —
    // the head stays anchored so the quad reads as a trail behind a point.
    vec2 radial = mvHead.xy;
    float rlen = max(length(radial), 0.2);
    mvTail.xy += (radial / rlen) * (uWarp * uWarp * (2.2 + rlen * 0.6));

    vec4 clipHead = projectionMatrix * mvHead;
    vec4 clipTail = projectionMatrix * mvTail;
    vec4 clipBase = mix(clipHead, clipTail, aEnd);

    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 ndcHead = (clipHead.xy / max(clipHead.w, 0.0001)) * vec2(aspect, 1.0);
    vec2 ndcTail = (clipTail.xy / max(clipTail.w, 0.0001)) * vec2(aspect, 1.0);
    vec2 dir = ndcTail - ndcHead;
    float dirLen = length(dir);
    vec2 normal = dirLen > 0.00001 ? vec2(-dir.y, dir.x) / dirLen : vec2(0.0, 1.0);
    normal /= vec2(aspect, 1.0);

    // Taper: a couple of pixels wide near the head, pointed at the tail.
    float widthPx = mix(1.7, 0.0, pow(aEnd, 0.7));
    vec2 offsetNdc = normal * widthPx * (2.0 / max(uResolution.y, 1.0));
    clipBase.xy += offsetNdc * aSide * clipBase.w;

    gl_Position = clipBase;

    float formSpeed = distance(head, tail);
    float formFade = 1.0 - smoothstep(0.85, 1.0, uForm);
    float formAlpha = smoothstep(0.02, 0.5, formSpeed) * 0.36 * formFade;
    float warpDepth = clamp(1.0 - (-mvHead.z - 10.0) / 80.0, 0.15, 1.0);
    float warpAlpha = uWarp * 0.6 * warpDepth;
    vAlpha = max(formAlpha, warpAlpha) * (1.0 - aEnd * 0.82);
    vAcross = aSide;
  }
`;

const STREAK_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying float vAcross;

  void main() {
    // Brighter along the centreline, fading toward the quad's edges so the
    // hard-edged triangle silhouette never shows through.
    float edge = 1.0 - smoothstep(0.0, 1.0, abs(vAcross));
    gl_FragColor = vec4(vec3(0.92, 0.94, 1.0), vAlpha * edge);
  }
`;

const GLOW_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GLOW_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * uAlpha);
  }
`;

/** Seeded pseudo-random so the field is stable between mounts. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Sum of three uniforms centered on 0 — a cheap Gaussian-ish approximation
 *  (bell-shaped, tighter tails than a single uniform draw). */
function gauss(random: () => number) {
  return random() + random() + random() - 1.5;
}

/** Scattered pre-formation spawn point around the scene. Kept inside a
 *  narrower, center-biased shell (rather than corner-to-corner) so incoming
 *  paths stay legible instead of criss-crossing the entire frame edge to
 *  edge. */
function scatterPoint(random: () => number, out: { x: number; y: number; z: number }) {
  const radius = 34 + random() * 30;
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(2 * random() - 1);
  out.x = radius * Math.sin(phi) * Math.cos(theta) * 0.72;
  out.y = radius * Math.sin(phi) * Math.sin(theta) * 0.75 * 0.72;
  out.z = radius * Math.cos(phi) - 8;
}

const CORE_COLOR_A = new THREE.Color("#FFC170");
const CORE_COLOR_B = new THREE.Color("#FFE9C7");
const ARM_COLOR_A = new THREE.Color("#BFD8FF");
const ARM_COLOR_B = new THREE.Color("#FFFFFF");
const ARM_HII_COLOR = new THREE.Color("#FF9E7A");
const DISK_COLOR_A = new THREE.Color("#D6DAE6");
const DISK_COLOR_B = new THREE.Color("#F0F1F6");
const HALO_COLOR_A = new THREE.Color("#9AA3B5");
const HALO_COLOR_B = new THREE.Color("#C9CEDA");

const SPIRAL_PITCH = 0.42;
const scratchColor = new THREE.Color();

/**
 * One star's resting position + base color, written into `out`. Tier split
 * (core / spiral arm / scattered disk / halo) mirrors real disk-galaxy
 * structure: a dense hot bulge, two logarithmic arms with a dust-lane gap
 * near their inner edge, a faint scattered disk filling the gaps between
 * arms, and a sparse spherical halo extending past the viewport.
 */
function placeStar(
  random: () => number,
  out: { x: number; y: number; z: number; color: THREE.Color },
) {
  const roll = random();

  if (roll < 0.12) {
    // Bulge: dense hot core, compressed vertically
    const r = Math.pow(random(), 2.2) * 5.5;
    const theta = random() * Math.PI * 2;
    out.x = Math.cos(theta) * r;
    out.z = Math.sin(theta) * r - 10;
    out.y = gauss(random) * 0.55 * (1 - r / 7);
    out.color.copy(CORE_COLOR_A).lerp(CORE_COLOR_B, random());
    return;
  }

  if (roll < 0.64) {
    // Two-arm logarithmic spiral — pitch angle stays constant with radius
    // (unlike a linear sweep, which fans out into wedges as r grows).
    const r = 4 + Math.pow(random(), 0.7) * 38;
    const arm = random() > 0.5 ? 0 : Math.PI;
    const spread = gauss(random) * (0.08 + r * 0.006);

    // Dust lane: a thinned band along the arm's inner edge — instead of
    // dropping the particle (which would shrink the field), redirect it
    // into the halo so the total star count stays constant while the band
    // reads as a dark gap threading the arm.
    if (r > 7 && r < 11 && random() < 0.4) {
      const radius = 26 + random() * 46;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      out.x = radius * Math.sin(phi) * Math.cos(theta);
      out.y = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      out.z = radius * Math.cos(phi) - 12;
      out.color.copy(HALO_COLOR_A).lerp(HALO_COLOR_B, random());
      return;
    }

    const angle = arm + Math.log(r / 4) / SPIRAL_PITCH + spread;
    out.x = Math.cos(angle) * r;
    out.z = Math.sin(angle) * r - 10;
    out.y = gauss(random) * (1.4 - r * 0.02) * 0.45;
    if (random() < 0.03) {
      out.color.copy(ARM_HII_COLOR);
    } else {
      out.color.copy(ARM_COLOR_A).lerp(ARM_COLOR_B, random());
    }
    return;
  }

  if (roll < 0.86) {
    // Scattered disk filling the gaps between arms
    const r = Math.pow(random(), 0.6) * 42;
    const theta = random() * Math.PI * 2;
    out.x = Math.cos(theta) * r;
    out.z = Math.sin(theta) * r - 10;
    out.y = gauss(random) * (1.6 - r * 0.02) * 0.4;
    out.color.copy(DISK_COLOR_A).lerp(DISK_COLOR_B, random());
    return;
  }

  // Sparse spherical halo extending past the viewport
  const radius = 26 + random() * 46;
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(2 * random() - 1);
  out.x = radius * Math.sin(phi) * Math.cos(theta);
  out.y = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
  out.z = radius * Math.cos(phi) - 12;
  out.color.copy(HALO_COLOR_A).lerp(HALO_COLOR_B, random());
}

function GlowSprite({
  position,
  color,
  scale,
  alpha,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  alpha: number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GLOW_VERTEX,
        fragmentShader: GLOW_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uAlpha: { value: alpha },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, alpha],
  );

  return (
    <Billboard position={position}>
      <mesh scale={scale} material={material} raycast={() => null}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </Billboard>
  );
}

/** Soft coloured haze marking star-forming regions along the arms, plus a
 *  warm core glow — a cheap depth/mood layer (4 additive billboards),
 *  high-perf only. */
function GalaxyHaze() {
  return (
    <>
      <GlowSprite position={[0, 0, -10]} color="#FFC170" scale={17} alpha={0.14} />
      <GlowSprite position={[9, 0.6, -22]} color="#7FB0E0" scale={9} alpha={0.05} />
      <GlowSprite position={[-13, -0.4, -2]} color="#D98FE0" scale={8} alpha={0.045} />
      <GlowSprite position={[6, -0.8, 18]} color="#7FE0C8" scale={7} alpha={0.04} />
    </>
  );
}

export function BackgroundParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const streakRef = useRef<THREE.Mesh>(null);
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const count = perfLevel === "low" ? 1600 : 4200;
  // Deliberately a minority of the field — with the narrowed per-particle
  // transit window above, streaking every particle would still read as a
  // wall of lines even though fewer are in flight at any instant.
  const streakCount = perfLevel === "low" ? 180 : 560;

  const { geometry, material, streakGeometry, streakMaterial } = useMemo(() => {
    const random = makeRandom(1337);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const starts = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const colors = new Uint8Array(count * 3);
    const spikes = new Float32Array(count);
    const spawn = { x: 0, y: 0, z: 0 };
    const star = { x: 0, y: 0, z: 0, color: scratchColor };

    for (let i = 0; i < count; i += 1) {
      placeStar(random, star);

      positions[i * 3] = star.x;
      positions[i * 3 + 1] = star.y;
      positions[i * 3 + 2] = star.z;

      // Power-law size: mostly faint, a small minority strikingly large —
      // a uniform range instead reads as evenly-scattered dust rather than
      // a real starfield's brightness distribution.
      const size = 0.28 + Math.pow(random(), 3.4) * 3.2;
      sizes[i] = size;
      spikes[i] = size > 2.5 ? 1 : 0;

      phases[i] = random() * Math.PI * 2;
      colors[i * 3] = Math.round(star.color.r * 255);
      colors[i * 3 + 1] = Math.round(star.color.g * 255);
      colors[i * 3 + 2] = Math.round(star.color.b * 255);

      scatterPoint(random, spawn);
      starts[i * 3] = spawn.x;
      starts[i * 3 + 1] = spawn.y;
      starts[i * 3 + 2] = spawn.z;
      delays[i] = random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aStart", new THREE.BufferAttribute(starts, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3, true));
    geo.setAttribute("aSpike", new THREE.BufferAttribute(spikes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uForm: { value: 1 },
        uSpin: { value: 0 },
        uDiskCenter: { value: DISK_CENTER },
        uLensPos: { value: new THREE.Vector3(0, 0, -999) },
        uLensStrength: { value: 0 },
        uColor: { value: new THREE.Color(0.95, 0.95, 0.97) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Streak layer reuses the first streakCount particles' path data. Each
    // streak is a 4-vertex quad (head-left/right, tail-left/right).
    const sPositions = new Float32Array(streakCount * 4 * 3);
    const sStarts = new Float32Array(streakCount * 4 * 3);
    const sDelays = new Float32Array(streakCount * 4);
    const sEnds = new Float32Array(streakCount * 4);
    const sSides = new Float32Array(streakCount * 4);
    const sIndex = new Uint16Array(streakCount * 6);

    for (let i = 0; i < streakCount; i += 1) {
      for (let v = 0; v < 4; v += 1) {
        const idx = i * 4 + v;
        sPositions[idx * 3] = positions[i * 3];
        sPositions[idx * 3 + 1] = positions[i * 3 + 1];
        sPositions[idx * 3 + 2] = positions[i * 3 + 2];
        sStarts[idx * 3] = starts[i * 3];
        sStarts[idx * 3 + 1] = starts[i * 3 + 1];
        sStarts[idx * 3 + 2] = starts[i * 3 + 2];
        sDelays[idx] = delays[i];
        sEnds[idx] = v < 2 ? 0 : 1;
        sSides[idx] = v % 2 === 0 ? -1 : 1;
      }
      const base = i * 4;
      const ib = i * 6;
      sIndex[ib] = base;
      sIndex[ib + 1] = base + 1;
      sIndex[ib + 2] = base + 2;
      sIndex[ib + 3] = base + 2;
      sIndex[ib + 4] = base + 1;
      sIndex[ib + 5] = base + 3;
    }

    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPositions, 3));
    sGeo.setAttribute("aStart", new THREE.BufferAttribute(sStarts, 3));
    sGeo.setAttribute("aDelay", new THREE.BufferAttribute(sDelays, 1));
    sGeo.setAttribute("aEnd", new THREE.BufferAttribute(sEnds, 1));
    sGeo.setAttribute("aSide", new THREE.BufferAttribute(sSides, 1));
    sGeo.setIndex(new THREE.BufferAttribute(sIndex, 1));

    const sMat = new THREE.ShaderMaterial({
      vertexShader: STREAK_VERTEX,
      fragmentShader: STREAK_FRAGMENT,
      uniforms: {
        uForm: { value: 1 },
        uWarp: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      // The quad's screen-space winding flips with travel direction (it's
      // built from a computed 2D normal, not real 3D orientation), so
      // default front-face culling would randomly discard half the streaks.
      side: THREE.DoubleSide,
    });

    return { geometry: geo, material: mat, streakGeometry: sGeo, streakMaterial: sMat };
  }, [count, streakCount]);

  const lens = useRef({ strength: 0, pos: new THREE.Vector3(0, 0, -999) });

  useFrame((state, delta) => {
    const { phase, phaseStart, formingMs, focusMs, returnMs, hoveredId, focusedId } =
      useGalaxyStore.getState();
    const now = performance.now();
    const forming = phase === "forming";
    const form = forming ? clamp01((now - phaseStart) / formingMs) : 1;

    // Warp is reserved for the node-selection fly-in/out only — it used to
    // also fire on ordinary fast mouse movement while idly exploring, which
    // diluted the "hyperspace" beat into background noise.
    let warp = 0;
    if (phase === "focusing") {
      const p = clamp01((now - phaseStart) / focusMs);
      warp = p * p;
    } else if (phase === "returning") {
      const p = clamp01((now - phaseStart) / returnMs);
      warp = (1 - p) * (1 - p) * 0.7;
    }

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uForm.value = form;
    // Bounded oscillation, not accumulation — the sine keeps the shear
    // amount self-limiting so the spiral arms never fully wind up or
    // unwind, and it fades in only once the opening has resolved.
    material.uniforms.uSpin.value = Math.sin(state.clock.elapsedTime * 0.05) * 0.32 * form;
    streakMaterial.uniforms.uForm.value = form;
    streakMaterial.uniforms.uWarp.value = warp;
    const resolution = streakMaterial.uniforms.uResolution.value as THREE.Vector2;
    const dpr = state.viewport.dpr;
    resolution.set(state.size.width * dpr, state.size.height * dpr);

    // Particle star tint lerps towards active route accent color
    const selectedId = useGalaxyStore.getState().selectedId;
    const activeNode = selectedId
      ? nodeById.get(selectedId)
      : (typeof window !== "undefined" ? findNodeByPathname(window.location.pathname) : null);
    const targetColor = new THREE.Color(0.95, 0.95, 0.97);
    if ((phase === "project" || phase === "focusing") && activeNode) {
      targetColor.set(activeNode.accent).lerp(new THREE.Color(0.95, 0.95, 0.97), 0.7);
    }
    (material.uniforms.uColor.value as THREE.Color).lerp(
      targetColor,
      1 - Math.exp(-delta * 3.5),
    );

    // Gravity lens follows the hovered/keyboard-focused node while exploring
    const lensNode =
      phase === "exploring" && (hoveredId ?? focusedId)
        ? nodeById.get((hoveredId ?? focusedId)!)
        : null;
    const lensDamp = 1 - Math.exp(-delta * 6);
    lens.current.strength +=
      ((lensNode ? 1 : 0) - lens.current.strength) * lensDamp;
    if (lensNode && groupRef.current) {
      // Node positions are world-space; particles live inside the rotating +
      // tilted group, so transform the lens centre into that local space via
      // the group's own inverse world matrix — robust to any combination of
      // spin and tilt, unlike a manual single-axis counter-rotation.
      groupRef.current.updateMatrixWorld();
      lens.current.pos.set(...lensNode.position);
      groupRef.current.worldToLocal(lens.current.pos);
    }
    material.uniforms.uLensStrength.value = lens.current.strength;
    (material.uniforms.uLensPos.value as THREE.Vector3).copy(lens.current.pos);

    if (streakRef.current) streakRef.current.visible = forming || warp > 0.003;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (forming ? 0.0012 : 0.0045);
    }
  });

  return (
    <group ref={groupRef} rotation={[0.32, 0, 0.07]}>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <mesh
        ref={streakRef}
        geometry={streakGeometry}
        material={streakMaterial}
        visible={false}
        frustumCulled={false}
        raycast={() => null}
      />
      {perfLevel === "high" && <GalaxyHaze />}
    </group>
  );
}
