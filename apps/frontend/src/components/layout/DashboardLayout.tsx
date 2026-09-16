import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Visão Clínica', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Pacientes', icon: Users, path: '/admin/pacientes' },
    { label: 'Agenda de Sessões', icon: Calendar, path: '/admin/atendimentos' },
    { label: 'Atividades Clínicas', icon: CheckSquare, path: '/admin/atividades' },
    { label: 'Perfil Profissional', icon: UserIcon, path: '/admin/perfil' },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-colors font-sans antialiased">
      
      {/* Topbar Mobile */}
      <div className="md:hidden bg-stone-50 dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo FisioPro" className="w-7 h-7 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-50 leading-none">
              Fisio<span className="text-emerald-800 dark:text-emerald-400">Pro</span>
            </span>
            <span className="text-[9px] font-mono text-stone-400 tracking-wider uppercase">
              Clinical OS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop e Mobile Drawer Sóbria e Adaptativa */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 flex flex-col justify-between transition-all duration-200 ease-out md:static md:translate-x-0 shadow-xs ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header da Barra Lateral */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo FisioPro" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-stone-900 dark:text-stone-100">
                  Fisio<span className="text-emerald-700 dark:text-emerald-400">Pro</span>
                </span>
                <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                  Acesso Clínico
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle className="hidden md:flex" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Badge da Responsável Técnica */}
          <div className="p-3.5 mx-3 my-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-200 dark:bg-stone-700/80 text-stone-800 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-stone-300/80 dark:border-stone-600/50 shrink-0">
              LM
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate" title="Dra. Letícia Souza de Moraes">
                Dra. Letícia Souza de Moraes
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Responsável Técnica</span>
              </div>
            </div>
          </div>

          {/* Links de Navegação Clínica */}
          <nav className="px-3 space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500 block mb-2 font-semibold">
              Módulos de Trabalho
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white dark:bg-stone-800 dark:text-emerald-300 font-semibold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Barra Lateral */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 space-y-2">
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full py-2 px-3 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-xl transition-colors border border-stone-200/80 dark:border-stone-800"
          >
            <span>Ver Área Pública</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Turno / Sair</span>
          </button>
        </div>
      </aside>

      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Container Principal do Painel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-5 lg:p-6 flex-1 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
