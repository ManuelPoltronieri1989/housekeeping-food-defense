import React, { useState, useMemo } from 'react';
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
  WEEKLY_TREND, DASHBOARD_STATS, MONTHS, WEEKS
} from '../mock';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';

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
        <div className="mt-3 pt-3 border-t border-red-200/70 space-y-2.5">
          {items.map((it, i) => {
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
        </div>
      )}
    </div>
  );
};

const AreaRow = ({ name, score }) => {
  const c = AREA_COLORS[name];
  return (
    <div
      className="flex items-center justify-between pl-4 pr-4 py-3 border-l-4 transition-colors hover:brightness-[0.98]"
      style={{ backgroundColor: c.light, borderColor: c.accent }}
    >
      <div className="font-semibold text-[14px]" style={{ color: c.text }}>{name}</div>
      <div className="font-bold text-[14px]" style={{ color: c.text }}>{score.toFixed(2)}</div>
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
  const [mode, setMode] = useState('safety');
  const [selectedWeek, setSelectedWeek] = useState('Settimana 22 / 2026');
  const [monthA, setMonthA] = useState('Maggio 2026');
  const [monthB, setMonthB] = useState('Maggio 2026');
  const [compareTab, setCompareTab] = useState('twoAreas');
  const [areaA, setAreaA] = useState('');
  const [areaB, setAreaB] = useState('');
  const [compareWeek, setCompareWeek] = useState('');
  const [compactReparti, setCompactReparti] = useState(false);

  const stats = DASHBOARD_STATS[mode];

  const weekData = useMemo(() => {
    const wk = selectedWeek.match(/\d+/)?.[0];
    return WEEKLY_TREND.find((w) => w.week.includes(`S${wk}/`)) || WEEKLY_TREND[WEEKLY_TREND.length - 1];
  }, [selectedWeek]);

  // monthly compare mock (always 2.95 for May, vary for others)
  const monthValue = (m) => {
    const idx = MONTHS.indexOf(m);
    const vals = [2.80, 2.85, 2.88, 2.92, 2.95, 2.96, 2.94, 2.90, 2.93, 2.91, 2.89, 2.87];
    return vals[idx] ?? 2.95;
  };
  const valA = monthValue(monthA);
  const valB = monthValue(monthB);
  const diff = valB - valA;

  const weekValues = (areaName, weekLabel) => {
    if (!areaName || !weekLabel) return null;
    const wk = weekLabel.match(/\d+/)?.[0];
    const data = WEEKLY_TREND.find((w) => w.week.includes(`S${wk}/`));
    return data ? data[areaName] : null;
  };
  const compareA = compareTab === 'twoAreas' ? weekValues(areaA, compareWeek) : weekValues(areaA, compareWeek);
  const compareB = weekValues(areaB, compareWeek);

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
          count={stats.criticita}
          sub={`${stats.settimana} — ${stats.criticita === 0 ? 'nessuna criticità' : stats.criticita === 1 ? '1 criticità rilevata' : `${stats.criticita} criticità rilevate`}`}
          items={stats.criticitaList}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Line chart */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">Andamento Settimanale per Area</h3>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_TREND} margin={{ top: 8, right: 16, bottom: 8, left: -16 }}>
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
                {WEEKS.slice().reverse().map((w) => (
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">Mese A</label>
              <Select value={monthA} onValueChange={setMonthA}>
                <SelectTrigger className="w-full h-10 mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Mese B</label>
              <Select value={monthB} onValueChange={setMonthB}>
                <SelectTrigger className="w-full h-10 mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <div className="text-xs text-gray-500">{monthA}</div>
              <div className="text-3xl font-bold text-gray-800 mt-1">{valA.toFixed(2)}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
              <div className="text-xs text-emerald-700">{monthB}</div>
              <div className="text-3xl font-bold text-emerald-700 mt-1">{valB.toFixed(2)}</div>
            </div>
          </div>
          <div className={`mt-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium ${
            diff > 0 ? 'bg-emerald-50 text-emerald-700' : diff < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
          }`}>
            {diff > 0 ? <ArrowUp className="w-4 h-4" /> : diff < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            <span>{Math.abs(diff).toFixed(2)} rispetto al mese A</span>
          </div>
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
              <SelectContent>{WEEKS.slice().reverse().map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="mt-5">
            {!areaA || !areaB || !compareWeek ? (
              <div className="text-center text-sm text-gray-400 py-10">Seleziona due aree e una settimana</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-4 border" style={{ backgroundColor: AREA_COLORS[areaA].light, borderColor: AREA_COLORS[areaA].bg }}>
                  <div className="text-xs font-semibold" style={{ color: AREA_COLORS[areaA].text }}>{areaA}</div>
                  <div className="text-3xl font-bold mt-1" style={{ color: AREA_COLORS[areaA].text }}>{compareA?.toFixed(2)}</div>
                </div>
                <div className="rounded-lg p-4 border" style={{ backgroundColor: AREA_COLORS[areaB].light, borderColor: AREA_COLORS[areaB].bg }}>
                  <div className="text-xs font-semibold" style={{ color: AREA_COLORS[areaB].text }}>{areaB}</div>
                  <div className="text-3xl font-bold mt-1" style={{ color: AREA_COLORS[areaB].text }}>{compareB?.toFixed(2)}</div>
                </div>
              </div>
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
