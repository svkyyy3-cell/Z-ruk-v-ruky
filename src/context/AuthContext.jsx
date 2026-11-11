import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { favoritesService } from '../services/favoritesService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSessionUser());
  const [users, setUsers] = useState(() => authService.listPublicUsers());

  const refreshUsers = useCallback(() => setUsers(authService.listPublicUsers()), []);
  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const getUser = useCallback((id) => usersById.get(id) ?? null, [usersById]);

  const login = useCallback(async (credentials) => {
    const signedIn = await authService.login(credentials);
    favoritesService.mergeGuestInto(signedIn.id);
    setUser(signedIn);
    return signedIn;
  }, []);

  const register = useCallback(
    async (data) => {
      const created = await authService.register(data);
      favoritesService.mergeGuestInto(created.id);
      setUser(created);
      refreshUsers();
      return created;
    },
    [refreshUsers],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      const updated = await authService.updateProfile(user.id, patch);
      setUser(updated);
      refreshUsers();
      return updated;
    },
    [user, refreshUsers],
  );

  const changePassword = useCallback(
    (current, next) => authService.changePassword(user.id, current, next),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout, updateProfile, changePassword, getUser }),
    [user, login, register, logout, updateProfile, changePassword, getUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
