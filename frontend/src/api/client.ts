export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type TokenGetter = () => string | null;
type TokenSetter = (accessToken: string | null) => void;
type RefreshHandler = () => Promise<string | null>;

let getAccessToken: TokenGetter = () => null;
let setAccessToken: TokenSetter = () => undefined;
let refreshHandler: RefreshHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function configureApiClient(options: {
  getAccessToken: TokenGetter;
  setAccessToken: TokenSetter;
  refresh: RefreshHandler;
}) {
  getAccessToken = options.getAccessToken;
  setAccessToken = options.setAccessToken;
  refreshHandler = options.refresh;
}

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }
  // Local / LAN fallback when env is not baked into the build.
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:3000`;
    }
  }
  return 'http://localhost:3000';
}

function buildQuery(
  params?: Record<string, string | number | boolean | undefined | null> | object,
): string {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function parseError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  let message = res.statusText || 'Request failed';
  try {
    body = await res.json();
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      (typeof (body as { message: unknown }).message === 'string' ||
        Array.isArray((body as { message: unknown }).message))
    ) {
      const msg = (body as { message: string | string[] }).message;
      message = Array.isArray(msg) ? msg.join(', ') : msg;
    }
  } catch {
    // ignore
  }
  return new ApiError(res.status, message, body);
}

async function doRefresh(): Promise<string | null> {
  if (!refreshHandler) {
    return null;
  }
  if (!refreshPromise) {
    refreshPromise = refreshHandler().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function request<T>(
  path: string,
  options: RequestInit & {
    query?: Record<string, string | number | boolean | undefined | null> | object;
    auth?: boolean;
    retry?: boolean;
  } = {},
): Promise<T> {
  const { query, auth = true, retry = true, headers, ...init } = options;
  const url = `${getBaseUrl()}${path}${buildQuery(query)}`;

  const finalHeaders = new Headers(headers);
  if (!(init.body instanceof FormData) && !finalHeaders.has('Content-Type') && init.body) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: finalHeaders,
  });

  if (res.status === 401 && auth && retry) {
    const newToken = await doRefresh();
    if (newToken) {
      setAccessToken(newToken);
      return request<T>(path, { ...options, retry: false });
    }
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function apiUrl(path: string): string {
  return `${getBaseUrl()}${path}`;
}
