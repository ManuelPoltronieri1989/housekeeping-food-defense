import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NuovoAudit from './pages/NuovoAudit';
import ZoneCalendario from './pages/ZoneCalendario';
import StoricoAudit from './pages/StoricoAudit';
import Configurazione from './pages/Configurazione';
import StoricoSegnalazioni from './pages/StoricoSegnalazioni';
import AuthPage from './pages/AuthPage';
import { Toaster } from './components/ui/sonner';
import { AuditProvider } from './context/AuditContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const OWNER_ONLY_PATHS = ['/', '/storico-audit', '/storico-segnalazioni', '/configurazione'];

function OwnerGuard({ children }) {
  const { isOwner } = useAuth();
  const location = useLocation();
  if (!isOwner && OWNER_ONLY_PATHS.includes(location.pathname)) {
    return <Navigate to="/nuovo-audit" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }
  if (!user) return <AuthPage />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<OwnerGuard><Dashboard /></OwnerGuard>} />
          <Route path="/nuovo-audit" element={<NuovoAudit />} />
          <Route path="/storico-audit" element={<OwnerGuard><StoricoAudit /></OwnerGuard>} />
          <Route path="/storico-segnalazioni" element={<OwnerGuard><StoricoSegnalazioni /></OwnerGuard>} />
          <Route path="/configurazione" element={<OwnerGuard><Configurazione /></OwnerGuard>} />
          <Route path="/zone-calendario" element={<ZoneCalendario />} />
          <Route path="*" element={<Navigate to="/nuovo-audit" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  useEffect(() => { document.title = 'Housekeeping & Food Defense'; }, []);
  return (
    <div className="App">
      <AuthProvider>
        <AuditProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuditProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
