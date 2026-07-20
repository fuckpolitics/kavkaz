'use client';

import { useEffect, useRef, useState } from 'react';

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  once = true,
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [once]);

  return { ref, visible };
}

export function revealClass(visible: boolean, delayMs = 0): string {
  return [
    'transition-[opacity,transform] duration-700 ease-out',
    visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
    delayMs ? `[transition-delay:${delayMs}ms]` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
