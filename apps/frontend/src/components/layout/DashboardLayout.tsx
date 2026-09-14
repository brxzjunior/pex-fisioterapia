import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Pacientes', icon: Users, path: '/admin/pacientes' },
    { label: 'Atendimentos', icon: Calendar, path: '/admin/atendimentos' },
    { label: 'Atividades', icon: CheckSquare, path: '/admin/atividades' },
    { label: 'Meu Perfil', icon: UserIcon, path: '/admin/perfil' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-500 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900">Fisio<span className="text-brand-600">Pro</span></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop e Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Header da Sidebar */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">
                Fisio<span className="text-brand-400">Pro</span>
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badge Perfil Profissional */}
          <div className="p-4 mx-3 my-4 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Fisioterapeuta'}</p>
              <div className="flex items-center gap-1 text-[11px] text-brand-400">
                <ShieldCheck className="w-3 h-3 text-brand-400" />
                <span>Profissional</span>
              </div>
            </div>
          </div>

          {/* Links de Navegação */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar com Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            Ver Portfólio Público ↗
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Conteúdo Principal do Painel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
