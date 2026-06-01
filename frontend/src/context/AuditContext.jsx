import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DASHBOARD_STATS } from '../mock';

const AuditContext = createContext(null);

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};

export function AuditProvider({ children }) {
  const [userCriticita, setUserCriticita] = useState({ safety: [], quality: [] });
  const [userAudits, setUserAudits] = useState({ safety: [], quality: [] });
  // Persistent dismissed criticità ids (cestino)
  const [dismissedIds, setDismissedIds] = useState(new Set());
  // Map: critId -> { resolvedDate, resolvedBy }
  const [resolvedMap, setResolvedMap] = useState({});

  const addCriticita = useCallback((mode, items) => {
    setUserCriticita((prev) => ({
      ...prev,
      [mode]: [...items, ...prev[mode]],
    }));
  }, []);

  const dismissCriticita = useCallback((id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const resolveCriticita = useCallback((id, payload) => {
    setResolvedMap((prev) => ({
      ...prev,
      [id]: { resolvedDate: payload.resolvedDate, resolvedBy: payload.resolvedBy || '' },
    }));
  }, []);

  const unresolveCriticita = useCallback((id) => {
    setResolvedMap((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const addAudit = useCallback((mode, audit) => {
    setUserAudits((prev) => ({ ...prev, [mode]: [audit, ...prev[mode]] }));
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

  // Helper: enrich a criticità with resolved info
  const enrich = useCallback((c) => {
    const resolved = c.id ? resolvedMap[c.id] : null;
    return { ...c, resolved: !!resolved, resolvedDate: resolved?.resolvedDate, resolvedBy: resolved?.resolvedBy };
  }, [resolvedMap]);

  const getCriticita = useCallback((mode) => {
    const base = DASHBOARD_STATS[mode]?.criticitaList || [];
    return [...userCriticita[mode], ...base]
      .filter((c) => !(c.id && dismissedIds.has(c.id)))
      .map(enrich);
  }, [userCriticita, dismissedIds, enrich]);

  const getAllCriticita = useCallback(() => {
    const out = [];
    ['safety', 'quality'].forEach((mode) => {
      const baseList = DASHBOARD_STATS[mode]?.criticitaList || [];
      const userList = userCriticita[mode];
      [...userList, ...baseList].forEach((c) => {
        if (c.id && dismissedIds.has(c.id)) return;
        out.push(enrich({
          ...c,
          type: c.type || (mode === 'safety' ? 'Safety' : 'Quality'),
        }));
      });
    });
    return out;
  }, [userCriticita, dismissedIds, enrich]);

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
      dismissedIds,
      resolvedMap,
      addCriticita,
      dismissCriticita,
      resolveCriticita,
      unresolveCriticita,
      addAudit,
      updateAudit,
      removeAudit,
      getCriticita,
      getAllCriticita,
      getStats,
    }),
    [userCriticita, userAudits, dismissedIds, resolvedMap, addCriticita, dismissCriticita, resolveCriticita, unresolveCriticita, addAudit, updateAudit, removeAudit, getCriticita, getAllCriticita, getStats]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
