import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, Building2, HelpCircle, Plus, Pencil, Trash2, Shield, Star, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
  AREA_ORDER, AREA_COLORS, AREAS_REPARTI,
} from '../mock';
import { useAudit } from '../context/AuditContext';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../components/ui/dialog';

// Hook: stato persistito su localStorage
const LS_PREFIX = 'hk_config_v1_';
function usePersistedState(key, initial) {
  const storageKey = LS_PREFIX + key;
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) return JSON.parse(raw);
    } catch {}
    return typeof initial === 'function' ? initial() : initial;
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch {}
  }, [storageKey, value]);
  return [value, setValue];
}

const TabButton = ({ active, onClick, Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border transition-all ${
      active ? 'bg-white border-gray-300 text-gray-900 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// ============ AREE TAB ============
function AreeTab() {
  const [areas, setAreas] = usePersistedState('areas', () =>
    AREA_ORDER.map((a) => ({ name: a, color: AREA_COLORS[a].accent, enabled: true }))
  );
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');

  const openEdit = (a) => { setEditing(a); setFormName(a.name); setFormColor(a.color); };
  const saveEdit = () => {
    setAreas((prev) => prev.map((a) => (a.name === editing.name ? { ...a, name: formName, color: formColor } : a)));
    toast.success('Area aggiornata');
    setEditing(null);
  };
  const saveNew = () => {
    if (!formName.trim()) { toast.error('Nome obbligatorio'); return; }
    setAreas((prev) => [...prev, { name: formName, color: formColor, enabled: true }]);
    toast.success('Area creata');
    setNewOpen(false);
    setFormName(''); setFormColor('#3b82f6');
  };
  const confirmDel = () => {
    setAreas((prev) => prev.filter((a) => a.name !== deleting.name));
    toast.success('Area eliminata');
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setNewOpen(true); setFormName(''); setFormColor('#3b82f6'); }}
          className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm">
          <Plus className="w-4 h-4" /> Nuova Area
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {areas.map((a, i) => (
          <div key={a.name} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
            <span className="w-4 h-4 rounded-full shadow-sm" style={{ background: a.color }} />
            <div className="flex-1 font-semibold text-[14px] text-gray-800">{a.name}</div>
            <span className="text-[12px] text-gray-500">{(AREAS_REPARTI[a.name] || []).length} reparti</span>
            <Switch checked={a.enabled} onCheckedChange={(v) => setAreas((p) => p.map((x) => (x.name === a.name ? { ...x, enabled: v } : x)))} />
            <button onClick={() => openEdit(a)} className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => setDeleting(a)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <Dialog open={newOpen || !!editing} onOpenChange={(v) => { if (!v) { setNewOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Area' : 'Nuova Area'}</DialogTitle>
            <DialogDescription>Definisci nome e colore identificativo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Nome</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Area …" className="mt-1.5 h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Colore</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="flex-1 h-10" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setNewOpen(false); setEditing(null); }} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={editing ? saveEdit : saveNew} className="px-4 h-9 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Salva</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare l'area?</DialogTitle>
            <DialogDescription>Tutti i reparti e le domande collegate verranno scollegati.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleting(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={confirmDel} className="px-4 h-9 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Elimina</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ REPARTI TAB ============
function RepartiTab() {
  const initial = useMemo(() => {
    const list = [];
    let id = 1;
    Object.entries(AREAS_REPARTI).forEach(([area, reparti]) => {
      reparti.forEach((r) => list.push({ id: id++, area, name: r, enabled: true }));
    });
    return list;
  }, []);
  const [reparti, setReparti] = usePersistedState('reparti', initial);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formArea, setFormArea] = useState(AREA_ORDER[0]);

  const list = filter === 'all' ? reparti : reparti.filter((r) => r.area === filter);

  const openEdit = (r) => { setEditing(r); setFormName(r.name); setFormArea(r.area); };
  const saveEdit = () => {
    setReparti((p) => p.map((x) => (x.id === editing.id ? { ...x, name: formName, area: formArea } : x)));
    toast.success('Reparto aggiornato');
    setEditing(null);
  };
  const saveNew = () => {
    if (!formName.trim()) { toast.error('Nome obbligatorio'); return; }
    setReparti((p) => [...p, { id: Date.now(), name: formName, area: formArea, enabled: true }]);
    toast.success('Reparto creato');
    setNewOpen(false); setFormName('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[220px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aree</SelectItem>
            {AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <button onClick={() => { setNewOpen(true); setFormName(''); setFormArea(AREA_ORDER[0]); }}
          className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm">
          <Plus className="w-4 h-4" /> Nuovo Reparto
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {list.map((r, i) => {
          const c = AREA_COLORS[r.area];
          return (
            <div key={r.id} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
              <span className="px-2 py-1 rounded-md text-[11px] font-semibold" style={{ background: c.light, color: c.text }}>{r.area}</span>
              <div className="flex-1 font-medium text-[14px] text-gray-800">{r.name}</div>
              <Switch checked={r.enabled} onCheckedChange={(v) => setReparti((p) => p.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))} />
              <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setDeleting(r)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
        {list.length === 0 && <div className="p-10 text-center text-sm text-gray-400">Nessun reparto</div>}
      </div>

      <Dialog open={newOpen || !!editing} onOpenChange={(v) => { if (!v) { setNewOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Reparto' : 'Nuovo Reparto'}</DialogTitle>
            <DialogDescription>Assegna nome e area di appartenenza.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Nome</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Area</label>
              <Select value={formArea} onValueChange={setFormArea}>
                <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setNewOpen(false); setEditing(null); }} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={editing ? saveEdit : saveNew} className="px-4 h-9 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Salva</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare il reparto?</DialogTitle>
            <DialogDescription>Questa azione non può essere annullata.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleting(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={() => { setReparti((p) => p.filter((x) => x.id !== deleting.id)); toast.success('Reparto eliminato'); setDeleting(null); }}
              className="px-4 h-9 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Elimina</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ DOMANDE TAB ============
function DomandeTab() {
  const { configQuestions, setConfigQuestions } = useAudit();
  const [mode, setMode] = useState('Safety');
  const [filterArea, setFilterArea] = useState('all');
  const [filterReparto, setFilterReparto] = useState('all');
  const questions = configQuestions;
  const setQuestions = (updater) => setConfigQuestions(typeof updater === 'function' ? updater(configQuestions) : updater);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const [fCode, setFCode] = useState('');
  const [fText, setFText] = useState('');
  const [fArea, setFArea] = useState(AREA_ORDER[0]);
  const [fReparto, setFReparto] = useState('');

  const repartiForArea = useMemo(() => (fArea ? AREAS_REPARTI[fArea] || [] : []), [fArea]);

  const list = useMemo(() => {
    let l = questions[mode];
    if (filterArea !== 'all') l = l.filter((q) => q.area === filterArea);
    if (filterReparto !== 'all') l = l.filter((q) => q.reparto === filterReparto);
    // Ordina per Area (secondo AREA_ORDER), poi Reparto, poi Codice
    const areaIdx = (a) => {
      const i = AREA_ORDER.indexOf(a);
      return i === -1 ? 999 : i;
    };
    const repartoIdx = (area, reparto) => {
      const reps = AREAS_REPARTI[area] || [];
      const i = reps.indexOf(reparto);
      return i === -1 ? 999 : i;
    };
    l = [...l].sort((a, b) => {
      const da = areaIdx(a.area) - areaIdx(b.area);
      if (da !== 0) return da;
      const dr = repartoIdx(a.area, a.reparto) - repartoIdx(b.area, b.reparto);
      if (dr !== 0) return dr;
      return String(a.code || '').localeCompare(String(b.code || ''), undefined, { numeric: true, sensitivity: 'base' });
    });
    return l;
  }, [questions, mode, filterArea, filterReparto]);

  const openEdit = (q) => {
    setEditing(q); setFCode(q.code); setFText(q.text); setFArea(q.area); setFReparto(q.reparto);
  };
  const openNew = () => {
    setNewOpen(true);
    const prefix = mode === 'Safety' ? 'S' : 'Q';
    const next = questions[mode].length + 1;
    setFCode(`${prefix}${String(next).padStart(3, '0')}`);
    setFText(''); setFArea(AREA_ORDER[0]); setFReparto(AREAS_REPARTI[AREA_ORDER[0]][0]);
  };
  const saveEdit = () => {
    setQuestions((p) => ({ ...p, [mode]: p[mode].map((q) => (q.id === editing.id ? { ...q, code: fCode, text: fText, area: fArea, reparto: fReparto } : q)) }));
    toast.success('Domanda aggiornata');
    setEditing(null);
  };
  const saveNew = () => {
    if (!fText.trim()) { toast.error('Testo obbligatorio'); return; }
    const newQ = { id: Date.now(), code: fCode, text: fText, area: fArea, reparto: fReparto, enabled: true };
    setQuestions((p) => ({ ...p, [mode]: [newQ, ...p[mode]] }));
    toast.success('Domanda creata');
    setNewOpen(false);
  };
  const toggleEnabled = (q) => {
    setQuestions((p) => ({ ...p, [mode]: p[mode].map((x) => (x.id === q.id ? { ...x, enabled: !x.enabled } : x)) }));
  };
  const confirmDel = () => {
    setQuestions((p) => ({ ...p, [mode]: p[mode].filter((x) => x.id !== deleting.id) }));
    toast.success('Domanda eliminata');
    setDeleting(null);
  };

  // ===== IMPORT EXCEL/CSV =====
  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null); // { valid: [], invalid: [], total }

  const normalizeKey = (s) => String(s || '').trim().toLowerCase().replace(/[._\s-]+/g, '');
  const getField = (row, candidates) => {
    for (const c of candidates) {
      for (const k of Object.keys(row)) {
        if (normalizeKey(k) === normalizeKey(c)) return row[k];
      }
    }
    return undefined;
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) { toast.error('Il file è vuoto o privo di intestazioni'); return; }

      const valid = [];
      const invalid = [];
      rows.forEach((r, idx) => {
        const code = String(getField(r, ['codice', 'code']) || '').trim();
        const text = String(getField(r, ['testo domanda', 'testo', 'domanda', 'text']) || '').trim();
        const area = String(getField(r, ['area']) || '').trim();
        const reparto = String(getField(r, ['reparto']) || '').trim();
        const tipoRaw = String(getField(r, ['tipo', 'type']) || '').trim().toLowerCase();
        const tipo = tipoRaw.startsWith('s') ? 'Safety' : tipoRaw.startsWith('q') ? 'Quality' : '';

        const errors = [];
        if (!text) errors.push('Testo mancante');
        if (!area) errors.push('Area mancante');
        if (!reparto) errors.push('Reparto mancante');
        if (!tipo) errors.push("Tipo deve essere 'Safety' o 'Quality'");

        if (errors.length) {
          invalid.push({ row: idx + 2, code, text, area, reparto, tipo: tipoRaw, errors });
        } else {
          valid.push({ code, text, area, reparto, tipo });
        }
      });

      setImportPreview({ valid, invalid, total: rows.length, filename: file.name });
    } catch (err) {
      console.warn(err);
      toast.error('Impossibile leggere il file (formato non valido)');
    }
  };

  const confirmImport = () => {
    if (!importPreview || importPreview.valid.length === 0) return;
    // Group by tipo (Safety/Quality)
    const bySafety = [];
    const byQuality = [];
    importPreview.valid.forEach((v, i) => {
      const q = {
        id: `imp-${Date.now()}-${i}`,
        code: v.code || (v.tipo === 'Safety' ? `S${String(i + 1).padStart(3, '0')}` : `Q${String(i + 1).padStart(3, '0')}`),
        text: v.text,
        area: v.area,
        reparto: v.reparto,
        enabled: true,
      };
      if (v.tipo === 'Safety') bySafety.push(q); else byQuality.push(q);
    });
    setQuestions((p) => ({
      Safety: [...bySafety, ...p.Safety],
      Quality: [...byQuality, ...p.Quality],
    }));
    toast.success(`${importPreview.valid.length} domande importate (Safety: ${bySafety.length} · Quality: ${byQuality.length})`);
    setImportPreview(null);
  };

  return (
    <div className="space-y-4">
      {/* Sub mode tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode('Safety')}
          className={`flex items-center justify-center gap-2 h-12 rounded-lg border transition-all ${
            mode === 'Safety' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          <Shield className="w-4 h-4" />
          <span className="font-semibold text-sm">Safety (0–3)</span>
        </button>
        <button onClick={() => setMode('Quality')}
          className={`flex items-center justify-center gap-2 h-12 rounded-lg border transition-all ${
            mode === 'Quality' ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          <Star className="w-4 h-4" />
          <span className="font-semibold text-sm">Quality (1–5)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        <Select value={filterArea} onValueChange={(v) => { setFilterArea(v); setFilterReparto('all'); }}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Seleziona area" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aree</SelectItem>
            {AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterReparto} onValueChange={setFilterReparto} disabled={filterArea === 'all'}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Seleziona reparto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i reparti</SelectItem>
            {filterArea !== 'all' && (AREAS_REPARTI[filterArea] || []).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileSelected}
          data-testid="import-file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          data-testid="import-excel-btn"
          className="flex items-center gap-2 px-4 h-10 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" /> Importa Excel/CSV
        </button>
        <button onClick={openNew} data-testid="new-question-btn" className={`flex items-center gap-2 px-4 h-10 text-white text-sm font-medium rounded-lg shadow-sm ${
          mode === 'Safety' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
        }`}>
          <Plus className="w-4 h-4" /> Nuova Domanda {mode}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.map((q) => {
          const c = AREA_COLORS[q.area];
          return (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-semibold text-gray-400">{q.code}</div>
                <div className="text-[14px] text-gray-800 mt-1 leading-relaxed">{q.text}</div>
                <div className="text-[12px] text-gray-500 mt-2 flex items-center gap-1.5">
                  <span className="font-semibold" style={{ color: c?.accent }}>{q.area}</span>
                  <span className="text-gray-300">›</span>
                  <span>{q.reparto}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={q.enabled} onCheckedChange={() => toggleEnabled(q)} />
                <button onClick={() => openEdit(q)} className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleting(q)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center text-gray-400 text-sm">Nessuna domanda</div>}
      </div>

      {/* Edit / New dialog */}
      <Dialog open={newOpen || !!editing} onOpenChange={(v) => { if (!v) { setNewOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Domanda' : 'Nuova Domanda'} {mode}</DialogTitle>
            <DialogDescription>Definisci codice, testo, area e reparto della domanda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Codice</label>
              <Input value={fCode} onChange={(e) => setFCode(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Testo</label>
              <Textarea value={fText} onChange={(e) => setFText(e.target.value)} placeholder="Testo della domanda…" className="mt-1.5 min-h-[88px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Area</label>
                <Select value={fArea} onValueChange={(v) => { setFArea(v); setFReparto((AREAS_REPARTI[v] || [])[0] || ''); }}>
                  <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Reparto</label>
                <Select value={fReparto} onValueChange={setFReparto}>
                  <SelectTrigger className="mt-1.5 h-10"><SelectValue placeholder="Seleziona reparto" /></SelectTrigger>
                  <SelectContent>{repartiForArea.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setNewOpen(false); setEditing(null); }} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={editing ? saveEdit : saveNew}
              className={`px-4 h-9 text-sm font-medium text-white rounded-lg ${mode === 'Safety' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
              Salva
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare la domanda?</DialogTitle>
            <DialogDescription>Questa azione non può essere annullata.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleting(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={confirmDel} className="px-4 h-9 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Elimina</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import preview dialog */}
      <Dialog open={!!importPreview} onOpenChange={(v) => { if (!v) setImportPreview(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Anteprima Import
            </DialogTitle>
            <DialogDescription>
              {importPreview && (
                <>File: <span className="font-medium text-gray-700">{importPreview.filename}</span> · {importPreview.total} righe totali</>
              )}
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <div className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Valide</div>
                    <div className="text-xl font-bold text-emerald-700" data-testid="import-valid-count">{importPreview.valid.length}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Scartate</div>
                    <div className="text-xl font-bold text-amber-700" data-testid="import-invalid-count">{importPreview.invalid.length}</div>
                  </div>
                </div>
              </div>

              {importPreview.valid.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Domande valide (max 50 mostrate)</div>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-[12px]">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold">Codice</th>
                          <th className="text-left px-3 py-2 font-semibold">Testo</th>
                          <th className="text-left px-3 py-2 font-semibold">Area</th>
                          <th className="text-left px-3 py-2 font-semibold">Reparto</th>
                          <th className="text-left px-3 py-2 font-semibold">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.valid.slice(0, 50).map((v, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-1.5 font-mono text-gray-500">{v.code || '—'}</td>
                            <td className="px-3 py-1.5 text-gray-800 max-w-[300px] truncate" title={v.text}>{v.text}</td>
                            <td className="px-3 py-1.5 text-gray-700">{v.area}</td>
                            <td className="px-3 py-1.5 text-gray-700">{v.reparto}</td>
                            <td className="px-3 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10.5px] font-semibold ${v.tipo === 'Safety' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v.tipo}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importPreview.invalid.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2">Righe scartate</div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/40 overflow-hidden">
                    <table className="w-full text-[12px]">
                      <thead className="bg-amber-50 text-amber-800">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold w-12">Riga</th>
                          <th className="text-left px-3 py-2 font-semibold">Errore</th>
                          <th className="text-left px-3 py-2 font-semibold">Dati</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.invalid.slice(0, 20).map((v, i) => (
                          <tr key={i} className="border-t border-amber-100">
                            <td className="px-3 py-1.5 text-amber-700 font-mono">{v.row}</td>
                            <td className="px-3 py-1.5 text-amber-800">{v.errors.join(' · ')}</td>
                            <td className="px-3 py-1.5 text-gray-600 truncate max-w-[280px]">
                              {[v.code, v.text, v.area, v.reparto, v.tipo].filter(Boolean).join(' | ') || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-[12px] text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-700">Formato atteso:</span> colonne <code className="px-1 py-0.5 bg-white rounded">Codice</code> · <code className="px-1 py-0.5 bg-white rounded">Testo Domanda</code> · <code className="px-1 py-0.5 bg-white rounded">Area</code> · <code className="px-1 py-0.5 bg-white rounded">Reparto</code> · <code className="px-1 py-0.5 bg-white rounded">Tipo</code> (Safety o Quality). Il codice è opzionale (generato automaticamente se vuoto).
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setImportPreview(null)} data-testid="import-cancel-btn" className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button
              onClick={confirmImport}
              disabled={!importPreview || importPreview.valid.length === 0}
              data-testid="import-confirm-btn"
              className="px-4 h-9 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
            >
              Importa {importPreview?.valid.length || 0} domande
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ MAIN ============
export default function Configurazione() {
  const [tab, setTab] = useState('domande');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Configurazione</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Gestisci aree, reparti e domande di sicurezza</p>
      </div>

      <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
        <TabButton active={tab === 'aree'} onClick={() => setTab('aree')} Icon={MapPin} label="Aree" />
        <TabButton active={tab === 'reparti'} onClick={() => setTab('reparti')} Icon={Building2} label="Reparti" />
        <TabButton active={tab === 'domande'} onClick={() => setTab('domande')} Icon={HelpCircle} label="Domande" />
      </div>

      {tab === 'aree' && <AreeTab />}
      {tab === 'reparti' && <RepartiTab />}
      {tab === 'domande' && <DomandeTab />}
    </div>
  );
}
