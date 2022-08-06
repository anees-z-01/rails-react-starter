// Minimal fetch wrapper for a devise_token_auth API. The server identifies a
// session by five response headers; we keep the latest set and send it back on
// every request.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const STORAGE_KEY = 'jobBoard.auth';
export const AUTH_HEADERS = ['access-token', 'client', 'uid', 'expiry', 'token-type'];

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export const tokenStore = {
  read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save(headers) {
    const tokens = Object.fromEntries(AUTH_HEADERS.map((name) => [name, headers.get(name)]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

const isExpired = (tokens) => Boolean(tokens.expiry) && Number(tokens.expiry) * 1000 <= Date.now();

let handleUnauthorized = () => {};
export const onUnauthorized = (callback) => {
  handleUnauthorized = callback;
};

const messageFrom = (body, status) => {
  const detail = body?.message ?? body?.errors?.full_messages ?? body?.errors;
  if (Array.isArray(detail) && detail.length) return detail.join('. ');
  if (typeof detail === 'string' && detail) return detail;
  return `Request failed (${status})`;
};

export async function request(path, { method = 'GET', params, body, signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let tokens = tokenStore.read();
  if (tokens && isExpired(tokens)) {
    tokenStore.clear();
    tokens = null;
  }
  if (tokens) AUTH_HEADERS.forEach((name) => tokens[name] && (headers[name] = tokens[name]));

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.headers.get('access-token')) tokenStore.save(response.headers);

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && tokens) {
      tokenStore.clear();
      handleUnauthorized();
    }
    throw new ApiError(response.status, messageFrom(data, response.status), data);
  }
  return data;
}
