import React, { useState } from 'react';
import { Shield, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Accesso effettuato');
      } else {
        if (!name.trim()) { toast.error('Inserisci il nome'); setLoading(false); return; }
        if (password.length < 6) { toast.error('Password minimo 6 caratteri'); setLoading(false); return; }
        await register(email, password, name);
        toast.success('Registrazione completata');
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Errore di autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/70 w-full max-w-md p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-semibold text-[15px] text-gray-900">Housekeeping &amp; Food Defense</div>
            <div className="text-xs text-gray-500">Logistica</div>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 h-9 text-sm font-medium rounded-md transition-colors ${
                mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'login' ? 'Accedi' : 'Registrati'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-gray-600">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario Rossi" className="mt-1.5 h-10" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azienda.com" className="mt-1.5 h-10" required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caratteri" className="mt-1.5 h-10" required minLength={6} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {mode === 'login' ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-5">
          L'account Owner è riservato a <span className="font-medium">poltronieri.manuel@gmail.com</span>.<br />
          Tutti gli altri utenti accedono come Operatore.
        </p>
      </div>
    </div>
  );
}
