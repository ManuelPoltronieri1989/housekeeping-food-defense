import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DASHBOARD_STATS, AUDIT_HISTORY } from '../mock';

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
  // Mutable copy of the mock audit history (so edits/deletes propagate to Dashboard)
  const [auditHistory, setAuditHistory] = useState(AUDIT_HISTORY);

  const updateMockAudit = useCallback((id, patch) => {
    setAuditHistory((prev) => prev.map((g) => {
      const audits = g.audits.map((a) => (a.id === id ? { ...a, ...patch } : a));
      const avg = audits.length ? +(audits.reduce((s, a) => s + a.score, 0) / audits.length).toFixed(2) : 0;
      return { ...g, audits, avg };
    }));
  }, []);

  const removeMockAudit = useCallback((id) => {
    setAuditHistory((prev) => prev.map((g) => {
      const audits = g.audits.filter((a) => a.id !== id);
      const avg = audits.length ? +(audits.reduce((s, a) => s + a.score, 0) / audits.length).toFixed(2) : 0;
      return { ...g, audits, count: audits.length, avg };
    }).filter((g) => g.audits.length > 0));
  }, []);

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
    const targetType = mode === 'safety' ? 'Safety' : 'Quality';

    // Real audits from mock history (mutable) for the selected mode
    const mockList = [];
    auditHistory.forEach((g) => g.audits.forEach((a) => { if (a.type === targetType) mockList.push(a); }));
    const mockCount = mockList.length;
    const mockSum = mockList.reduce((s, a) => s + (a.score || 0), 0);

    // User-added audits
    const userList = userAudits[mode];
    const userCount = userList.length;
    const userSum = userList.reduce((s, a) => s + (a.score || 0), 0);

    const total = mockCount + userCount;
    const avg = total > 0 ? (mockSum + userSum) / total : base.punteggioMedio;
    const trend = userCount > 0 ? userList[0].score : (mockList[0]?.score ?? base.trend);
    return {
      ...base,
      auditTotali: total,
      punteggioMedio: +avg.toFixed(2),
      trend: +trend.toFixed(2),
    };
  }, [auditHistory, userAudits]);

  const value = useMemo(
    () => ({
      userCriticita,
      userAudits,
      auditHistory,
      dismissedIds,
      resolvedMap,
      addCriticita,
      dismissCriticita,
      resolveCriticita,
      unresolveCriticita,
      addAudit,
      updateAudit,
      removeAudit,
      updateMockAudit,
      removeMockAudit,
      getCriticita,
      getAllCriticita,
      getStats,
    }),
    [userCriticita, userAudits, auditHistory, dismissedIds, resolvedMap, addCriticita, dismissCriticita, resolveCriticita, unresolveCriticita, addAudit, updateAudit, removeAudit, updateMockAudit, removeMockAudit, getCriticita, getAllCriticita, getStats]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
