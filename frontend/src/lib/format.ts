export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function resolveImageUrl(
  url: string | null | undefined,
  fallback = '/images/placeholder-mountains.svg',
): string {
  if (!url) {
    return fallback;
  }
  // Rewrite absolute backend upload URLs to same-origin /uploads proxy (works on phone).
  if (
    url.startsWith('http://localhost:3000/') ||
    url.startsWith('http://127.0.0.1:3000/')
  ) {
    try {
      return new URL(url).pathname;
    } catch {
      return url.replace(/^https?:\/\/[^/]+/, '');
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.pathname.startsWith('/uploads')) {
        return parsed.pathname + parsed.search;
      }
      // API on LAN IP:3000 → proxy via Next /uploads
      if (parsed.port === '3000' && parsed.pathname.startsWith('/uploads')) {
        return parsed.pathname + parsed.search;
      }
    } catch {
      /* keep as-is */
    }
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return fallback;
}

export function pluralizeTours(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} тур`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} тура`;
  }
  return `${count} туров`;
}
