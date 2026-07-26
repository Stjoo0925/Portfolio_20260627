"use client";

/* eslint-disable react-hooks/immutability -- three.js objects are animated
   imperatively inside the R3F frame loop; they are not React-rendered state */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { galaxyNodes } from "@/lib/galaxy/nodes";
import { buildSupportingNodes } from "@/lib/galaxy/supporting-nodes";
import { useGalaxyStore } from "@/store/galaxy-store";

function buildAmbientGraph(count: number) {
  const support = buildSupportingNodes(count);
  const supportPoints = support.map((node) => new THREE.Vector3(...node.position));
  const points = [
    ...supportPoints,
    ...galaxyNodes.map((node) => new THREE.Vector3(...node.position)),
  ];
  const edges = new Set<string>();

  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    edges.add(a < b ? `${a}:${b}` : `${b}:${a}`);
  };

  // A nearest-previous link guarantees one connected backbone; the second
  // nearest link creates the clustered cross-links associated with graph tools.
  supportPoints.forEach((point, index) => {
    if (index > 0) {
      const previous = supportPoints
        .slice(0, index)
        .map((candidate, candidateIndex) => ({
          index: candidateIndex,
          distance: point.distanceToSquared(candidate),
        }))
        .sort((a, b) => a.distance - b.distance);
      addEdge(index, previous[0].index);
    }

    const nearest = supportPoints
      .map((candidate, candidateIndex) => ({
        index: candidateIndex,
        distance:
          candidateIndex === index ? Number.POSITIVE_INFINITY : point.distanceToSquared(candidate),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);
    nearest.forEach((candidate) => addEdge(index, candidate.index));
  });

  // Attach every interactive menu hub to several nearby background nodes so
  // the colored nodes belong to the same graph instead of floating above it.
  galaxyNodes.forEach((node, mainIndex) => {
    const point = new THREE.Vector3(...node.position);
    const nearest = supportPoints
      .map((candidate, index) => ({
        index,
        distance: point.distanceToSquared(candidate),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
    nearest.forEach((candidate) => addEdge(supportPoints.length + mainIndex, candidate.index));
  });

  const positions: number[] = [];
  for (const edge of edges) {
    const [a, b] = edge.split(":").map(Number);
    positions.push(...points[a].toArray(), ...points[b].toArray());
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: "#aeb5c0",
    transparent: true,
    opacity: 0.075,
    depthWrite: false,
  });

  return new THREE.LineSegments(geometry, material);
}

/** Obsidian-like graph mesh: colored menu hubs inside a connected ambient web. */
export function ConnectionLines() {
  const perfLevel = useGalaxyStore((state) => state.perfLevel);
  const count = perfLevel === "low" ? 24 : 46;
  const lines = useMemo(() => buildAmbientGraph(count), [count]);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  useFrame(() => {
    const { phase } = useGalaxyStore.getState();
    linesRef.current.visible = phase !== "project" && phase !== "forming";
  });

  return <primitive object={lines} />;
}
