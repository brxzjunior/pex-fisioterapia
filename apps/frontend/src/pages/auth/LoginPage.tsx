import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginDev, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const navigate = useNavigate();

  // Se já autenticado, redireciona para o dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      alert('Não foi possível conectar ao Google OAuth no momento.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginDev(devEmail || undefined);
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Erro ao realizar login de desenvolvimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-8">
        {/* Header do Card */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500 rounded-2xl text-white shadow-lg shadow-brand-500/25 mb-3">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Acesso <span className="text-brand-600">Profissional</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Área administrativa segura do FisioPro
          </p>
        </div>

        {/* Botão Oficial Google OAuth */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium text-slate-700 text-sm transition-all shadow-sm group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Entrar com o Google</span>
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase absolute">
              Ambiente Acadêmico (PEX)
            </span>
          </div>

          {/* Modo Dev / Banca Acadêmica */}
          <form onSubmit={handleDevLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                E-mail de demonstração / testes
              </label>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="fisioterapeuta@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Acessar Painel (Modo Avaliação)</span>
            </button>
          </form>
        </div>

        {/* Informações de Segurança */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Acesso protegido por autenticação OAuth 2.0 e cookies HttpOnly seguros contra vulnerabilidades XSS.
          </p>
        </div>
      </div>
    </div>
  );
};
