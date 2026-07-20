'use client';

import type { ReactNode } from 'react';
import { revealClass, useReveal } from '@/lib/motion';

export function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${revealClass(visible, delayMs)} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
