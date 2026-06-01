import React, { useState, useMemo } from 'react';
import { Shield, Star, Building2, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AREA_ORDER, AREAS_REPARTI, SAFETY_QUESTIONS, QUALITY_QUESTIONS, AREA_COLORS } from '../mock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';

const ScoreButton = ({ value, selected, onClick, accent }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-all duration-150 ${
      selected
        ? 'text-white shadow-md scale-105'
        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
    }`}
    style={selected ? { backgroundColor: accent, borderColor: accent } : {}}
  >
    {value}
  </button>
);

export default function NuovoAudit() {
  const [mode, setMode] = useState('safety');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [area, setArea] = useState('');
  const [ispettore, setIspettore] = useState('');
  const [scores, setScores] = useState({});

  const questions = mode === 'safety' ? SAFETY_QUESTIONS : QUALITY_QUESTIONS;
  const maxScore = mode === 'safety' ? 3 : 5;
  const scoreOptions = Array.from({ length: maxScore + 1 }, (_, i) => i);
  const accent = area ? AREA_COLORS[area].accent : '#3b82f6';

  const sectors = useMemo(() => (area ? AREAS_REPARTI[area] || [] : []), [area]);

  const setScore = (sectorIdx, qid, val) => {
    setScores((prev) => ({ ...prev, [`${sectorIdx}-${qid}`]: val }));
  };

  const totalAnswered = Object.keys(scores).length;
  const totalQuestions = sectors.length * questions.length;

  const onSave = () => {
    if (!area) { toast.error('Seleziona un\'area'); return; }
    if (!ispettore.trim()) { toast.error('Inserisci il nome dell\'ispettore'); return; }
    if (totalAnswered === 0) { toast.error('Compila almeno una domanda'); return; }
    toast.success('Audit salvato con successo', {
      description: `${totalAnswered}/${totalQuestions} domande compilate per ${area}`,
    });
    setScores({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Nuovo Audit</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Compila i punteggi per ogni domanda</p>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { setMode('safety'); setScores({}); }}
          className={`rounded-xl border p-5 text-left transition-all duration-200 ${
            mode === 'safety'
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className={`w-5 h-5 ${mode === 'safety' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <div>
              <div className={`font-semibold text-[15px] ${mode === 'safety' ? 'text-emerald-700' : 'text-gray-700'}`}>Safety</div>
              <div className="text-xs text-gray-500">Punteggio 0–3</div>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setMode('quality'); setScores({}); }}
          className={`rounded-xl border p-5 text-left transition-all duration-200 ${
            mode === 'quality'
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Star className={`w-5 h-5 ${mode === 'quality' ? 'text-amber-600' : 'text-gray-400'}`} />
            <div>
              <div className={`font-semibold text-[15px] ${mode === 'quality' ? 'text-amber-700' : 'text-gray-700'}`}>Quality</div>
              <div className="text-xs text-gray-500">Punteggio 1–5</div>
            </div>
          </div>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-medium text-gray-600">Data Audit</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 h-10"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Area</label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="mt-1.5 h-10"><SelectValue placeholder="Seleziona area" /></SelectTrigger>
              <SelectContent>
                {AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Ispettore</label>
            <Input
              value={ispettore}
              onChange={(e) => setIspettore(e.target.value)}
              placeholder="Nome ispettore"
              className="mt-1.5 h-10"
            />
          </div>
        </div>
      </div>

      {/* Sectors */}
      {area && sectors.length > 0 && (
        <div className="space-y-4">
          {sectors.map((sector, sIdx) => (
            <div key={sector} className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: AREA_COLORS[area].soft }}>
                  <Building2 className="w-4.5 h-4.5" style={{ color: AREA_COLORS[area].accent }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-[15px]">{sector}</h3>
              </div>
              <div>
                {questions.map((q, qIdx) => {
                  const key = `${sIdx}-${q.id}`;
                  const sel = scores[key];
                  return (
                    <div key={q.id} className={`flex items-start gap-6 px-5 py-4 ${qIdx > 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-400 tracking-wider">{q.id}</div>
                        <div className="text-[13.5px] text-gray-700 mt-1 leading-relaxed">{q.text}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {scoreOptions.map((v) => (
                          <ScoreButton key={v} value={v} selected={sel === v} onClick={() => setScore(sIdx, q.id, v)} accent={accent} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Save bar */}
          <div className="sticky bottom-4 bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-emerald-600" />
              <span><span className="font-semibold text-gray-900">{totalAnswered}</span> / {totalQuestions} domande compilate</span>
            </div>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Salva Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
