import React, { useState, useMemo } from 'react';
import { AlertTriangle, Shield, Star, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { CRITICITA_HISTORY, AREA_COLORS, AREA_ORDER } from '../mock';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../components/ui/dialog';

const SeverityBadge = ({ s }) => {
  const map = {
    Alta: 'bg-red-50 text-red-700 border-red-200',
    Media: 'bg-amber-50 text-amber-700 border-amber-200',
    Bassa: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${map[s] || ''}`}>{s}</span>
  );
};

export default function StoricoCriticita() {
  const [items, setItems] = useState(CRITICITA_HISTORY);
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const list = useMemo(() => items.filter((c) => {
    if (filterSev !== 'all' && c.severity !== filterSev) return false;
    if (filterArea !== 'all' && c.area !== filterArea) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!c.question.toLowerCase().includes(s) && !c.inspector.toLowerCase().includes(s) && !c.reparto.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [items, search, filterSev, filterArea]);

  const total = list.length;
  const high = list.filter((c) => c.severity === 'Alta').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Storico Criticità</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Tutte le criticità rilevate negli audit, ordinate per data</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Totale</div>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Severità Alta</div>
            <div className="text-2xl font-bold text-red-600">{high}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Aree coinvolte</div>
            <div className="text-2xl font-bold text-gray-900">{new Set(list.map((c) => c.area)).size}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Cerca per domanda, ispettore o reparto…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <Select value={filterSev} onValueChange={setFilterSev}>
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

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Nessuna criticità trovata</div>
        ) : (
          list.map((c, i) => {
            const col = AREA_COLORS[c.area];
            return (
              <div key={c.id} className={`px-5 py-4 ${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: col?.light }}>
                    {c.type === 'Safety' ? <Shield className="w-5 h-5" style={{ color: col?.accent }} /> : <Star className="w-5 h-5" style={{ color: col?.accent }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge s={c.severity} />
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: col?.light, color: col?.text }}>{c.area}</span>
                      <span className="text-[12px] text-gray-500">› {c.reparto}</span>
                    </div>
                    <div className="text-[14px] text-gray-800 mt-1.5 leading-relaxed">{c.question}</div>
                    <div className="text-[12px] text-gray-500 mt-1.5">{c.date} — {c.inspector}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-gray-500">Punteggio</div>
                    <div className="text-xl font-bold text-red-600">{c.score}</div>
                  </div>
                  <button onClick={() => setDeleting(c)} className="w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare la criticità?</DialogTitle>
            <DialogDescription>Questa azione non può essere annullata.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleting(null)} className="px-4 h-9 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Annulla</button>
            <button onClick={() => { setItems((p) => p.filter((x) => x.id !== deleting.id)); toast.success('Criticità eliminata'); setDeleting(null); }}
              className="px-4 h-9 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Elimina</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
