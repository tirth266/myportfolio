import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_KEY, getMe, logoutRequest } from "../services/taskApi";

const AuthContext = createContext(null);

// Reads the saved { token, user } from localStorage on first render so a
// page refresh does not log the user out.
const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth());
  // Tracks the extra "who am I" call so the Navbar can show a spinner
  // instead of flashing the wrong state on page load.
  const [isRestoring, setIsRestoring] = useState(Boolean(auth?.token));

  // Keep localStorage in sync with React state.
  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      return;
    }

    localStorage.removeItem(AUTH_KEY);
  }, [auth]);

  /**
   * Practical 7 supplementary: on page load, ask the server who this token
   * belongs to via GET /api/auth/me.
   *
   * localStorage alone cannot be trusted — a user could paste an old or
   * hand-edited token in, or the 1 hour expiry could have passed while the
   * tab was closed. If the server says 401, the response interceptor in
   * taskApi.js has already cleared the token and redirected to /login.
   */
  useEffect(() => {
    if (!auth?.token) {
      setIsRestoring(false);
      return;
    }

    let cancelled = false;

    getMe()
      .then((response) => {
        if (cancelled) return;
        // Refresh the cached user object (name/avatar may have changed).
        setAuth((prev) => ({ token: prev.token, user: response.data.user }));
      })
      .catch((error) => {
        if (cancelled) return;
        // Only clear if it was an auth failure. A network error should not
        // throw the user out of the app.
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setAuth(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });

    return () => {
      cancelled = true;
    };
    // Runs once on mount — deliberately not depending on `auth`, otherwise
    // it would refetch every time the token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((nextAuth) => setAuth(nextAuth), []);

  /**
   * Logout (Practical 7 supplementary): tell the server the token is dead,
   * then wipe it from the client. The token is removed from localStorage
   * both here and in the AuthContext effect above, so a refresh cannot
   * bring the session back.
   */
  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem(AUTH_KEY);
    // Best effort — a JWT is stateless, so the server has nothing to
    // invalidate. Failing here must never block the local logout.
    return logoutRequest().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.token),
      isRestoring,
      login,
      logout,
    }),
    [auth, isRestoring, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
