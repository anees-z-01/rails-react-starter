import { ApiError, onUnauthorized, request, tokenStore } from './client';

const jsonResponse = (body, { status = 200, headers = {} } = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

const authHeaders = (overrides = {}) => ({
  'access-token': 'token-1', client: 'client-1', uid: 'dana@example.com',
  expiry: String(Math.floor(Date.now() / 1000) + 3600), 'token-type': 'Bearer', ...overrides,
});

describe('request', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('prefixes /api and drops empty query params', async () => {
    fetch.mockResolvedValue(jsonResponse({ ok: true }));

    await request('/jobs', { params: { page: 2, filter: '', per_page: 6, other: undefined } });

    const url = fetch.mock.calls[0][0];
    expect(url.pathname).toBe('/api/jobs');
    expect(url.search).toBe('?page=2&per_page=6');
  });

  it('stores auth headers from a response and sends them on the next request', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ data: {} }, { headers: authHeaders() }));
    fetch.mockResolvedValueOnce(jsonResponse({ jobs: [] }));

    await request('/auth/sign_in', { method: 'POST', body: { email: 'a', password: 'b' } });
    await request('/jobs');

    const sent = fetch.mock.calls[1][1].headers;
    expect(sent['access-token']).toBe('token-1');
    expect(sent.client).toBe('client-1');
    expect(sent.uid).toBe('dana@example.com');
  });

  it('keeps the newest token when the server rotates it', async () => {
    tokenStore.save(new Headers(authHeaders()));
    fetch.mockResolvedValueOnce(jsonResponse({}, { headers: authHeaders({ 'access-token': 'token-2' }) }));

    await request('/jobs');

    expect(tokenStore.read()['access-token']).toBe('token-2');
  });

  it('does not send an expired token', async () => {
    tokenStore.save(new Headers(authHeaders({ expiry: '1000' })));
    fetch.mockResolvedValue(jsonResponse({ jobs: [] }));

    await request('/jobs');

    expect(fetch.mock.calls[0][1].headers['access-token']).toBeUndefined();
    expect(tokenStore.read()).toBeNull();
  });

  it('clears the session and notifies when a signed-in request gets 401', async () => {
    const handler = vi.fn();
    onUnauthorized(handler);
    tokenStore.save(new Headers(authHeaders()));
    fetch.mockResolvedValue(jsonResponse({ errors: ['You need to sign in'] }, { status: 401 }));

    await expect(request('/job_applications')).rejects.toBeInstanceOf(ApiError);

    expect(tokenStore.read()).toBeNull();
    expect(handler).toHaveBeenCalled();
  });

  it('turns API error bodies into readable messages', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ message: ['Job has already been applied to'] }, { status: 422 }));
    await expect(request('/job_applications', { method: 'POST', body: {} }))
      .rejects.toMatchObject({ status: 422, message: 'Job has already been applied to' });

    fetch.mockResolvedValueOnce(new Response('oops', { status: 500 }));
    await expect(request('/jobs')).rejects.toMatchObject({ message: 'Request failed (500)' });
  });
});
