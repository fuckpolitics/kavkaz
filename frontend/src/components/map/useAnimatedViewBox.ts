'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  clampViewBox,
  easeInOutCubic,
  lerpViewBox,
  viewBoxToString,
  type ViewBox,
} from './geo';

/**
 * Animates SVG viewBox by mutating the DOM attribute — no React re-renders
 * per frame (that was the main source of lag).
 * Returns helpers so pan/zoom can take over without fighting the animation.
 */
export function useAnimatedViewBox(
  svgRef: RefObject<SVGSVGElement | null>,
  target: ViewBox,
  duration = 520,
  onFrame?: (vb: ViewBox) => void,
): {
  getViewBox: () => ViewBox;
  setViewBox: (vb: ViewBox) => void;
  cancel: () => void;
} {
  const currentRef = useRef<ViewBox>(target);
  const rafRef = useRef<number | null>(null);
  const firstRun = useRef(true);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const cancel = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const setViewBox = (vb: ViewBox) => {
    cancel();
    const next = clampViewBox(vb);
    currentRef.current = next;
    const svg = svgRef.current;
    if (svg) svg.setAttribute('viewBox', viewBoxToString(next));
    onFrameRef.current?.(next);
  };

  const getViewBox = () => currentRef.current;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (firstRun.current) {
      firstRun.current = false;
      setViewBox(target);
      return;
    }

    cancel();
    const from = { ...currentRef.current };
    const to = clampViewBox(target);
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = clampViewBox(lerpViewBox(from, to, easeInOutCubic(t)));
      currentRef.current = next;
      svg.setAttribute('viewBox', viewBoxToString(next));
      onFrameRef.current?.(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.x, target.y, target.w, target.h, duration, svgRef]);

  return { getViewBox, setViewBox, cancel };
}
