import { request, tokenStore } from './client';

export const signIn = async (email, password) => {
  const body = await request('/auth/sign_in', { method: 'POST', body: { email, password } });
  return body.data;
};

export const validateToken = async () => {
  const body = await request('/auth/validate_token');
  return body.data;
};

// Signing out always succeeds locally. If the server call fails, the token
// simply expires on its own.
export const signOut = async () => {
  await request('/auth/sign_out', { method: 'DELETE' }).catch(() => null);
  tokenStore.clear();
};

export const hasStoredSession = () => tokenStore.read() !== null;
