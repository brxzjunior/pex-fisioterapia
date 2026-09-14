import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, MessageCircle, Lock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Header Público */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Fisio<span className="text-brand-600 dark:text-brand-400">Pro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#sobre" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Sobre</a>
            <a href="#servicos" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Serviços</a>
            <a href="#especialidades" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Especialidades</a>
            <a href="#contato" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Contato</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <a
              href="https://wa.me/5511999998888?text=Olá!%20Gostaria%20de%20solicitar%20uma%20avaliação%20de%20fisioterapia."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Acesso Administrativo"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Área Profissional</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Dinâmico */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FisioPro - Fisioterapia e Bem-estar Integrado. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="text-brand-700 dark:text-brand-300 font-medium bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-800">
              PEX - ADS
            </span>
            <Link to="/login" className="hover:underline text-slate-600 dark:text-slate-400">Área Restrita</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
