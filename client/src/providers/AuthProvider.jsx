import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { hasStoredSession, signIn as apiSignIn, signOut as apiSignOut, validateToken } from '../api/auth';
import { onUnauthorized } from '../api/client';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(hasStoredSession);

  useEffect(() => {
    onUnauthorized(() => setUser(null));
    if (!hasStoredSession()) return;

    validateToken()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const signIn = useCallback(async (email, password) => {
    setUser(await apiSignIn(email, password));
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checking, isAdmin: Boolean(user?.admin), authenticated: user !== null, signIn, signOut }),
    [user, checking, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
