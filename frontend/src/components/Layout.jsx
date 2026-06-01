import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Shield, LayoutGrid, ClipboardCheck, MapPin } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/nuovo-audit', label: 'Nuovo Audit', icon: ClipboardCheck },
  { to: '/zone-calendario', label: 'Zone & Calendario', icon: MapPin },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-[#0f1115] text-white flex flex-col">
        <div className="px-5 pt-5 pb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ef4444] flex items-center justify-center shrink-0 shadow-lg shadow-red-900/30">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] text-white">Housekeeping &amp; Food Defense</div>
            <div className="text-xs text-gray-400 mt-0.5">Magazzino</div>
          </div>
        </div>

        <nav className="px-3 mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
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
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div key={location.pathname} className="hk-fade-in px-10 py-8 max-w-[1500px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
