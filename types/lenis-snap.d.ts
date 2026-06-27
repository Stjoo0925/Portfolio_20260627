declare module "lenis/dist/lenis-snap.mjs" {
  import Lenis from "lenis";
  type SnapOptions = {
    type?: "mandatory" | "proximity" | "lock";
    lerp?: number;
    easing?: (t: number) => number;
    duration?: number;
    distanceThreshold?: number | `${number}%`;
    debounce?: number;
    onSnapStart?: (snap: { value: number; index?: number }) => void;
    onSnapComplete?: (snap: { value: number; index?: number }) => void;
  };
  type SnapElementOptions = {
    align?: string | string[];
    ignoreSticky?: boolean;
    ignoreTransform?: boolean;
  };
  export default class Snap {
    constructor(lenis: Lenis, options?: SnapOptions);
    destroy(): void;
    start(): void;
    stop(): void;
    add(value: number): () => void;
    addElement(element: HTMLElement, options?: SnapElementOptions): () => void;
    addElements(
      elements: HTMLElement[],
      options?: SnapElementOptions,
    ): () => void;
    previous(): void;
    next(): void;
    goTo(index: number): void;
    resize(): void;
  }
}
