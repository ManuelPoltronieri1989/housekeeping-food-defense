import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'hk_auth_token';
const AuthCtx = createContext(null);

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) { setLoading(false); return; }
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => { if (!cancelled) { setUser(r.data); setToken(t); } })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem(TOKEN_KEY, r.data.token);
    setToken(r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const r = await axios.post(`${API}/auth/register`, { email, password, name });
    localStorage.setItem(TOKEN_KEY, r.data.token);
    setToken(r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, register, logout, isOwner: user?.role === 'owner' }}>
      {children}
    </AuthCtx.Provider>
  );
}
