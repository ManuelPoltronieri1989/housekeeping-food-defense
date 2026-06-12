import React, { useState, useMemo } from 'react';
import { AlertTriangle, Shield, Star, ChevronUp, ChevronDown, Search, X, Trash2, FileText, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAudit } from '../context/AuditContext';
import { AREA_COLORS, AREA_ORDER } from '../mock';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../components/ui/dialog';

const SeverityBadge = ({ score, type }) => {
  let label = 'Bassa';
  let cls = 'bg-blue-50 text-blue-700 border-blue-200';
  if (type === 'Safety') {
    if (score === 0) { label = 'Alta'; cls = 'bg-red-50 text-red-700 border-red-200'; }
    else if (score === 1) { label = 'Media'; cls = 'bg-amber-50 text-amber-700 border-amber-200'; }
  } else {
    if (score === 1) { label = 'Alta'; cls = 'bg-red-50 text-red-700 border-red-200'; }
    else if (score === 2) { label = 'Media'; cls = 'bg-amber-50 text-amber-700 border-amber-200'; }
  }
  return <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>{label}</span>;
};

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

const StatusBadge = ({ resolved, resolvedDate }) => (
  resolved ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> Risolta{resolvedDate ? ` · ${resolvedDate}` : ''}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-orange-50 text-orange-700 border-orange-200">
      <Clock className="w-3 h-3" /> In corso
    </span>
  )
);

const SegnRow = ({ c, onView, onResolve, onUnresolve, onDelete }) => {
  const col = AREA_COLORS[c.area];
  return (
    <div className="px-5 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: col?.light }}>
          {c.type === 'Safety' ? <Shield className="w-5 h-5" style={{ color: col?.accent }} /> : <Star className="w-5 h-5" style={{ color: col?.accent }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={c.type} />
            <SeverityBadge score={c.score} type={c.type} />
            <StatusBadge resolved={c.resolved} resolvedDate={c.resolvedDate} />
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: col?.light, color: col?.text }}>{c.area}</span>
            <span className="text-[12px] text-gray-500">› {c.reparto}</span>
          </div>
          <div className="text-[13.5px] text-gray-800 mt-1.5 leading-relaxed">{c.commento || <span className="italic text-gray-400">Nessun commento</span>}</div>
          <div className="text-[12px] text-gray-500 mt-1.5">
            {c.date || '—'} — {c.inspector}
            {c.resolved && c.resolvedBy ? <span className="text-emerald-700"> · risolta da {c.resolvedBy}</span> : null}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10.5px] text-gray-500 uppercase tracking-wider font-semibold">Punteggio</div>
          <div className="text-xl font-bold text-red-600">{c.score}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onView(c)} className="w-8 h-8 rounded-md hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors" title="Dettaglio">
            <FileText className="w-4 h-4" />
          </button>
          {c.resolved ? (
            <button onClick={() => onUnresolve(c)} className="w-8 h-8 rounded-md hover:bg-amber-50 flex items-center justify-center text-amber-600 transition-colors" title="Riapri segnalazione">
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => onResolve(c)} className="w-8 h-8 rounded-md hover:bg-emerald-50 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors" title="Segna come risolta">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(c)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors" title="Elimina">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const WeekGroup = ({ wk, yr, items, defaultOpen, onView, onResolve, onUnresolve, onDelete }) => {
  const [open, setOpen] = useState(defaultOpen);
  const openCount = items.filter((c) => !c.resolved).length;
  const resolvedCount = items.length - openCount;
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          <div className="text-left">
            <div className="font-semibold text-gray-900 text-[15px]">Settimana {wk} — {yr}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{items.length} segnalazion{items.length === 1 ? 'e' : 'i'} · {openCount} in corso · {resolvedCount} risolte</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {openCount > 0 && <div className="text-[12px] font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full">{openCount}</div>}
          {resolvedCount > 0 && <div className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{resolvedCount}</div>}
        </div>
      </button>
      {open && (
        <div className="bg-white">
          {items.map((c) => (
            <SegnRow key={c.id || `${c.area}-${c.reparto}-${c.date}-${c.qid || ''}`} c={c} onView={onView} onResolve={onResolve} onUnresolve={onUnresolve} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function StoricoSegnalazioni() {
  const { getAllCriticita, dismissCriticita, resolveCriticita, unresolveCriticita } = useAudit();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [resolving, setResolving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  // resolve form fields
  const [resDate, setResDate] = useState('');
  const [resBy, setResBy] = useState('');

  const all = useMemo(() => getAllCriticita(), [getAllCriticita]);

  const filtered = useMemo(() => {
    return all.filter((c) => {
      if (filterType !== 'all' && c.type !== filterType) return false;
      if (filterArea !== 'all' && c.area !== filterArea) return false;
      if (filterStatus === 'open' && c.resolved) return false;
      if (filterStatus === 'resolved' && !c.resolved) return false;
      if (filterSeverity !== 'all') {
        const isHigh = (c.type === 'Safety' && c.score === 0) || (c.type === 'Quality' && c.score === 1);
        const isMid = (c.type === 'Safety' && c.score === 1) || (c.type === 'Quality' && c.score === 2);
        if (filterSeverity === 'Alta' && !isHigh) return false;
        if (filterSeverity === 'Media' && !isMid) return false;
        if (filterSeverity === 'Bassa' && (isHigh || isMid)) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        if (!(c.commento || '').toLowerCase().includes(s)
          && !(c.inspector || '').toLowerCase().includes(s)
          && !(c.area || '').toLowerCase().includes(s)
          && !(c.reparto || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [all, search, filterType, filterArea, filterSeverity, filterStatus]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((c) => {
      const key = `${c.yr || 2026}-${c.wk || 0}`;
      if (!map.has(key)) map.set(key, { wk: c.wk || 0, yr: c.yr || 2026, items: [] });
      map.get(key).items.push(c);
    });
    return Array.from(map.values()).sort((a, b) => (b.yr - a.yr) || (b.wk - a.wk));
  }, [filtered]);

  const totalCount = filtered.length;
  const openCount = filtered.filter((c) => !c.resolved).length;
  const resolvedCount = totalCount - openCount;

  const openResolve = (c) => {
    setResolving(c);
    setResDate(new Date().toISOString().slice(0, 10));
    setResBy('');
  };
  const confirmResolve = () => {
    if (!resDate) { toast.error('Inserisci la data di risoluzione'); return; }
    const [yyyy, mm, dd] = resDate.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    resolveCriticita(resolving.id, { resolvedDate: formatted, resolvedBy: resBy.trim() });
    toast.success('Segnalazione risolta', { description: `${resolving.area} · ${resolving.reparto} risolta il ${formatted}` });
    setResolving(null);
  };

  const confirmDelete = () => {
    if (!deleting?.id) { toast.error('Impossibile eliminare questa segnalazione'); setDeleting(null); return; }
    dismissCriticita(deleting.id);
    toast.success('Segnalazione archiviata');
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Storico Segnalazioni</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Archivio completo delle criticità rilevate negli audit</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Totale</div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center"><Clock className="w-5 h-5 text-orange-600" /></div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">In corso</div>
            <div className="text-2xl font-bold text-orange-600">{openCount}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Risolte</div>
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Cerca per commento, area, reparto, ispettore…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="open">In corso</SelectItem>
            <SelectItem value="resolved">Risolte</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
            <SelectItem value="Quality">Quality</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[160px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte severità</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Media">Media</SelectItem>
            <SelectItem value="Bassa">Bassa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[180px] h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aree</SelectItem>
            {AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center text-gray-400 text-sm">
            Nessuna segnalazione trovata
          </div>
        ) : (
          groups.map((g, idx) => (
            <WeekGroup
              key={`${g.yr}-${g.wk}`}
              wk={g.wk}
              yr={g.yr}
              items={g.items}
              defaultOpen={idx === 0}
              onView={setViewing}
              onResolve={openResolve}
              onUnresolve={(c) => { unresolveCriticita(c.id); toast.success('Segnalazione riaperta'); }}
              onDelete={setDeleting}
            />
          ))
        )}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettaglio Segnalazione</DialogTitle>
            <DialogDescription>Informazioni complete sulla criticità</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={viewing.type} />
                <SeverityBadge score={viewing.score} type={viewing.type} />
                <StatusBadge resolved={viewing.resolved} resolvedDate={viewing.resolvedDate} />
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: AREA_COLORS[viewing.area]?.light, color: AREA_COLORS[viewing.area]?.text }}>{viewing.area}</span>
                <span className="text-[12px] text-gray-500">› {viewing.reparto}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div><div className="text-xs text-gray-500">Data</div><div className="font-medium">{viewing.date || '—'}</div></div>
                <div><div className="text-xs text-gray-500">Ispettore</div><div className="font-medium">{viewing.inspector || '—'}</div></div>
                <div><div className="text-xs text-gray-500">Punteggio</div><div className="font-bold text-red-600 text-lg">{viewing.score}</div></div>
              </div>
              {viewing.resolved && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div><div className="text-xs text-emerald-700">Risolta il</div><div className="font-medium">{viewing.resolvedDate || '—'}</div></div>
                  <div><div className="text-xs text-emerald-700">Risolta da</div><div className="font-medium">{viewing.resolvedBy || '—'}</div></div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500 mb-1">Commento</div>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-[13px] text-gray-800 leading-relaxed">
                  {viewing.commento || <span className="italic text-gray-400">Nessun commento</span>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve dialog */}
      <Dialog open={!!resolving} onOpenChange={() => setResolving(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Segna come risolta</DialogTitle>
            <DialogDescription>Indica la data in cui la criticità è stata risolta.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Data di risoluzione</label>
              <Input type="date" value={resDate} onChange={(e) => setResDate(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Risolta da (opzionale)</label>
              <Input value={resBy} onChange={(e) => setResBy(e.target.value)} placeholder="Nome del responsabile" className="mt-1.5 h-10" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setResolving(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={confirmResolve} className="flex items-center gap-2 px-4 h-9 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Conferma risoluzione
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare la segnalazione?</DialogTitle>
            <DialogDescription>La segnalazione non sarà più visibile. L'azione non può essere annullata.</DialogDescription>
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
