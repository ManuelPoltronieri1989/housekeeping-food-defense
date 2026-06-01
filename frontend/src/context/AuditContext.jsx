import React, { createContext, useContext, useState, useCallback } from 'react';
import { DASHBOARD_STATS } from '../mock';

const AuditContext = createContext(null);

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};

export function AuditProvider({ children }) {
  // user-added criticities (besides mock ones)
  const [userCriticita, setUserCriticita] = useState({ safety: [], quality: [] });

  const addCriticita = useCallback((mode, items) => {
    setUserCriticita((prev) => ({
      ...prev,
      [mode]: [...items, ...prev[mode]],
    }));
  }, []);

  const getCriticita = useCallback((mode) => {
    const base = DASHBOARD_STATS[mode]?.criticitaList || [];
    return [...userCriticita[mode], ...base];
  }, [userCriticita]);

  return (
    <AuditContext.Provider value={{ addCriticita, getCriticita, userCriticita }}>
      {children}
    </AuditContext.Provider>
  );
}
