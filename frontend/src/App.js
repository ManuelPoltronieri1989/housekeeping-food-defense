import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NuovoAudit from './pages/NuovoAudit';
import ZoneCalendario from './pages/ZoneCalendario';
import StoricoAudit from './pages/StoricoAudit';
import Configurazione from './pages/Configurazione';
import StoricoSegnalazioni from './pages/StoricoSegnalazioni';
import { Toaster } from './components/ui/sonner';
import { AuditProvider } from './context/AuditContext';

function App() {
  useEffect(() => {
    document.title = 'Housekeeping & Food Defense';
  }, []);
  return (
    <div className="App">
      <AuditProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/nuovo-audit" element={<NuovoAudit />} />
              <Route path="/storico-audit" element={<StoricoAudit />} />
              <Route path="/storico-segnalazioni" element={<StoricoSegnalazioni />} />
              <Route path="/configurazione" element={<Configurazione />} />
              <Route path="/zone-calendario" element={<ZoneCalendario />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuditProvider>
    </div>
  );
}

export default App;
