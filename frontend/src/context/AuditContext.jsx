import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { DASHBOARD_STATS, AUDIT_HISTORY, SAFETY_CONFIG_QUESTIONS, QUALITY_CONFIG_QUESTIONS } from '../mock';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuditContext = createContext(null);

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};

// Legacy localStorage helpers (only used for one-time migration)
const LEGACY_LS_KEY = 'hk_audit_state_v1';
const LEGACY_CONFIG_KEY = 'hk_config_v1_questions';
const MIGRATED_FLAG = 'hk_migrated_to_backend_v1';

export function AuditProvider({ children }) {
  const { token, user, isOwner } = useAuth();
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // State
  const [userAudits, setUserAudits] = useState({ safety: [], quality: [] });
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [resolvedMap, setResolvedMap] = useState({});
  const [configQuestions, setConfigQuestions] = useState({ Safety: SAFETY_CONFIG_QUESTIONS, Quality: QUALITY_CONFIG_QUESTIONS });
  const [auditHistory] = useState(AUDIT_HISTORY); // seed mock history (read-only, not persisted)
  const migratingRef = useRef(false);

  // ====== Load from backend ======
  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [auditsR, stateR, configR] = await Promise.all([
        axios.get(`${API}/audits`, { headers: authHeaders }),
        axios.get(`${API}/criticita-state`, { headers: authHeaders }),
        axios.get(`${API}/config/questions`, { headers: authHeaders }),
      ]);
      // Audits
      const safety = [], quality = [];
      (auditsR.data || []).forEach((a) => {
        const target = a.mode === 'quality' ? quality : safety;
        target.push(a);
      });
      setUserAudits({ safety, quality });

      // Criticità state
      const dism = new Set();
      const resMap = {};
      (stateR.data || []).forEach((s) => {
        if (s.dismissed) dism.add(s.crit_id);
        if (s.resolved) resMap[s.crit_id] = { resolvedDate: s.resolvedDate, resolvedBy: s.resolvedBy || '' };
      });
      setDismissedIds(dism);
      setResolvedMap(resMap);

      // Config
      if (configR.data?.Safety && configR.data?.Quality) {
        setConfigQuestions({ Safety: configR.data.Safety, Quality: configR.data.Quality });
      }
    } catch (e) {
      console.warn('[AuditContext] fetchAll failed', e?.response?.status);
    }
  }, [token, authHeaders]);

  // ====== One-time migration from localStorage ======
  const runMigrationIfNeeded = useCallback(async () => {
    if (!token || !user || migratingRef.current) return;
    if (localStorage.getItem(MIGRATED_FLAG)) return;

    let legacy = null;
    let legacyConfig = null;
    try {
      const raw = localStorage.getItem(LEGACY_LS_KEY);
      if (raw) legacy = JSON.parse(raw);
      const rawCfg = localStorage.getItem(LEGACY_CONFIG_KEY);
      if (rawCfg) legacyConfig = JSON.parse(rawCfg);
    } catch { /* ignore parse errors */ }

    const hasLegacyData = !!(legacy && (
      (legacy.userAudits?.safety?.length || 0) > 0 ||
      (legacy.userAudits?.quality?.length || 0) > 0 ||
      (legacy.dismissedIds?.length || 0) > 0 ||
      Object.keys(legacy.resolvedMap || {}).length > 0
    ));
    const hasLegacyConfig = !!(legacyConfig && legacyConfig.Safety && legacyConfig.Quality);

    if (!hasLegacyData && !hasLegacyConfig) {
      localStorage.setItem(MIGRATED_FLAG, '1');
      return;
    }

    migratingRef.current = true;
    try {
      // Migrate audits
      const allAudits = [
        ...((legacy?.userAudits?.safety) || []).map((a) => ({ ...a, mode: 'safety' })),
        ...((legacy?.userAudits?.quality) || []).map((a) => ({ ...a, mode: 'quality' })),
      ];
      for (const a of allAudits) {
        const payload = {
          id: a.id,
          type: a.type || (a.mode === 'safety' ? 'Safety' : 'Quality'),
          mode: a.mode,
          area: a.area,
          date: a.date,
          inspector: a.inspector || '',
          score: a.score || 0,
          criticita: a.criticita || [],
          sectorScores: a.sectorScores || {},
          sectorComments: a.sectorComments || {},
          threshold: a.threshold || 2,
          maxScore: a.maxScore || 3,
          wk: a.criticita?.[0]?.wk || null,
          yr: a.criticita?.[0]?.yr || null,
        };
        try { await axios.post(`${API}/audits`, payload, { headers: authHeaders }); } catch { /* skip failed */ }
      }

      // Migrate resolved/dismissed
      for (const [critId, info] of Object.entries(legacy?.resolvedMap || {})) {
        try {
          await axios.post(`${API}/criticita/${critId}/resolve`,
            { resolvedDate: info.resolvedDate, resolvedBy: info.resolvedBy || '' },
            { headers: authHeaders });
        } catch { /* ignore parse errors */ }
      }
      for (const critId of (legacy?.dismissedIds || [])) {
        try {
          await axios.post(`${API}/criticita/${critId}/dismiss`, {}, { headers: authHeaders });
        } catch { /* ignore parse errors */ }
      }

      // Migrate config (only Owner)
      if (hasLegacyConfig && isOwner) {
        try {
          await axios.put(`${API}/config/questions`, legacyConfig, { headers: authHeaders });
        } catch { /* ignore parse errors */ }
      }

      localStorage.setItem(MIGRATED_FLAG, '1');
      await fetchAll();
    } finally {
      migratingRef.current = false;
    }
  }, [token, user, isOwner, authHeaders, fetchAll]);

  // Trigger on token availability
  useEffect(() => {
    if (!token) {
      // Reset to empty when logged out
      setUserAudits({ safety: [], quality: [] });
      setDismissedIds(new Set());
      setResolvedMap({});
      return;
    }
    (async () => {
      await fetchAll();
      await runMigrationIfNeeded();
    })();
  }, [token, fetchAll, runMigrationIfNeeded]);

  // ====== Helpers ======
  const getQuestionsForSector = useCallback((area, reparto, mode) => {
    const typeKey = mode === 'safety' ? 'Safety' : 'Quality';
    const all = configQuestions[typeKey] || [];
    return all.filter((q) => q.area === area && q.reparto === reparto && q.enabled !== false);
  }, [configQuestions]);

  // ====== Write ops (backend-first) ======
  const addCriticita = useCallback(() => {
    // No-op: criticità are stored inline within audit, addAudit handles persistence
  }, []);

  const addAudit = useCallback(async (mode, audit) => {
    const payload = {
      id: audit.id,
      type: audit.type,
      mode,
      area: audit.area,
      date: audit.date,
      inspector: audit.inspector || '',
      score: audit.score || 0,
      criticita: audit.criticita || [],
      sectorScores: audit.sectorScores || {},
      sectorComments: audit.sectorComments || {},
      threshold: audit.threshold || 2,
      maxScore: audit.maxScore || 3,
      wk: audit.criticita?.[0]?.wk || null,
      yr: audit.criticita?.[0]?.yr || null,
    };
    try {
      const r = await axios.post(`${API}/audits`, payload, { headers: authHeaders });
      // Optimistic update with server response (adds user_name, user_email, created_at)
      setUserAudits((prev) => ({ ...prev, [mode]: [r.data, ...prev[mode]] }));
    } catch (e) {
      console.warn('[AuditContext] addAudit failed', e?.response?.data);
      // Fallback local
      setUserAudits((prev) => ({ ...prev, [mode]: [audit, ...prev[mode]] }));
    }
  }, [authHeaders]);

  const updateAudit = useCallback(async (mode, id, patch) => {
    setUserAudits((prev) => ({
      ...prev,
      [mode]: prev[mode].map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    try {
      await axios.patch(`${API}/audits/${id}`, patch, { headers: authHeaders });
    } catch { /* ignore parse errors */ }
  }, [authHeaders]);

  const removeAudit = useCallback(async (mode, id) => {
    setUserAudits((prev) => ({ ...prev, [mode]: prev[mode].filter((a) => a.id !== id) }));
    try {
      await axios.delete(`${API}/audits/${id}`, { headers: authHeaders });
    } catch { /* ignore parse errors */ }
  }, [authHeaders]);

  const dismissCriticita = useCallback(async (id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev); next.add(id); return next;
    });
    try {
      await axios.post(`${API}/criticita/${id}/dismiss`, {}, { headers: authHeaders });
    } catch { /* ignore parse errors */ }
  }, [authHeaders]);

  const resolveCriticita = useCallback(async (id, payload) => {
    setResolvedMap((prev) => ({
      ...prev,
      [id]: { resolvedDate: payload.resolvedDate, resolvedBy: payload.resolvedBy || '' },
    }));
    try {
      await axios.post(`${API}/criticita/${id}/resolve`,
        { resolvedDate: payload.resolvedDate, resolvedBy: payload.resolvedBy || '' },
        { headers: authHeaders });
    } catch { /* ignore parse errors */ }
  }, [authHeaders]);

  const unresolveCriticita = useCallback(async (id) => {
    setResolvedMap((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
    try {
      await axios.post(`${API}/criticita/${id}/unresolve`, {}, { headers: authHeaders });
    } catch { /* ignore parse errors */ }
  }, [authHeaders]);

  // Mock seed (auditHistory) is read-only / in-memory only
  const updateMockAudit = useCallback(() => {}, []);
  const removeMockAudit = useCallback(() => {}, []);

  // Config questions update (Owner only persists; others get optimistic locally)
  const updateConfigQuestions = useCallback(async (updater) => {
    let next;
    setConfigQuestions((prev) => {
      next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
    if (isOwner) {
      try {
        await axios.put(`${API}/config/questions`, next, { headers: authHeaders });
      } catch (e) {
        console.warn('[AuditContext] config save failed', e?.response?.data);
      }
    }
  }, [authHeaders, isOwner]);

  // ====== Derived data ======
  const enrich = useCallback((c) => {
    const resolved = c.id ? resolvedMap[c.id] : null;
    return { ...c, resolved: !!resolved, resolvedDate: resolved?.resolvedDate, resolvedBy: resolved?.resolvedBy };
  }, [resolvedMap]);

  const getCriticita = useCallback((mode) => {
    const base = DASHBOARD_STATS[mode]?.criticitaList || [];
    // Build user criticità from userAudits[mode]
    const userCrits = [];
    (userAudits[mode] || []).forEach((a) => {
      (a.criticita || []).forEach((c) => userCrits.push({ ...c, _owner: a.user_name, _owner_email: a.user_email }));
    });
    return [...userCrits, ...base]
      .filter((c) => !(c.id && dismissedIds.has(c.id)))
      .map(enrich);
  }, [userAudits, dismissedIds, enrich]);

  const getAllCriticita = useCallback(() => {
    const out = [];
    ['safety', 'quality'].forEach((mode) => {
      const baseList = DASHBOARD_STATS[mode]?.criticitaList || [];
      (userAudits[mode] || []).forEach((a) => {
        (a.criticita || []).forEach((c) => {
          if (c.id && dismissedIds.has(c.id)) return;
          out.push(enrich({
            ...c,
            type: c.type || (mode === 'safety' ? 'Safety' : 'Quality'),
            _owner: a.user_name,
            _owner_email: a.user_email,
          }));
        });
      });
      baseList.forEach((c) => {
        if (c.id && dismissedIds.has(c.id)) return;
        out.push(enrich({ ...c, type: c.type || (mode === 'safety' ? 'Safety' : 'Quality') }));
      });
    });
    return out;
  }, [userAudits, dismissedIds, enrich]);

  const getStats = useCallback((mode) => {
    const base = DASHBOARD_STATS[mode];
    const targetType = mode === 'safety' ? 'Safety' : 'Quality';

    const mockList = [];
    auditHistory.forEach((g) => g.audits.forEach((a) => { if (a.type === targetType) mockList.push(a); }));
    const mockCount = mockList.length;
    const mockSum = mockList.reduce((s, a) => s + (a.score || 0), 0);

    const userList = userAudits[mode] || [];
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
    () => {
      // Derive userCriticita from userAudits (for Dashboard compatibility)
      const userCriticita = { safety: [], quality: [] };
      ['safety', 'quality'].forEach((m) => {
        (userAudits[m] || []).forEach((a) => {
          (a.criticita || []).forEach((c) => userCriticita[m].push(c));
        });
      });
      return ({
      userAudits,
      userCriticita,
      auditHistory,
      dismissedIds,
      resolvedMap,
      configQuestions,
      setConfigQuestions: updateConfigQuestions,
      getQuestionsForSector,
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
    });
    },
    [userAudits, auditHistory, dismissedIds, resolvedMap, configQuestions, updateConfigQuestions, getQuestionsForSector, addCriticita, dismissCriticita, resolveCriticita, unresolveCriticita, addAudit, updateAudit, removeAudit, updateMockAudit, removeMockAudit, getCriticita, getAllCriticita, getStats]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
