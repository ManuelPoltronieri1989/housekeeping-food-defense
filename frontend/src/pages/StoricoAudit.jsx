import React, { useState, useMemo } from 'react';
import { Shield, Star, ChevronUp, ChevronDown, Eye, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { AUDIT_HISTORY, AUDIT_HISTORY_TOTAL, AREA_COLORS, AREA_ORDER } from '../mock';
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

const AuditRow = ({ audit, onView, onDelete }) => {
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
        <button onClick={() => onView(audit)} className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(audit)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const WeekGroup = ({ group, onView, onDelete }) => {
  const [open, setOpen] = useState(group.week === 22);
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
            <AuditRow key={a.id} audit={a} onView={onView} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function StoricoAudit() {
  const [history, setHistory] = useState(AUDIT_HISTORY);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    return history.map((g) => ({
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
  }, [history, search, filterType, filterArea]);

  const total = filtered.reduce((s, g) => s + g.audits.length, 0);

  const onDelete = (audit) => setDeleting(audit);
  const confirmDelete = () => {
    setHistory((prev) => prev.map((g) => ({ ...g, audits: g.audits.filter((a) => a.id !== deleting.id), count: g.audits.filter((a) => a.id !== deleting.id).length })).filter((g) => g.audits.length > 0));
    toast.success('Audit eliminato');
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Storico Audit</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">{AUDIT_HISTORY_TOTAL} audit completati — raggruppati per settimana</p>
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
          filtered.map((g) => (
            <WeekGroup key={g.week} group={g} onView={setViewing} onDelete={onDelete} />
          ))
        )}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dettaglio Audit</DialogTitle>
            <DialogDescription>Informazioni sull'audit selezionato</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <TypeBadge type={viewing.type} />
                <span className="font-semibold" style={{ color: AREA_COLORS[viewing.area]?.text }}>{viewing.area}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><div className="text-xs text-gray-500">Data</div><div className="font-medium">{viewing.date}</div></div>
                <div><div className="text-xs text-gray-500">Ispettore</div><div className="font-medium">{viewing.inspector}</div></div>
                <div><div className="text-xs text-gray-500">Punteggio</div><div className="font-bold text-emerald-600 text-lg">{viewing.score.toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500">Tipo</div><div className="font-medium">{viewing.type}</div></div>
              </div>
            </div>
          )}
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
