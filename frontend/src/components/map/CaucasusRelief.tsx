'use client';

import { MAP_SVG_H, MAP_SVG_W } from './geo';

/**
 * Photo-based stylized Caucasus relief underlay (zooms with SVG viewBox).
 * Replaces the old line-drawing that looked like scribbles on a canvas.
 */
export function CaucasusRelief({ dark = true }: { dark?: boolean }) {
  return (
    <g aria-hidden className="pointer-events-none">
      <rect width={MAP_SVG_W} height={MAP_SVG_H} fill={dark ? '#0B1013' : '#e8efe9'} />
      <image
        href="/images/caucasus-relief.jpg"
        x={0}
        y={0}
        width={MAP_SVG_W}
        height={MAP_SVG_H}
        preserveAspectRatio="xMidYMid slice"
        opacity={dark ? 0.92 : 0.78}
      />
      {/* Brand tint + vignette so markers stay readable */}
      <rect
        width={MAP_SVG_W}
        height={MAP_SVG_H}
        fill={dark ? '#0B1013' : '#1E3D2F'}
        opacity={dark ? 0.28 : 0.12}
      />
      <defs>
        <radialGradient id="map-vignette" cx="50%" cy="48%" r="68%">
          <stop offset="55%" stopColor="#0B1013" stopOpacity="0" />
          <stop offset="100%" stopColor="#0B1013" stopOpacity={dark ? 0.55 : 0.25} />
        </radialGradient>
      </defs>
      <rect width={MAP_SVG_W} height={MAP_SVG_H} fill="url(#map-vignette)" />
    </g>
  );
}
