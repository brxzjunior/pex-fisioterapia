import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Calendar,
  CheckSquare,
  Clock,
  TrendingUp,
  CheckCircle2,
  CalendarDays,
  ListTodo,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  metrics: {
    totalPatients: number;
    activePatients: number;
    appointmentsToday: number;
    appointmentsWeek: number;
    pendingActivities: number;
  };
  upcomingAppointments: Array<{
    id: string;
    scheduledAt: string;
    type: string;
    status: string;
    patient: {
      id: string;
      fullName: string;
      phone: string;
    };
  }>;
  recentActivities: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string;
    patient?: {
      id: string;
      fullName: string;
    };
  }>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get<DashboardData>('/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Alta Prioridade
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Baixa Prioridade
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Média Prioridade
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Boas-vindas */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Painel Operacional
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            Olá, {user?.name || 'Dra. Fisioterapeuta'} 👋
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Acompanhe em tempo real a sua rotina de atendimentos e atividades.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-12 bg-slate-300 rounded" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pacientes Ativos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pacientes Ativos</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.metrics.activePatients ?? 0}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" /> Total: {data?.metrics.totalPatients ?? 0} cadastrados
              </span>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Atendimentos Hoje */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Atendimentos Hoje</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.metrics.appointmentsToday ?? 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Sessões programadas</span>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Sessões na Semana */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Sessões na Semana</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.metrics.appointmentsWeek ?? 0}
              </p>
              <span className="text-[11px] text-brand-600 font-semibold mt-1 block">Agenda semanal</span>
            </div>
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Tarefas Pendentes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Tarefas Pendentes</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.metrics.pendingActivities ?? 0}
              </p>
              <span className="text-[11px] text-amber-600 font-medium mt-1 block">Aguardando conclusão</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Grid de Duas Colunas: Próximos Atendimentos e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Atendimentos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Próximos Atendimentos</h2>
            </div>
            <Link to="/admin/atendimentos" className="text-xs text-brand-600 font-medium hover:underline">
              Ver agenda
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data?.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingAppointments.map((apt) => {
                const date = new Date(apt.scheduledAt);
                return (
                  <div
                    key={apt.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{apt.patient.fullName}</p>
                      <p className="text-[11px] text-slate-500">{apt.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-brand-100 text-brand-800 font-semibold text-[11px] rounded-md">
                        {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Nenhum atendimento agendado</p>
              <p className="text-[11px] text-slate-400 mt-1">Sua agenda está livre nos próximos dias.</p>
              <Link
                to="/admin/atendimentos"
                className="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700 underline"
              >
                + Agendar Atendimento
              </Link>
            </div>
          )}
        </div>

        {/* Tarefas Administrativas */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 text-base">Tarefas Administrativas</h2>
            </div>
            <Link to="/admin/atividades" className="text-xs text-brand-600 font-medium hover:underline">
              Ver tarefas
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    {getPriorityBadge(act.priority)}
                    <p className="text-xs font-bold text-slate-800">{act.title}</p>
                    {act.patient && (
                      <p className="text-[11px] text-brand-700 font-medium">Paciente: {act.patient.fullName}</p>
                    )}
                  </div>
                  {act.dueDate && (
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      Prazo: {new Date(act.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Tudo em dia!</p>
              <p className="text-[11px] text-slate-400 mt-1">Você não possui tarefas pendentes no momento.</p>
              <Link
                to="/admin/atividades"
                className="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700 underline"
              >
                + Criar Nova Tarefa
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
