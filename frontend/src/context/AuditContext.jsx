import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DASHBOARD_STATS } from '../mock';

const AuditContext = createContext(null);

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};

export function AuditProvider({ children }) {
  // User-added criticities (besides mock ones)
  const [userCriticita, setUserCriticita] = useState({ safety: [], quality: [] });
  // User-added full audits (besides mock history)
  const [userAudits, setUserAudits] = useState({ safety: [], quality: [] });

  const addCriticita = useCallback((mode, items) => {
    setUserCriticita((prev) => ({
      ...prev,
      [mode]: [...items, ...prev[mode]],
    }));
  }, []);

  const addAudit = useCallback((mode, audit) => {
    setUserAudits((prev) => ({
      ...prev,
      [mode]: [audit, ...prev[mode]],
    }));
  }, []);

  const updateAudit = useCallback((mode, id, patch) => {
    setUserAudits((prev) => ({
      ...prev,
      [mode]: prev[mode].map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const removeAudit = useCallback((mode, id) => {
    setUserAudits((prev) => ({
      ...prev,
      [mode]: prev[mode].filter((a) => a.id !== id),
    }));
  }, []);

  const getCriticita = useCallback((mode) => {
    const base = DASHBOARD_STATS[mode]?.criticitaList || [];
    return [...userCriticita[mode], ...base];
  }, [userCriticita]);

  // Returns ALL criticities (mock + user), with normalized type & week info
  const getAllCriticita = useCallback(() => {
    const out = [];
    ['safety', 'quality'].forEach((mode) => {
      const baseList = DASHBOARD_STATS[mode]?.criticitaList || [];
      const userList = userCriticita[mode];
      [...userList, ...baseList].forEach((c) => {
        out.push({
          ...c,
          type: c.type || (mode === 'safety' ? 'Safety' : 'Quality'),
        });
      });
    });
    return out;
  }, [userCriticita]);

  // Aggregated dashboard stats: merge user audits with mock baseline
  const getStats = useCallback((mode) => {
    const base = DASHBOARD_STATS[mode];
    const list = userAudits[mode];
    const userCount = list.length;
    const total = base.auditTotali + userCount;
    const sumBase = base.punteggioMedio * base.auditTotali;
    const sumUser = list.reduce((s, a) => s + (a.score || 0), 0);
    const avg = total > 0 ? (sumBase + sumUser) / total : base.punteggioMedio;
    const trend = userCount > 0 ? list[0].score : base.trend;
    return {
      ...base,
      auditTotali: total,
      punteggioMedio: +avg.toFixed(2),
      trend: +trend.toFixed(2),
    };
  }, [userAudits]);

  const value = useMemo(
    () => ({
      userCriticita,
      userAudits,
      addCriticita,
      addAudit,
      updateAudit,
      removeAudit,
      getCriticita,
      getAllCriticita,
      getStats,
    }),
    [userCriticita, userAudits, addCriticita, addAudit, updateAudit, removeAudit, getCriticita, getAllCriticita, getStats]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
