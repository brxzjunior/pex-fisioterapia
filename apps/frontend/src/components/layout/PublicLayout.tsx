import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { MessageCircle, Lock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header Público Editorial */}
      <header className="sticky top-0 z-40 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Logo FisioPro"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-stone-950 dark:text-stone-50 leading-tight">
                Fisio<span className="text-emerald-800 dark:text-emerald-400">Pro</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 tracking-wider uppercase">
                Clínica & Reabilitação
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <a href="#servicos" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">Serviços Clínicos</a>
            <a href="#metodologia" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">Conduta & Métodos</a>
            <a href="#contato" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">Triagem</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <a
              href="https://wa.me/5592991779987?text=Olá,%20Dra.%20Letícia.%20Gostaria%20de%20solicitar%20uma%20avaliação."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-emerald-800 text-stone-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-emerald-100 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
              <span>Agendamento</span>
            </a>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 px-2.5 py-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
              title="Acesso Administrativo"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Acesso Clínico</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Dinâmico */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer Editorial Sóbrio */}
      <footer className="bg-stone-100 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800/80 py-10 text-xs text-stone-500 dark:text-stone-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-stone-800 dark:text-stone-200">FisioPro — Atendimento Fisioterapêutico Integrado</p>
            <p className="text-[11px] text-stone-400">Responsável Técnica: Dra. Letícia Souza de Moraes • Cuidado baseado em evidências.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/login" className="hover:underline text-stone-600 dark:text-stone-400">Acesso Clínico</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
