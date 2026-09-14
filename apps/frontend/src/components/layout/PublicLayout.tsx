import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, MessageCircle, Lock } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header Público */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Fisio<span className="text-brand-600">Pro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#sobre" className="hover:text-brand-600 transition-colors">Sobre</a>
            <a href="#servicos" className="hover:text-brand-600 transition-colors">Serviços</a>
            <a href="#especialidades" className="hover:text-brand-600 transition-colors">Especialidades</a>
            <a href="#contato" className="hover:text-brand-600 transition-colors">Contato</a>
          </nav>

          <div className="flex items-center gap-3">
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
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
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FisioPro - Fisioterapia e Bem-estar Integrado. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="text-brand-700 font-medium bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
              PEX - ADS
            </span>
            <Link to="/login" className="hover:underline text-slate-600">Área Restrita</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
