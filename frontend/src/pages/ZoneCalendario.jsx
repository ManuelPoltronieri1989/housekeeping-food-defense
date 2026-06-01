import React, { useState } from 'react';
import { Calendar, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { INSPECTORS, CALENDAR_AREAS } from '../mock';

const InspectorBadge = ({ color, area, name }) => (
  <div className="flex items-center gap-2 text-[13px]">
    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    <span className="text-gray-500">{area}:</span>
    <span className="font-semibold text-gray-800">{name}</span>
  </div>
);

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

export default function ZoneCalendario() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Zone &amp; Calendario</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">Divisione aree di controllo e turni ispettori</p>
      </div>

      {/* Inspectors */}
      <div className="bg-gradient-to-br from-emerald-50/60 to-white rounded-xl border border-emerald-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-emerald-700 text-[14px]">Settimana corrente: W23</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
          {INSPECTORS.map((i) => (
            <InspectorBadge key={i.area} color={i.color} area={i.area} name={i.name} />
          ))}
        </div>
      </div>

      <BuildingSection building="110" areas={CALENDAR_AREAS['110']} />
      <BuildingSection building="111" areas={CALENDAR_AREAS['111']} />
    </div>
  );
}
