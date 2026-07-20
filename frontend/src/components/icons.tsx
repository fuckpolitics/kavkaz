import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, className, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    ...props,
  };
}

export function IconHome(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function IconCompass(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 6.5L7 17l2.5-6.5L16 8Z" />
    </svg>
  );
}

export function IconMap(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 4 3 6.5V20l6-2.5 6 2.5 6-2.5V4L15 6.5 9 4Z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </svg>
  );
}

export function IconBackpack(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      <rect x="5" y="7" width="14" height="14" rx="3" />
      <path d="M9 12h6M10 17h4" />
    </svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function IconWhatsApp(p: IconProps) {
  return (
    <svg {...base({ ...p, strokeWidth: 0 })} fill="currentColor" stroke="none">
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.1 4 4.1-1.1A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.6.6-2.4-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4c.1-.1 0-.3 0-.4s-.5-1.2-.7-1.6-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3a2 2 0 0 0-.6 1.5 3.5 3.5 0 0 0 .7 1.8c.1.2 1.3 2.1 3.2 2.9a11 11 0 0 0 1.8.6 2.1 2.1 0 0 0 1.7-.5 2.8 2.8 0 0 0 .8-1.5c.1-.3.1-.5 0-.6z" />
    </svg>
  );
}

export function IconTelegram(p: IconProps) {
  return (
    <svg {...base({ ...p, strokeWidth: 0 })} fill="currentColor" stroke="none">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 6.8-1.6 7.5c-.1.5-.4.6-.9.4l-2.4-1.8-1.2 1.1c-.1.1-.3.3-.6.3l.2-2.5 4.5-4.1c.2-.2 0-.3-.3-.1l-5.6 3.5-2.4-.7c-.5-.2-.5-.5.1-.7l9.4-3.6c.4-.2.8.1.8.7Z" />
    </svg>
  );
}

export function IconGuide(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
      <path d="M16 4.5c1 .8 1.5 2 1.5 3.2" />
    </svg>
  );
}

export function IconPrice(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3v18" />
      <path d="M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 3 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" />
    </svg>
  );
}

export function IconSupport(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-7h3" />
      <path d="M4 12v5a2 2 0 0 0 2 2h1v-7H4" />
      <path d="M12 19v2" />
    </svg>
  );
}

export function IconComfort(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z" />
      <path d="M6 11V8a6 6 0 0 1 12 0v3" />
    </svg>
  );
}

export function IconRoute(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 7.5c4 0 3 9 7 9" />
    </svg>
  );
}

export function IconPlace(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconStar(p: IconProps) {
  return (
    <svg {...base({ ...p, strokeWidth: 0 })} fill="currentColor" stroke="none">
      <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z" />
    </svg>
  );
}

export function IconArrow(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const ICON_MAP = {
  guide: IconGuide,
  price: IconPrice,
  support: IconSupport,
  comfort: IconComfort,
  route: IconRoute,
  place: IconPlace,
  shield: IconShield,
} as const;

export function BrandIcon({
  name,
  ...props
}: IconProps & { name: keyof typeof ICON_MAP }) {
  const Cmp = ICON_MAP[name];
  return <Cmp {...props} />;
}
