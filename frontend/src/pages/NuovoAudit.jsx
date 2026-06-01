import React, { useState, useMemo } from 'react';
import { Shield, Star, Building2, Check, Save, AlertTriangle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { AREA_ORDER, AREAS_REPARTI, SAFETY_QUESTIONS, QUALITY_QUESTIONS, AREA_COLORS } from '../mock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAudit } from '../context/AuditContext';

const ScoreButton = ({ value, selected, onClick, accent, isCritical }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-all duration-150 ${
      selected
        ? `text-white shadow-md scale-105 ${isCritical ? 'ring-2 ring-red-300' : ''}`
        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
    }`}
    style={selected ? { backgroundColor: isCritical ? '#dc2626' : accent, borderColor: isCritical ? '#dc2626' : accent } : {}}
  >
    {value}
  </button>
);

export default function NuovoAudit() {
  const { addCriticita } = useAudit();
  const [mode, setMode] = useState('safety');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [area, setArea] = useState('');
  const [ispettore, setIspettore] = useState('');
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});

  const questions = mode === 'safety' ? SAFETY_QUESTIONS : QUALITY_QUESTIONS;
  const maxScore = mode === 'safety' ? 3 : 5;
  const threshold = mode === 'safety' ? 2 : 3; // sotto questa soglia => criticità
  const scoreOptions = Array.from({ length: maxScore + 1 }, (_, i) => (mode === 'quality' ? i + 1 : i)).slice(0, maxScore + 1);
  // Safety: 0..3 ; Quality: 1..5
  const finalOptions = mode === 'safety'
    ? [0, 1, 2, 3]
    : [1, 2, 3, 4, 5];
  const accent = area ? AREA_COLORS[area].accent : '#3b82f6';

  const sectors = useMemo(() => (area ? AREAS_REPARTI[area] || [] : []), [area]);

  const setScore = (sectorIdx, qid, val) => {
    setScores((prev) => ({ ...prev, [`${sectorIdx}-${qid}`]: val }));
  };
  const setComment = (sectorIdx, qid, val) => {
    setComments((prev) => ({ ...prev, [`${sectorIdx}-${qid}`]: val }));
  };

  const totalAnswered = Object.keys(scores).length;
  const totalQuestions = sectors.length * questions.length;
  const totalCriticita = Object.entries(scores).filter(([_, v]) => v < threshold).length;
  const criticityMissingComment = Object.entries(scores).filter(([k, v]) => v < threshold && !(comments[k] && comments[k].trim().length > 0)).length;

  const resetForm = () => {
    setScores({});
    setComments({});
  };

  const onSave = () => {
    if (!area) { toast.error("Seleziona un'area"); return; }
    if (!ispettore.trim()) { toast.error("Inserisci il nome dell'ispettore"); return; }
    if (totalAnswered === 0) { toast.error('Compila almeno una domanda'); return; }
    if (criticityMissingComment > 0) {
      toast.error(`Aggiungi un commento per ${criticityMissingComment} criticità`);
      return;
    }

    // Build criticities to push to dashboard context
    const newCriticita = Object.entries(scores)
      .filter(([_, v]) => v < threshold)
      .map(([key, val]) => {
        const [sIdx, qid] = key.split('-');
        const sector = sectors[parseInt(sIdx, 10)];
        return {
          area,
          reparto: sector,
          score: val,
          commento: comments[key] || '',
          inspector: ispettore,
          settimana: 'Sett. 22 / 2026',
        };
      });

    if (newCriticita.length > 0) {
      addCriticita(mode, newCriticita);
    }

    toast.success('Audit salvato con successo', {
      description: `${totalAnswered}/${totalQuestions} domande compilate per ${area}${newCriticita.length ? ` — ${newCriticita.length} criticità registrate` : ''}`,
    });
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Nuovo Audit</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Compila i punteggi per ogni domanda. Sotto la soglia minima è richiesto un commento.</p>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { setMode('safety'); resetForm(); }}
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
              <div className="text-xs text-gray-500">Punteggio 0–3 · soglia minima 2</div>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setMode('quality'); resetForm(); }}
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
              <div className="text-xs text-gray-500">Punteggio 1–5 · soglia minima 3</div>
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
                  <Building2 className="w-4 h-4" style={{ color: AREA_COLORS[area].accent }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-[15px]">{sector}</h3>
              </div>
              <div>
                {questions.map((q, qIdx) => {
                  const key = `${sIdx}-${q.id}`;
                  const sel = scores[key];
                  const isCritical = sel !== undefined && sel < threshold;
                  const comment = comments[key] || '';
                  const missingComment = isCritical && !comment.trim();
                  return (
                    <div key={q.id} className={`px-5 py-4 ${qIdx > 0 ? 'border-t border-gray-100' : ''} ${isCritical ? 'bg-red-50/40' : ''}`}>
                      <div className="flex items-start gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-400 tracking-wider">{q.id}</div>
                          <div className="text-[13.5px] text-gray-700 mt-1 leading-relaxed">{q.text}</div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {finalOptions.map((v) => (
                            <ScoreButton
                              key={v}
                              value={v}
                              selected={sel === v}
                              onClick={() => setScore(sIdx, q.id, v)}
                              accent={accent}
                              isCritical={sel === v && v < threshold}
                            />
                          ))}
                        </div>
                      </div>

                      {isCritical && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-white p-3 hk-fade-in">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-[12px] font-semibold text-red-700">Criticità rilevata — commento obbligatorio</span>
                            {missingComment && (
                              <span className="ml-auto text-[10.5px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">Mancante</span>
                            )}
                          </div>
                          <div className="relative">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                            <Textarea
                              value={comment}
                              onChange={(e) => setComment(sIdx, q.id, e.target.value)}
                              placeholder="Descrivi il problema riscontrato, l'azione correttiva proposta e l'urgenza…"
                              className={`pl-9 min-h-[72px] text-[13px] ${missingComment ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Save bar */}
          <div className="sticky bottom-4 bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-4 h-4 text-emerald-600" />
                <span><span className="font-semibold text-gray-900">{totalAnswered}</span> / {totalQuestions} compilate</span>
              </div>
              {totalCriticita > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span><span className="font-semibold">{totalCriticita}</span> criticità{criticityMissingComment > 0 ? ` · ${criticityMissingComment} senza commento` : ''}</span>
                </div>
              )}
            </div>
            <button
              onClick={onSave}
              disabled={criticityMissingComment > 0}
              className={`flex items-center gap-2 px-5 h-10 text-white text-sm font-medium rounded-lg shadow-sm transition-colors ${
                criticityMissingComment > 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
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
