import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Shield, LayoutGrid, ClipboardCheck, MapPin, History, Settings, AlertTriangle, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true, ownerOnly: true },
  { to: '/nuovo-audit', label: 'Nuovo Audit', icon: ClipboardCheck, ownerOnly: false },
  { to: '/storico-audit', label: 'Storico Audit', icon: History, ownerOnly: true },
  { to: '/storico-segnalazioni', label: 'Storico Segnalazioni', icon: AlertTriangle, ownerOnly: true },
  { to: '/configurazione', label: 'Configurazione', icon: Settings, ownerOnly: true },
  { to: '/zone-calendario', label: 'Zone & Calendario', icon: MapPin, ownerOnly: false },
];

export default function Layout() {
  const location = useLocation();
  const { user, isOwner, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <aside className="w-[260px] shrink-0 bg-[#0f1115] text-white flex flex-col">
        <div className="px-5 pt-5 pb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ef4444] flex items-center justify-center shrink-0 shadow-lg shadow-red-900/30">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] text-white">Housekeeping &amp; Food Defense</div>
            <div className="text-xs text-gray-400 mt-0.5">Logistica</div>
          </div>
        </div>

        <nav className="px-3 mt-2 flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const blocked = item.ownerOnly && !isOwner;
            if (blocked) {
              return (
                <div
                  key={item.to}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed opacity-50 select-none"
                  title="Riservato all'Owner"
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span>{item.label}</span>
                  <Lock className="w-3 h-3 ml-auto" />
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#ef4444] text-white shadow-md shadow-red-900/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="mt-auto p-3 border-t border-white/10">
            <div className="px-2 py-2">
              <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
              <div className={`inline-block text-[10px] mt-1 px-1.5 py-0.5 rounded font-semibold ${
                isOwner ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {isOwner ? 'OWNER' : 'OPERATORE'}
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-1 w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/5 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0">
        <div key={location.pathname} className="hk-fade-in px-10 py-8 max-w-[1500px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
