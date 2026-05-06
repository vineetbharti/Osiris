import React, { createContext, useContext, useEffect, useState } from 'react';
import { authRepo } from '../data/repositories';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from session on mount
  useEffect(() => {
    authRepo
      .getCurrentUser()
      .then((u) => setCurrentUser(u))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    const user = await authRepo.login({ email, password });
    setCurrentUser(user);
    return user;
  };

  const register = async ({ companyName, email, password }) => {
    return authRepo.register({ companyName, email, password });
  };

  const logout = async () => {
    await authRepo.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
