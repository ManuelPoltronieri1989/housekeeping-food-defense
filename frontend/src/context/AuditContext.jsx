import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { DASHBOARD_STATS, AUDIT_HISTORY } from '../mock';

const AuditContext = createContext(null);

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};

// localStorage helpers (safe)
const LS_KEY = 'hk_audit_state_v1';
const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      userCriticita: parsed.userCriticita || { safety: [], quality: [] },
      userAudits: parsed.userAudits || { safety: [], quality: [] },
      dismissedIds: new Set(parsed.dismissedIds || []),
      resolvedMap: parsed.resolvedMap || {},
      auditHistory: parsed.auditHistory && Array.isArray(parsed.auditHistory) ? parsed.auditHistory : null,
    };
  } catch {
    return null;
  }
};
const saveState = (state) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      userCriticita: state.userCriticita,
      userAudits: state.userAudits,
      dismissedIds: Array.from(state.dismissedIds),
      resolvedMap: state.resolvedMap,
      auditHistory: state.auditHistory,
    }));
  } catch {}
};

export function AuditProvider({ children }) {
  const initial = loadState();

  const [userCriticita, setUserCriticita] = useState(initial?.userCriticita || { safety: [], quality: [] });
  const [userAudits, setUserAudits] = useState(initial?.userAudits || { safety: [], quality: [] });
  const [dismissedIds, setDismissedIds] = useState(initial?.dismissedIds || new Set());
  const [resolvedMap, setResolvedMap] = useState(initial?.resolvedMap || {});
  const [auditHistory, setAuditHistory] = useState(initial?.auditHistory || AUDIT_HISTORY);

  // Persist on every change
  useEffect(() => {
    saveState({ userCriticita, userAudits, dismissedIds, resolvedMap, auditHistory });
  }, [userCriticita, userAudits, dismissedIds, resolvedMap, auditHistory]);

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
    setUserCriticita((prev) => ({ ...prev, [mode]: [...items, ...prev[mode]] }));
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

    const mockList = [];
    auditHistory.forEach((g) => g.audits.forEach((a) => { if (a.type === targetType) mockList.push(a); }));
    const mockCount = mockList.length;
    const mockSum = mockList.reduce((s, a) => s + (a.score || 0), 0);

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
