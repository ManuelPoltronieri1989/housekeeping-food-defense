import React, { useState } from 'react';
import axios from 'axios';
import { Shield, LogIn, UserPlus, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Accesso effettuato');
      } else if (mode === 'register') {
        if (!name.trim()) { toast.error('Inserisci il nome'); setLoading(false); return; }
        if (password.length < 6) { toast.error('Password minimo 6 caratteri'); setLoading(false); return; }
        await register(email, password, name);
        toast.success('Registrazione completata');
      } else if (mode === 'reset') {
        if (!email.trim()) { toast.error("Inserisci l'email"); setLoading(false); return; }
        if (newPassword.length < 6) { toast.error('La nuova password deve avere almeno 6 caratteri'); setLoading(false); return; }
        if (newPassword !== confirmPassword) { toast.error('Le password non coincidono'); setLoading(false); return; }
        await axios.post(`${API}/auth/reset-password`, { email, new_password: newPassword });
        toast.success('Password aggiornata. Ora puoi accedere.');
        setMode('login');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Errore di autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/70 w-full max-w-md p-7" data-testid="auth-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-semibold text-[15px] text-gray-900">Housekeeping &amp; Food Defense</div>
            <div className="text-xs text-gray-500">Logistica</div>
          </div>
        </div>

        {mode !== 'reset' ? (
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => setMode(m)} data-testid={`auth-tab-${m}`}
                className={`flex-1 h-9 text-sm font-medium rounded-md transition-colors ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMode('login')}
            data-testid="reset-back-btn"
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Torna al login
          </button>
        )}

        {mode === 'reset' && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-[15px] text-gray-900">Reimposta password</h2>
            </div>
            <p className="text-[12px] text-gray-500">Inserisci la tua email e una nuova password.</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3" data-testid="auth-form">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-gray-600">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario Rossi" className="mt-1.5 h-10" data-testid="register-name-input" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azienda.com" className="mt-1.5 h-10" required data-testid="auth-email-input" />
          </div>

          {mode !== 'reset' ? (
            <div>
              <label className="text-xs font-medium text-gray-600">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caratteri" className="mt-1.5 h-10" required minLength={6} data-testid="auth-password-input" />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-gray-600">Nuova password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 caratteri" className="mt-1.5 h-10" required minLength={6} data-testid="reset-new-password-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Conferma password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ripeti la nuova password" className="mt-1.5 h-10" required minLength={6} data-testid="reset-confirm-password-input" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} data-testid="auth-submit-btn"
            className="w-full mt-2 flex items-center justify-center gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" />
              : mode === 'login' ? <LogIn className="w-4 h-4" />
              : mode === 'register' ? <UserPlus className="w-4 h-4" />
              : <KeyRound className="w-4 h-4" />}
            {mode === 'login' ? 'Accedi' : mode === 'register' ? 'Registrati' : 'Aggiorna password'}
          </button>

          {mode === 'login' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode('reset')}
                data-testid="forgot-password-link"
                className="text-[12px] text-gray-500 hover:text-emerald-700 hover:underline transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          )}
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-5">
          L&apos;account Owner è riservato a <span className="font-medium">poltronieri.manuel@gmail.com</span>.<br />
          Tutti gli altri utenti accedono come Operatore.
        </p>
      </div>
    </div>
  );
}
