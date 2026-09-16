import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, User, Phone, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, login, register, verifyEmail, resendVerificationCode, forgotPassword, resetPassword, loginDev, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fallbackCode, setFallbackCode] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  // Se já autenticado, redireciona para o dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFallbackCode(null);
  };

  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível conectar ao Google OAuth no momento.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      if (err.response?.data?.requiresVerification) {
        setSuccessMsg(err.response.data.message);
        setVerificationCode('');
        if (err.response.data.fallbackCode) {
          setFallbackCode(err.response.data.fallbackCode);
        }
        setMode('verify');
      } else {
        setErrorMsg(err.response?.data?.message || 'E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordStrong = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd)
    );
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!isPasswordStrong(password)) {
      setErrorMsg('A senha precisa ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, phone);
      if (res.requiresVerification) {
        setSuccessMsg(res.message || 'Código gerado com sucesso!');
        setVerificationCode('');
        if (res.fallbackCode) {
          setFallbackCode(res.fallbackCode);
        }
        setMode('verify');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erro ao criar conta. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await verifyEmail(email, verificationCode);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Código de verificação incorreto ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await resendVerificationCode(email);
      setSuccessMsg(res.message || 'Novo código emitido.');
      if (res.fallbackCode) {
        setFallbackCode(res.fallbackCode);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erro ao reenviar código de verificação.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message || 'Instruções para redefinição enviadas com sucesso.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setMode('reset');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Não foi possível processar a recuperação de senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!isPasswordStrong(newPassword)) {
      setErrorMsg('A nova senha precisa ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(resetToken, newPassword);
      setSuccessMsg(res.message || 'Senha redefinida com sucesso. Faça login com suas novas credenciais.');
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Token de recuperação inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      await loginDev(email || undefined);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg('Erro ao realizar acesso de teste.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100 dark:bg-stone-950 font-sans transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/80 dark:border-stone-800 p-7 sm:p-8">
        
        {/* Header do Card */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm mb-3">
            <img src="/logo.png" alt="Logo FisioPro" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Acesso Clínico
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
            Portal administrativo & prontuário profissional
          </p>
        </div>

        {/* Notificações de Status */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Botão Oficial Google OAuth */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium text-stone-700 dark:text-stone-200 text-xs sm:text-sm transition-all shadow-2xs group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
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
            <ArrowRight className="w-4 h-4 ml-auto text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Separador */}
        <div className="relative flex items-center justify-center my-5">
          <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
          <span className="bg-white dark:bg-stone-900 px-3 text-[10px] font-semibold tracking-wider text-stone-400 uppercase absolute">
            Ou com e-mail e senha
          </span>
        </div>

        {/* Alternador de Modos (Entrar / Criar Conta) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800/80 p-1 mb-5">
            <button
              type="button"
              onClick={() => { clearMessages(); setMode('login'); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { clearMessages(); setMode('register'); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Formulário: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                E-mail Profissional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('forgot'); }}
                  className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Acessando...' : 'Acessar Acesso Clínico'}</span>
            </button>
          </form>
        )}

        {/* Formulário: CADASTRO / CRIAR CONTA */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dr. João da Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                E-mail *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                WhatsApp / Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(92) 99999-9999"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                Criar Senha Segura *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ex: Fisio@2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
              />

              {/* Checklist de Segurança da Senha */}
              <div className="mt-2.5 p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-[11px] space-y-1 text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5 font-medium text-[11px] text-stone-700 dark:text-stone-300 mb-1">
                  <span>Requisitos de segurança da senha:</span>
                </div>
                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}>
                  <span>• Mínimo de 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}>
                  <span>• Letras maiúsculas e minúsculas (A-Z, a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}>
                  <span>• Pelo menos um número (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) ? 'text-emerald-700 dark:text-emerald-400 font-medium' : ''}`}>
                  <span>• Pelo menos um caractere especial (!@#$%)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Criando Conta...' : 'Cadastrar e Receber Código'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Formulário: VERIFICAR E-MAIL VIA CÓDIGO */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
              <p>
                Insira o código de 6 dígitos enviado para <span className="font-semibold text-stone-900 dark:text-stone-100">{email}</span>.
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Se você não encontrar o e-mail na Caixa de Entrada, lembre-se de conferir sua pasta de <strong>Spam / Lixo Eletrônico</strong>.
              </p>
            </div>

            {/* Aviso do Modo Híbrido (Caso Resend esteja em Sandbox/Teste sem domínio próprio validado) */}
            {fallbackCode && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Modo Híbrido Ativo (Sandbox Resend)</p>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      Como o Resend em plano gratuito só entrega emails externos após verificar domínio em <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">resend.com/domains</code>, o seu código de validação é:
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-amber-500/15 p-2 rounded-lg border border-amber-500/20">
                  <span className="font-mono text-base font-bold tracking-widest text-amber-950 dark:text-amber-100">
                    {fallbackCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(fallbackCode)}
                    className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-medium px-2.5 py-1 rounded-md transition-colors"
                  >
                    Inserir código
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                Código de 6 Dígitos
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.trim())}
                placeholder="Ex: 839201"
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-center tracking-widest font-mono text-base focus:ring-1 focus:ring-stone-400 outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Validando...' : 'Confirmar Código e Acessar'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 underline text-[11px]"
                >
                  Não recebeu? Reenviar código
                </button>
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('login'); }}
                  className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 underline text-[11px]"
                >
                  Voltar ao login
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Formulário: ESQUECI A SENHA */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                Informe seu E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { clearMessages(); setMode('login'); }}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-colors"
              >
                {loading ? 'Gerando...' : 'Recuperar Senha'}
              </button>
            </div>
          </form>
        )}

        {/* Formulário: REDEFINIR SENHA */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                Código / Token de Redefinição
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Cole o código de recuperação"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                Nova Senha Segura (mínimo 8 dígitos)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ex: Fisio@2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
              />

              <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                A nova senha deve ter 8+ dígitos, maiúscula, minúscula, número e símbolo.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}

        {/* Acesso Rápido de Testes */}
        <div className="mt-6 pt-4 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400 text-[11px]">Ambiente de Demonstração:</span>
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={loading}
            className="text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-200 underline font-medium text-[11px]"
          >
            Acesso Rápido de Testes
          </button>
        </div>

        {/* Informações de Segurança */}
        <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-stone-800 flex items-start gap-2.5 text-[11px] text-stone-400 dark:text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500 shrink-0 mt-0.5" />
          <p>
            Criptografia de ponta a ponta com senhas hasheadas e cookies HttpOnly contra vulnerabilidades XSS.
          </p>
        </div>

      </div>
    </div>
  );
};
