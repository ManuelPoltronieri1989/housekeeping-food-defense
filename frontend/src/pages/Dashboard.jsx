import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield, ClipboardCheck, TrendingUp, AlertTriangle,
  ChevronDown, ChevronUp, Minus, ArrowDown, ArrowUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import ModeToggle from '../components/ModeToggle';
import {
  AREA_COLORS, REPARTI_SCORES, AREA_ORDER, MEDIA_PER_AREA_ORDER,
  WEEKLY_TREND, DASHBOARD_STATS, MONTHS, WEEKS, AUDIT_HISTORY
} from '../mock';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { useAudit } from '../context/AuditContext';

const ITALIAN_MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

// ISO week helpers
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

const StatCard = ({ label, value, sub, Icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-[11px] font-semibold tracking-[0.12em] text-gray-500 uppercase">{label}</div>
        <div className="text-[28px] font-bold text-gray-900 mt-2 leading-none tracking-tight">{value}</div>
        <div className="text-[12px] text-gray-500 mt-2">{sub}</div>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
      </div>
    </div>
  </div>
);

const CriticitaCard = ({ count, sub, items }) => {
  const isAlert = count > 0;
  return (
    <div className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${
      isAlert ? 'bg-red-50/40 border-red-200' : 'bg-white border-gray-200/80'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${isAlert ? 'text-red-700' : 'text-gray-500'}`}>Criticità</div>
          <div className={`text-[28px] font-bold mt-2 leading-none tracking-tight ${isAlert ? 'text-red-700' : 'text-gray-900'}`}>{count}</div>
          <div className={`text-[12px] mt-2 ${isAlert ? 'text-red-700/80' : 'text-gray-500'}`}>{sub}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAlert ? 'bg-red-100' : 'bg-emerald-50'}`}>
          <AlertTriangle className={`w-5 h-5 ${isAlert ? 'text-red-600' : 'text-emerald-600'}`} strokeWidth={2} />
        </div>
      </div>
      {isAlert && items && items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-red-200/70 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {items.slice(0, 3).map((it, i) => {
            const c = AREA_COLORS[it.area];
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: c?.light, color: c?.text }}>{it.area}</span>
                  <span className="text-[11px] text-gray-500">› {it.reparto}</span>
                  <span className="ml-auto text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">{it.score}</span>
                </div>
                <div className="text-[12px] text-gray-700 leading-relaxed">{it.commento}</div>
                {it.inspector && <div className="text-[10.5px] text-gray-500">— {it.inspector}</div>}
              </div>
            );
          })}
          {items.length > 3 && (
            <div className="text-[11px] font-semibold text-red-700 pt-1">+ {items.length - 3} altre criticità</div>
          )}
        </div>
      )}
    </div>
  );
};

const AreaRow = ({ name, score }) => {
  const c = AREA_COLORS[name];
  const hasValue = score !== null && score !== undefined;
  return (
    <div
      className="flex items-center justify-between pl-4 pr-4 py-3 border-l-4 transition-colors hover:brightness-[0.98]"
      style={{ backgroundColor: c.light, borderColor: c.accent }}
    >
      <div className="font-semibold text-[14px]" style={{ color: c.text }}>{name}</div>
      <div className="font-bold text-[14px]" style={{ color: hasValue ? c.text : '#9ca3af' }}>
        {hasValue ? score.toFixed(2) : '—'}
      </div>
    </div>
  );
};

const ReparoRow = ({ name, score }) => (
  <div className="flex items-center justify-between py-2.5 px-5 hover:bg-gray-50 transition-colors border-t border-gray-100">
    <div className="text-[13.5px] text-gray-700">{name}</div>
    <div className="text-[12.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">{score.toFixed(2)}</div>
  </div>
);

const AreaAccordion = ({ name, data, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const c = AREA_COLORS[name];
  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between pl-4 pr-5 py-3 border-l-4 transition-colors"
        style={{ backgroundColor: c.light, borderColor: c.accent }}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronUp className="w-4 h-4" style={{ color: c.text }} /> : <ChevronDown className="w-4 h-4" style={{ color: c.text }} />}
          <span className="font-semibold text-[14px]" style={{ color: c.text }}>{name}</span>
        </div>
        <div className="font-bold text-[14px]" style={{ color: c.text }}>{data.score.toFixed(2)}</div>
      </button>
      {open && (
        <div className="bg-white">
          {Object.entries(data.reparti).map(([rname, rscore]) => (
            <ReparoRow key={rname} name={rname} score={rscore} />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <div className="font-semibold text-gray-800 mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 flex-1">{p.dataKey}</span>
          <span className="font-semibold text-gray-900">{p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { getCriticita, getStats, userAudits, userCriticita, auditHistory } = useAudit();
  const [mode, setMode] = useState('safety');
  const [selectedWeek, setSelectedWeek] = useState('Settimana 22 / 2026');
  const [monthA, setMonthA] = useState('');
  const [monthB, setMonthB] = useState('');
  const [compareTab, setCompareTab] = useState('twoAreas');
  const [areaA, setAreaA] = useState('');
  const [areaB, setAreaB] = useState('');
  const [compareWeek, setCompareWeek] = useState('');
  const [compareWeek2, setCompareWeek2] = useState('');
  const [compactReparti, setCompactReparti] = useState(false);

  const stats = getStats(mode);
  // Dashboard counts ONLY user-added criticities for the latest week (mock ones live in Storico Segnalazioni)

  // Compute monthly averages from real audit history (mock + user), respecting current mode
  const monthlyData = useMemo(() => {
    const targetType = mode === 'safety' ? 'Safety' : 'Quality';
    const all = [];
    auditHistory.forEach((g) => {
      g.audits.forEach((a) => { if (a.type === targetType) all.push(a); });
    });
    (userAudits[mode] || []).forEach((a) => all.push(a));

    const byMonth = {};
    all.forEach((a) => {
      const d = parseItDate(a.date);
      const label = `${ITALIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!byMonth[label]) byMonth[label] = { sum: 0, count: 0, ordinal: d.getFullYear() * 12 + d.getMonth() };
      byMonth[label].sum += a.score;
      byMonth[label].count += 1;
    });
    const months = Object.entries(byMonth).map(([k, v]) => ({
      label: k,
      avg: +(v.sum / v.count).toFixed(2),
      ordinal: v.ordinal,
      count: v.count,
    }));
    months.sort((a, b) => b.ordinal - a.ordinal);
    return months;
  }, [mode, userAudits, auditHistory]);

  const monthLabels = useMemo(() => monthlyData.map((m) => m.label), [monthlyData]);
  const monthMap = useMemo(() => {
    const m = {};
    monthlyData.forEach((x) => { m[x.label] = x; });
    return m;
  }, [monthlyData]);

  // Build real weekly trend data from audit history (mock + user), filtered by current mode
  const realWeeklyTrend = useMemo(() => {
    const targetType = mode === 'safety' ? 'Safety' : 'Quality';
    const all = [];
    auditHistory.forEach((g) => {
      g.audits.forEach((a) => {
        if (a.type === targetType) {
          all.push({ wk: g.week, yr: g.year, area: a.area, score: a.score });
        }
      });
    });
    (userAudits[mode] || []).forEach((a) => {
      const d = parseItDate(a.date);
      const wk = getISOWeek(d);
      const yr = d.getFullYear();
      all.push({ wk, yr, area: a.area, score: a.score });
    });

    const grouped = {};
    all.forEach((x) => {
      const key = `${x.yr}-${x.wk}`;
      if (!grouped[key]) grouped[key] = { wk: x.wk, yr: x.yr, byArea: {} };
      if (!grouped[key].byArea[x.area]) grouped[key].byArea[x.area] = [];
      grouped[key].byArea[x.area].push(x.score);
    });

    const entries = Object.values(grouped).map((w) => {
      const obj = {
        week: `S${w.wk}/${w.yr}`,
        weekLabel: `Settimana ${w.wk} / ${w.yr}`,
        wkNum: w.wk,
        yr: w.yr,
      };
      Object.entries(w.byArea).forEach(([area, scores]) => {
        obj[area] = +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2);
      });
      return obj;
    });
    entries.sort((a, b) => (a.yr - b.yr) || (a.wkNum - b.wkNum));
    return entries;
  }, [mode, userAudits, auditHistory]);

  // Available week labels from real data (descending)
  const availableWeeks = useMemo(
    () => realWeeklyTrend.slice().reverse().map((w) => w.weekLabel),
    [realWeeklyTrend]
  );
  const latestWeekLabel = availableWeeks[0] || null;

  // Lookup map by weekLabel
  const weekDataByLabel = useMemo(() => {
    const m = {};
    realWeeklyTrend.forEach((w) => { m[w.weekLabel] = w; });
    return m;
  }, [realWeeklyTrend]);

  // Auto-jump to the latest week whenever the data changes
  useEffect(() => {
    if (latestWeekLabel) {
      setSelectedWeek(latestWeekLabel);
    }
  }, [latestWeekLabel]);

  // Current "live" week: derived from latest real week
  const currentWeek = useMemo(() => {
    if (latestWeekLabel) {
      const m = latestWeekLabel.match(/(\d+).*?(\d{4})/);
      return { wk: parseInt(m[1], 10), yr: parseInt(m[2], 10), label: latestWeekLabel };
    }
    return { wk: 22, yr: 2026, label: 'Settimana 22 / 2026' };
  }, [latestWeekLabel]);

  // Card criticità: only user-added in current week (mock ones live in Storico Segnalazioni)
  const currentWeekCriticita = useMemo(() => {
    const list = userCriticita[mode] || [];
    return list.filter((c) => c.wk === currentWeek.wk && c.yr === currentWeek.yr);
  }, [userCriticita, mode, currentWeek]);
  const criticitaCount = currentWeekCriticita.length;

  // Data for the "Media per Area" card based on the selected week
  const weekData = useMemo(() => {
    return weekDataByLabel[selectedWeek] || { week: selectedWeek };
  }, [selectedWeek, weekDataByLabel]);

  // Auto-pick defaults for month comparison based on available months
  useEffect(() => {
    if (monthLabels.length === 0) return;
    if (!monthA || !monthLabels.includes(monthA)) {
      setMonthA(monthLabels[Math.min(1, monthLabels.length - 1)]); // older month
    }
    if (!monthB || !monthLabels.includes(monthB)) {
      setMonthB(monthLabels[0]); // most recent month
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthLabels]);

  const valA = monthMap[monthA]?.avg ?? null;
  const valB = monthMap[monthB]?.avg ?? null;
  const hasBoth = valA !== null && valB !== null;
  const diff = hasBoth ? valB - valA : 0;

  const weekValues = (areaName, weekLabel) => {
    if (!areaName || !weekLabel) return null;
    const data = weekDataByLabel[weekLabel];
    return data && data[areaName] !== undefined ? data[areaName] : null;
  };
  // Confronto per Settimana — two modes:
  //  • twoAreas: two areas in the SAME week        → areaA vs areaB @ compareWeek
  //  • twoWeeks: SAME area in two different weeks  → areaA @ compareWeek vs areaA @ compareWeek2
  let compareA = null;
  let compareB = null;
  let labelA = '';
  let labelB = '';
  if (compareTab === 'twoAreas') {
    compareA = weekValues(areaA, compareWeek);
    compareB = weekValues(areaB, compareWeek);
    labelA = areaA;
    labelB = areaB;
  } else {
    compareA = weekValues(areaA, compareWeek);
    compareB = weekValues(areaA, compareWeek2);
    labelA = compareWeek;
    labelB = compareWeek2;
  }
  const compareColors = compareTab === 'twoAreas'
    ? { A: AREA_COLORS[areaA], B: AREA_COLORS[areaB] }
    : { A: AREA_COLORS[areaA], B: AREA_COLORS[areaA] };
  const compareReady = compareTab === 'twoAreas'
    ? !!(areaA && areaB && compareWeek)
    : !!(areaA && compareWeek && compareWeek2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-[13.5px] text-gray-500 mt-1">Panoramica punteggi e andamento audit settimanali</p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Punteggio Medio"
          value={`${stats.punteggioMedio.toFixed(2)} / ${mode === 'safety' ? 3 : 5}`}
          sub="Media tutte le aree"
          Icon={Shield} iconBg="bg-emerald-50" iconColor="text-emerald-600"
        />
        <StatCard
          label="Audit Totali"
          value={stats.auditTotali.toFixed(2)}
          sub={`Audit ${mode === 'safety' ? 'Safety' : 'Quality'} effettuati`}
          Icon={ClipboardCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600"
        />
        <StatCard
          label="Trend"
          value={`${stats.trend.toFixed(2)} / ${mode === 'safety' ? 3 : 5}`}
          sub="Ultimo punteggio settimanale"
          Icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600"
        />
        <CriticitaCard
          count={criticitaCount}
          sub={`Sett. ${currentWeek.wk} / ${currentWeek.yr} — ${criticitaCount === 0 ? 'nessuna criticità' : criticitaCount === 1 ? '1 criticità rilevata' : `${criticitaCount} criticità rilevate`}`}
          items={currentWeekCriticita}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Line chart */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">Andamento Settimanale per Area</h3>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realWeeklyTrend} margin={{ top: 8, right: 16, bottom: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis domain={[0, 3.2]} ticks={[0, 1, 2, 3]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Min', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                {AREA_ORDER.map((area) => (
                  <Line
                    key={area}
                    type="monotone"
                    dataKey={area}
                    stroke={AREA_COLORS[area].accent}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }}
                    activeDot={{ r: 5 }}
                  />
                ))}
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Media per area */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-[15px]">Media per Area</h3>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[180px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableWeeks.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-0 rounded-lg overflow-hidden">
            {MEDIA_PER_AREA_ORDER.map((area) => (
              <AreaRow key={area} name={area} score={weekData[area]} />
            ))}
          </div>
        </div>
      </div>

      {/* Comparison row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">Confronto Mensile — Media Generale</h3>
          {monthLabels.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Nessun audit registrato per la modalità selezionata</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Mese A</label>
                  <Select value={monthA} onValueChange={setMonthA}>
                    <SelectTrigger className="w-full h-10 mt-1.5"><SelectValue placeholder="Seleziona mese" /></SelectTrigger>
                    <SelectContent>{monthLabels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Mese B</label>
                  <Select value={monthB} onValueChange={setMonthB}>
                    <SelectTrigger className="w-full h-10 mt-1.5"><SelectValue placeholder="Seleziona mese" /></SelectTrigger>
                    <SelectContent>{monthLabels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                  <div className="text-xs text-gray-500">{monthA || '—'}</div>
                  <div className="text-3xl font-bold text-gray-800 mt-1">{valA !== null ? valA.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
                  <div className="text-xs text-emerald-700">{monthB || '—'}</div>
                  <div className="text-3xl font-bold text-emerald-700 mt-1">{valB !== null ? valB.toFixed(2) : '—'}</div>
                </div>
              </div>
              {hasBoth && (
                <div className={`mt-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium ${
                  diff > 0 ? 'bg-emerald-50 text-emerald-700' : diff < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                }`}>
                  {diff > 0 ? <ArrowUp className="w-4 h-4" /> : diff < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  <span>
                    {diff > 0 ? '+' : diff < 0 ? '−' : ''}
                    {Math.abs(diff).toFixed(2)}
                    {valA > 0 && (
                      <span className="ml-1.5 font-semibold">
                        ({diff > 0 ? '+' : diff < 0 ? '−' : ''}{Math.abs((diff / valA) * 100).toFixed(1)}%)
                      </span>
                    )}
                    <span className="text-xs font-normal opacity-80 ml-1.5">rispetto al mese A</span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Weekly comparison */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-[15px]">Confronto per Settimana</h3>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setCompareTab('twoAreas')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${compareTab === 'twoAreas' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>Due aree / stessa week</button>
              <button onClick={() => setCompareTab('twoWeeks')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${compareTab === 'twoWeeks' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>Stessa area / due week</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {compareTab === 'twoAreas' ? (
              <>
                <Select value={areaA} onValueChange={setAreaA}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Area A" /></SelectTrigger>
                  <SelectContent>{AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={areaB} onValueChange={setAreaB}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Area B" /></SelectTrigger>
                  <SelectContent>{AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={compareWeek} onValueChange={setCompareWeek}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Settimana" /></SelectTrigger>
                  <SelectContent>{availableWeeks.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Select value={areaA} onValueChange={setAreaA}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Seleziona area" /></SelectTrigger>
                  <SelectContent>{AREA_ORDER.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={compareWeek} onValueChange={setCompareWeek}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Settimana 1" /></SelectTrigger>
                  <SelectContent>{availableWeeks.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={compareWeek2} onValueChange={setCompareWeek2}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Settimana 2" /></SelectTrigger>
                  <SelectContent>{availableWeeks.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </>
            )}
          </div>
          <div className="mt-5">
            {!compareReady ? (
              <div className="text-center text-sm text-gray-400 py-10">
                {compareTab === 'twoAreas' ? 'Seleziona due aree e una settimana' : "Seleziona un'area e due settimane"}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: compareColors.A?.light, borderColor: compareColors.A?.bg }}>
                    <div className="text-xs font-semibold" style={{ color: compareColors.A?.text }}>
                      {compareTab === 'twoAreas' ? labelA : `${areaA} · ${labelA}`}
                    </div>
                    <div className="text-3xl font-bold mt-1" style={{ color: compareColors.A?.text }}>
                      {compareA !== null && compareA !== undefined ? compareA.toFixed(2) : '—'}
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: compareColors.B?.light, borderColor: compareColors.B?.bg }}>
                    <div className="text-xs font-semibold" style={{ color: compareColors.B?.text }}>
                      {compareTab === 'twoAreas' ? labelB : `${areaA} · ${labelB}`}
                    </div>
                    <div className="text-3xl font-bold mt-1" style={{ color: compareColors.B?.text }}>
                      {compareB !== null && compareB !== undefined ? compareB.toFixed(2) : '—'}
                    </div>
                  </div>
                </div>
                {compareA !== null && compareA !== undefined && compareB !== null && compareB !== undefined && (() => {
                  const wkDiff = compareB - compareA;
                  const pct = compareA !== 0 ? (wkDiff / compareA) * 100 : 0;
                  return (
                    <div className={`mt-3 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium ${
                      wkDiff > 0 ? 'bg-emerald-50 text-emerald-700' : wkDiff < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {wkDiff > 0 ? <ArrowUp className="w-4 h-4" /> : wkDiff < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      <span>
                        {wkDiff > 0 ? '+' : wkDiff < 0 ? '−' : ''}
                        {Math.abs(wkDiff).toFixed(2)}
                        {compareA !== 0 && (
                          <span className="ml-1.5 font-semibold">
                            ({wkDiff > 0 ? '+' : wkDiff < 0 ? '−' : ''}{Math.abs(pct).toFixed(1)}%)
                          </span>
                        )}
                        <span className="text-xs font-normal opacity-80 ml-1.5">
                          {compareTab === 'twoAreas' ? `rispetto a ${labelA}` : `rispetto a ${labelA}`}
                        </span>
                      </span>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Punteggi per Area e Reparto */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-[15px]">Punteggi per Area e Reparto</h3>
          <button
            onClick={() => setCompactReparti(!compactReparti)}
            className="flex items-center gap-2 px-3 h-8 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            {compactReparti ? 'Espandi' : 'Compatta'}
          </button>
        </div>
        <div>
          {AREA_ORDER.map((area) => (
            <AreaAccordion key={`${area}-${compactReparti}`} name={area} data={REPARTI_SCORES[area]} defaultOpen={!compactReparti} />
          ))}
        </div>
      </div>
    </div>
  );
}
