import React, { useState, useMemo } from 'react';
import { Shield, Star, ChevronUp, ChevronDown, Eye, Pencil, Trash2, Search, X, Save, Building2, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AUDIT_HISTORY_TOTAL, AREA_COLORS, AREA_ORDER, AREAS_REPARTI, SAFETY_QUESTIONS, QUALITY_QUESTIONS } from '../mock';
import { useAudit } from '../context/AuditContext';
import { Input } from '../components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const TypeBadge = ({ type }) => {
  const isSafety = type === 'Safety';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
      isSafety ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
    }`}>
      {isSafety ? <Shield className="w-3 h-3" /> : <Star className="w-3 h-3" />}
      {type}
    </span>
  );
};

const AuditRow = ({ audit, onView, onEdit, onDelete }) => {
  const c = AREA_COLORS[audit.area];
  const isLow = audit.type === 'Safety' ? audit.score < 2 : audit.score < 3;
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-100">
      <TypeBadge type={audit.type} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px]" style={{ color: c?.text || '#111827' }}>{audit.area}</div>
        <div className="text-[12px] text-gray-500 mt-0.5">{audit.date} — {audit.inspector}</div>
      </div>
      <div className={`text-[14px] font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>{audit.score.toFixed(2)}</div>
      <div className="flex items-center gap-1">
        <button onClick={() => onView(audit)} className="w-8 h-8 rounded-md hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors" title="Visualizza scheda">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(audit)} className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors" title="Modifica">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(audit)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors" title="Elimina">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const WeekGroup = ({ group, defaultOpen = false, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          <div className="text-left">
            <div className="font-semibold text-gray-900 text-[15px]">Settimana {group.week} — {group.year}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{group.count} audit</div>
          </div>
        </div>
        <div className="text-[14px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{group.avg.toFixed(2)}</div>
      </button>
      {open && (
        <div className="bg-white">
          {group.audits.map((a) => (
            <AuditRow key={a.id} audit={a} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

// Deterministic "scheda" generation based on audit id + average score
const buildSchedaData = (audit) => {
  const isSafety = audit.type === 'Safety';
  const questions = isSafety ? SAFETY_QUESTIONS : QUALITY_QUESTIONS;
  const maxS = isSafety ? 3 : 5;
  const minS = isSafety ? 0 : 1;
  const threshold = isSafety ? 2 : 3;
  const reparti = (AREAS_REPARTI[audit.area] || ['Reparto principale']);
  const target = audit.score; // average target
  // Deterministic pseudo-random per audit
  const seed = (audit.id * 9301 + 49297) % 233280;
  let rng = seed;
  const rand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };

  const sectorsData = reparti.map((sector) => {
    const qResults = questions.map((q) => {
      // bias around target, occasionally lower
      const variance = (rand() - 0.5) * 1.4;
      let v = Math.round(target + variance);
      if (v > maxS) v = maxS;
      if (v < minS) v = minS;
      const isCrit = v < threshold;
      return {
        id: q.id,
        text: q.text,
        score: v,
        critical: isCrit,
        commento: isCrit ? `Verificare ${sector.toLowerCase()}, riscontrate anomalie da approfondire. Richiesto intervento correttivo.` : null,
      };
    });
    return { name: sector, results: qResults };
  });
  return { sectorsData, maxS, minS, threshold };
};

const SchedaDialog = ({ audit, onClose }) => {
  const data = useMemo(() => (audit ? buildSchedaData(audit) : null), [audit]);
  if (!audit || !data) return null;
  const c = AREA_COLORS[audit.area];
  const totalQ = data.sectorsData.reduce((s, x) => s + x.results.length, 0);
  const totalCrit = data.sectorsData.reduce((s, x) => s + x.results.filter((r) => r.critical).length, 0);

  return (
    <Dialog open={!!audit} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scheda Audit</DialogTitle>
          <DialogDescription>Riepilogo completo dell'audit selezionato</DialogDescription>
        </DialogHeader>

        {/* Header summary */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: c?.light, borderColor: c?.bg }}>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <TypeBadge type={audit.type} />
                <span className="font-bold text-[16px]" style={{ color: c?.text }}>{audit.area}</span>
              </div>
              <div className="text-[12.5px] text-gray-600">{audit.date} — Ispettore: <span className="font-semibold text-gray-800">{audit.inspector}</span></div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Punteggio</div>
              <div className="text-3xl font-bold mt-0.5" style={{ color: c?.text }}>{audit.score.toFixed(2)}</div>
              <div className="text-[11px] text-gray-500">su {data.maxS}.00</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/60">
            <div>
              <div className="text-[10.5px] text-gray-500 uppercase tracking-wider font-semibold">Domande</div>
              <div className="text-lg font-bold text-gray-800 mt-1">{totalQ}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-gray-500 uppercase tracking-wider font-semibold">Reparti</div>
              <div className="text-lg font-bold text-gray-800 mt-1">{data.sectorsData.length}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-gray-500 uppercase tracking-wider font-semibold">Criticità</div>
              <div className={`text-lg font-bold mt-1 ${totalCrit > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totalCrit}</div>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div className="space-y-3 mt-2">
          {data.sectorsData.map((sec) => (
            <div key={sec.name} className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c?.soft }}>
                  <Building2 className="w-4 h-4" style={{ color: c?.accent }} />
                </div>
                <div className="font-semibold text-[14px] text-gray-900">{sec.name}</div>
              </div>
              {sec.results.map((r, i) => (
                <div key={r.id} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''} ${r.critical ? 'bg-red-50/40' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10.5px] font-semibold text-gray-400 tracking-wider">{r.id}</div>
                      <div className="text-[13px] text-gray-700 mt-0.5 leading-relaxed">{r.text}</div>
                      {r.critical && r.commento && (
                        <div className="mt-2 rounded-md border border-red-200 bg-white px-3 py-2 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                          <div className="text-[12px] text-gray-700 leading-relaxed">{r.commento}</div>
                        </div>
                      )}
                    </div>
                    <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-[16px] font-bold ${
                      r.critical ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {r.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <DialogFooter className="mt-3">
          <button onClick={onClose} className="flex items-center gap-2 px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
            <Check className="w-4 h-4" />
            Chiudi
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ISO week number for a Date
const getISOWeek = (date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
};
const parseItDate = (s) => {
  if (!s) return new Date();
  const [dd, mm, yyyy] = s.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
};

// Convert "GG/MM/YYYY" -> "YYYY-MM-DD" for input[type=date]
const toInputDate = (it) => {
  if (!it) return '';
  const m = it.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
};
// "YYYY-MM-DD" -> "GG/MM/YYYY"
const fromInputDate = (it) => {
  if (!it) return '';
  const m = it.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : it;
};

export default function StoricoAudit() {
  const { userAudits, auditHistory, updateAudit, removeAudit, updateMockAudit, removeMockAudit } = useAudit();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // edit form state
  const [fType, setFType] = useState('Safety');
  const [fArea, setFArea] = useState('');
  const [fDate, setFDate] = useState('');
  const [fInspector, setFInspector] = useState('');
  const [fScore, setFScore] = useState('');

  const isUserAudit = (a) => typeof a?.id === 'string' && a.id.startsWith('user-');

  // Merge user audits (from context) into the correct ISO week (existing or new)
  const allHistory = useMemo(() => {
    const userList = [...userAudits.safety, ...userAudits.quality];
    if (userList.length === 0) return auditHistory;

    // Group user audits by ISO week
    const userByKey = {};
    userList.forEach((a) => {
      const d = parseItDate(a.date);
      const wk = getISOWeek(d);
      const yr = d.getFullYear();
      const key = `${yr}-${wk}`;
      if (!userByKey[key]) userByKey[key] = { week: wk, year: yr, audits: [] };
      userByKey[key].audits.push(a);
    });

    // Merge with mock history (from context)
    const map = new Map();
    auditHistory.forEach((g) => map.set(`${g.year}-${g.week}`, { ...g, audits: [...g.audits] }));
    Object.entries(userByKey).forEach(([key, ug]) => {
      if (map.has(key)) {
        const existing = map.get(key);
        existing.audits = [...ug.audits, ...existing.audits];
      } else {
        map.set(key, { week: ug.week, year: ug.year, audits: ug.audits });
      }
    });

    // Recompute count + avg, sort latest week first
    const groups = Array.from(map.values()).map((g) => {
      const avg = g.audits.length
        ? +(g.audits.reduce((s, a) => s + a.score, 0) / g.audits.length).toFixed(2)
        : 0;
      return { ...g, count: g.audits.length, avg };
    });
    groups.sort((a, b) => (b.year - a.year) || (b.week - a.week));
    return groups;
  }, [auditHistory, userAudits]);

  const totalAuditsCount = useMemo(
    () => allHistory.reduce((s, g) => s + g.audits.length, 0),
    [allHistory]
  );

  const openEdit = (audit) => {
    setEditing(audit);
    setFType(audit.type);
    setFArea(audit.area);
    setFDate(toInputDate(audit.date));
    setFInspector(audit.inspector);
    setFScore(String(audit.score));
  };

  const saveEdit = () => {
    if (!fArea) { toast.error("Seleziona un'area"); return; }
    if (!fInspector.trim()) { toast.error("Inserisci il nome dell'ispettore"); return; }
    const scoreNum = parseFloat(fScore);
    const maxS = fType === 'Safety' ? 3 : 5;
    const minS = fType === 'Safety' ? 0 : 1;
    if (Number.isNaN(scoreNum) || scoreNum < minS || scoreNum > maxS) {
      toast.error(`Punteggio non valido (${minS}–${maxS})`);
      return;
    }
    const updated = {
      ...editing,
      type: fType,
      area: fArea,
      date: fromInputDate(fDate),
      inspector: fInspector,
      score: +scoreNum.toFixed(2),
    };
    if (isUserAudit(editing)) {
      const oldMode = editing.type === 'Safety' ? 'safety' : 'quality';
      const newMode = fType === 'Safety' ? 'safety' : 'quality';
      if (oldMode !== newMode) {
        removeAudit(oldMode, editing.id);
        updateAudit(newMode, editing.id, updated);
      } else {
        updateAudit(newMode, editing.id, updated);
      }
    } else {
      updateMockAudit(editing.id, updated);
    }
    toast.success('Audit aggiornato', { description: `${updated.area} — punteggio ${updated.score.toFixed(2)}` });
    setEditing(null);
  };

  const filtered = useMemo(() => {
    return allHistory.map((g) => ({
      ...g,
      audits: g.audits.filter((a) => {
        if (filterType !== 'all' && a.type !== filterType) return false;
        if (filterArea !== 'all' && a.area !== filterArea) return false;
        if (search) {
          const s = search.toLowerCase();
          if (!a.area.toLowerCase().includes(s) && !a.inspector.toLowerCase().includes(s)) return false;
        }
        return true;
      }),
    })).filter((g) => g.audits.length > 0);
  }, [allHistory, search, filterType, filterArea]);

  const total = filtered.reduce((s, g) => s + g.audits.length, 0);

  const onDelete = (audit) => setDeleting(audit);
  const confirmDelete = () => {
    if (isUserAudit(deleting)) {
      const mode = deleting.type === 'Safety' ? 'safety' : 'quality';
      removeAudit(mode, deleting.id);
    } else {
      removeMockAudit(deleting.id);
    }
    toast.success('Audit eliminato');
    setDeleting(null);
  };

  const fMaxS = fType === 'Safety' ? 3 : 5;
  const fMinS = fType === 'Safety' ? 0 : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Storico Audit</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">{totalAuditsCount} audit completati — raggruppati per settimana</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Cerca per area o ispettore…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
            <SelectItem value="Quality">Quality</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[180px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aree</SelectItem>
            {AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 ml-auto">
          <span className="font-semibold text-gray-700">{total}</span> risultati
        </div>
      </div>

      {/* Week groups */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center text-gray-400 text-sm">
            Nessun audit trovato con i filtri selezionati
          </div>
        ) : (
          filtered.map((g, idx) => (
            <WeekGroup key={`${g.year}-${g.week}`} group={g} defaultOpen={idx === 0} onView={setViewing} onEdit={openEdit} onDelete={onDelete} />
          ))
        )}
      </div>

      {/* Scheda view dialog */}
      <SchedaDialog audit={viewing} onClose={() => setViewing(null)} />

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Audit</DialogTitle>
            <DialogDescription>Aggiorna i dati dell'audit e salva le modifiche.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Tipo</label>
              <Select value={fType} onValueChange={setFType}>
                <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Safety">Safety (0–3)</SelectItem>
                  <SelectItem value="Quality">Quality (1–5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Area</label>
              <Select value={fArea} onValueChange={setFArea}>
                <SelectTrigger className="mt-1.5 h-10"><SelectValue placeholder="Seleziona area" /></SelectTrigger>
                <SelectContent>{AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Data</label>
                <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="mt-1.5 h-10" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Punteggio ({fMinS}–{fMaxS})</label>
                <Input
                  type="number"
                  step="0.01"
                  min={fMinS}
                  max={fMaxS}
                  value={fScore}
                  onChange={(e) => setFScore(e.target.value)}
                  className="mt-1.5 h-10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Ispettore</label>
              <Input value={fInspector} onChange={(e) => setFInspector(e.target.value)} placeholder="Nome ispettore" className="mt-1.5 h-10" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setEditing(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={saveEdit} className="flex items-center gap-2 px-4 h-9 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
              <Save className="w-4 h-4" />
              Salva modifiche
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare l'audit?</DialogTitle>
            <DialogDescription>Questa azione non può essere annullata.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleting(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={confirmDelete} className="px-4 h-9 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Elimina</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
