import React, { useMemo, useState } from 'react';
import { Calendar, MapPin, ChevronUp, ChevronDown, Users } from 'lucide-react';
import { CALENDAR_AREAS, CALENDARIO_TURNI } from '../mock';

// ISO week from a JS Date
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

const AREA_COLOR_MAP = {
  Giallo: '#eab308',
  Verde: '#22c55e',
  Viola: '#a855f7',
  Rosso: '#ef4444',
  Blu: '#3b82f6',
  Arancio: '#f97316',
  Celeste: '#06b6d4',
  Grigio: '#6b7280',
};

const AreaCard = ({ name, color, reparti, building }) => (
  <div
    className="rounded-xl p-5 text-white shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-md"
    style={{ backgroundColor: color }}
  >
    <div className="font-bold text-[16px] mb-3">{name} ({building})</div>
    <ul className="space-y-1.5">
      {reparti.map((r) => (
        <li key={r} className="text-[13px] flex items-start gap-2">
          <span className="opacity-90">•</span>
          <span className="opacity-95">{r}</span>
        </li>
      ))}
    </ul>
  </div>
);

const BuildingSection = ({ building, areas }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900 text-[15px]">Divisione Aree di Controllo — {building}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 pt-0">
          {areas.map((a) => (
            <AreaCard key={a.name} name={a.name} color={a.color} reparti={a.reparti} building={building} />
          ))}
        </div>
      )}
    </div>
  );
};

const COLUMNS = [
  { key: 'Giallo', label: 'Giallo' },
  { key: 'Verde', label: 'Verde' },
  { key: 'Viola', label: 'Viola' },
  { key: 'Rosso', label: 'Rosso' },
  { key: 'Blu', label: 'Blu' },
  { key: 'Arancio', label: 'Arancio' },
  { key: 'Celeste', label: 'Celeste' },
  { key: 'Grigio', label: 'Grigio' },
  { key: 'Jolly1', label: 'Jolly 1' },
  { key: 'Jolly2', label: 'Jolly 2' },
  { key: 'Jolly3', label: 'Jolly 3' },
  { key: 'Jolly4', label: 'Jolly 4' },
  { key: 'Jolly5', label: 'Jolly 5' },
  { key: 'Jolly6', label: 'Jolly 6' },
];

export default function ZoneCalendario() {
  const currentWeek = useMemo(() => getISOWeek(new Date()), []);
  const currentEntry = useMemo(
    () => CALENDARIO_TURNI.find((e) => e.week === currentWeek) || CALENDARIO_TURNI[CALENDARIO_TURNI.length - 1],
    [currentWeek]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Zone &amp; Calendario</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Divisione aree di controllo e turni ispettori</p>
      </div>

      {/* Current week inspectors */}
      <div className="bg-gradient-to-br from-emerald-50/60 to-white rounded-xl border border-emerald-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-emerald-700 text-[14px]">Settimana corrente: W{currentWeek}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
          {COLUMNS.slice(0, 8).map((col) => (
            <div key={col.key} className="flex items-center gap-2 text-[13px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: AREA_COLOR_MAP[col.key] }} />
              <span className="text-gray-500">{col.label}:</span>
              <span className="font-semibold text-gray-800">{currentEntry?.[col.key]}</span>
            </div>
          ))}
        </div>
      </div>

      <BuildingSection building="110" areas={CALENDAR_AREAS['110']} />
      <BuildingSection building="111" areas={CALENDAR_AREAS['111']} />

      {/* Calendario Turni Ispettori */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900 text-[15px]">Calendario Turni Ispettori</span>
          <span className="ml-auto text-[12px] text-gray-500">Settimana corrente evidenziata in verde</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Week</th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={
                      AREA_COLOR_MAP[col.key]
                        ? { backgroundColor: AREA_COLOR_MAP[col.key], color: '#fff' }
                        : { color: '#6b7280' }
                    }
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CALENDARIO_TURNI.map((entry) => {
                const isCurrent = entry.week === currentWeek;
                return (
                  <tr
                    key={entry.week}
                    className={`border-b border-gray-100 transition-colors ${
                      isCurrent ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td
                      className={`px-3 py-2 font-semibold text-[12px] sticky left-0 z-[5] ${
                        isCurrent ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-gray-700'
                      }`}
                    >
                      W{entry.week}
                    </td>
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-2 text-center whitespace-nowrap ${
                          isCurrent ? 'text-emerald-800 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {entry[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
