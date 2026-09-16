import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  User,
  ChevronRight,
  Send,
  Phone,
  ArrowUpRight,
  ShieldAlert,
  History,
  Edit2,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppointmentItem {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    birthDate?: string | null;
    administrativeNotes?: string | null;
  };
}

interface ActivityItem {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  patient?: {
    id: string;
    fullName: string;
  } | null;
}

interface DashboardStats {
  metrics: {
    totalPatients: number;
    activePatients: number;
    appointmentsToday: number;
    appointmentsWeek: number;
    pendingActivities: number;
  };
  upcomingAppointments: AppointmentItem[];
  recentActivities: ActivityItem[];
}

export const ClinicalDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  
  // Prontuário rápido e conduta da sessão ativa
  const [painLevel, setPainLevel] = useState<number>(4);
  const [clinicalConduct, setClinicalConduct] = useState<string>('');
  const [homeExercise, setHomeExercise] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [savingEvolution, setSavingEvolution] = useState<boolean>(false);
  const [evolutionFeedback, setEvolutionFeedback] = useState<string | null>(null);

  // Histórico de anotações do paciente e Edição
  const [patientNotesList, setPatientNotesList] = useState<Array<{ id: string; date: string; notes: string; type: string }>>([]);
  const [loadingNotesHistory, setLoadingNotesHistory] = useState<boolean>(false);
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [savingEditNote, setSavingEditNote] = useState<boolean>(false);

  const fetchPatientNotesHistory = async (patientId: string) => {
    try {
      setLoadingNotesHistory(true);
      const res = await api.get<AppointmentItem[]>(`/appointments?patientId=${patientId}`);
      const notesWithData = (res.data || [])
        .filter((apt) => apt.notes && apt.notes.trim().length > 0)
        .map((apt) => ({
          id: apt.id,
          date: apt.scheduledAt,
          notes: apt.notes!,
          type: apt.type,
        }));
      setPatientNotesList(notesWithData);
    } catch (err) {
      console.error('Erro ao buscar histórico de anotações:', err);
    } finally {
      setLoadingNotesHistory(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get<DashboardStats>('/dashboard/stats');
      setStats(res.data);
      if (res.data?.upcomingAppointments?.length > 0 && !selectedAppointment) {
        const firstApt = res.data.upcomingAppointments[0];
        setSelectedAppointment(firstApt);
        fetchPatientNotesHistory(firstApt.patient.id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do prontuário operacional:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Quando o paciente selecionado mudar, carrega o histórico dele
  useEffect(() => {
    if (selectedAppointment?.patient?.id) {
      fetchPatientNotesHistory(selectedAppointment.patient.id);
      setShowAllNotes(false);
      setEditingNoteId(null);
    }
  }, [selectedAppointment?.patient?.id]);

  const handleStartEditNote = (id: string, currentNote: string) => {
    setEditingNoteId(id);
    setEditingNoteText(currentNote);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleSaveEditedNote = async (id: string) => {
    if (!editingNoteText.trim()) return;
    setSavingEditNote(true);
    try {
      await api.patch(`/appointments/${id}/status`, {
        notes: editingNoteText.trim(),
      });
      // Atualiza na lista local de histórico
      setPatientNotesList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, notes: editingNoteText.trim() } : n))
      );
      // Se for a sessão atual selecionada, atualiza também
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment({
          ...selectedAppointment,
          notes: editingNoteText.trim(),
        });
      }
      setEditingNoteId(null);
      setEditingNoteText('');
      setEvolutionFeedback('Anotação atualizada com sucesso!');
      setTimeout(() => setEvolutionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar alteração da anotação.');
    } finally {
      setSavingEditNote(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, nextStatus: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: nextStatus });
      await fetchStats();
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: nextStatus as any });
      }
    } catch (err) {
      alert('Falha ao atualizar status do atendimento clínico.');
    }
  };

  const handleSaveEvolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSavingEvolution(true);
    setEvolutionFeedback(null);

    const fullNote = `[EVA: ${painLevel}/10] Conduta: ${clinicalConduct}${
      homeExercise ? ` | Exercícios Domiciliares: ${homeExercise}` : ''
    }${
      additionalNotes ? ` | Observações Gerais: ${additionalNotes}` : ''
    }`;

    try {
      const res = await api.patch(`/appointments/${selectedAppointment.id}/status`, {
        notes: fullNote,
      });
      setEvolutionFeedback('Evolução clínica registrada com sucesso.');
      const updatedNotes = res.data?.notes || fullNote;
      setSelectedAppointment({
        ...selectedAppointment,
        notes: updatedNotes,
      });
      // Atualiza também na lista do dia
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          upcomingAppointments: prev.upcomingAppointments.map((apt) =>
            apt.id === selectedAppointment.id ? { ...apt, notes: updatedNotes } : apt
          ),
        };
      });
      // Atualiza lista completa de histórico
      fetchPatientNotesHistory(selectedAppointment.patient.id);
      setClinicalConduct('');
      setHomeExercise('');
      setAdditionalNotes('');
      setTimeout(() => setEvolutionFeedback(null), 3500);
    } catch (err: any) {
      console.error('Falha ao registrar evolução clínica:', err);
      setEvolutionFeedback(err.response?.data?.message || 'Falha temporária ao registrar evolução.');
      setTimeout(() => setEvolutionFeedback(null), 4000);
    } finally {
      setSavingEvolution(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-stone-100 bg-stone-900 dark:bg-stone-100 dark:text-stone-950 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-600 animate-pulse" />
            EM ATENDIMENTO
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="font-mono text-[10px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded">
            CONFIRMADO
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="font-mono text-[10px] font-semibold text-stone-500 bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded">
            CONCLUÍDO
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="font-mono text-[10px] font-semibold text-stone-400 bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded">
            CANCELADO
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded">
            AGENDADO
          </span>
        );
    }
  };

  const activeAppointments = stats?.upcomingAppointments || [];
  const inProgressApt = activeAppointments.find((a) => a.status === 'IN_PROGRESS');

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-stone-900 dark:text-stone-100 font-sans">
      
      {/* 1. STATUS BAR SUPERIOR */}
      <header className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
        
        {/* Identificação da Responsável Técnica & CREFITO */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-mono font-bold text-sm text-stone-700 dark:text-stone-300">
            LM
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-stone-950 dark:text-stone-100">
                Dra. Letícia Souza de Moraes
              </h1>
              <span className="text-[10px] font-mono uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                CREFITO ATIVO
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Prontuário Eletrônico & Acesso Operacional Clínico
            </p>
          </div>
        </div>

        {/* Indicadores Clínicos Diretos em Linha */}
        <div className="flex items-center gap-6 divide-x divide-stone-200 dark:divide-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-mono uppercase text-[11px]">Status Consultório:</span>
            {inProgressApt ? (
              <span className="inline-flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-stone-900 dark:bg-stone-100 animate-pulse" />
                Em Sessão ({inProgressApt.patient.fullName.split(' ')[0]})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-stone-500 font-medium font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                Aguardando Paciente
              </span>
            )}
          </div>

          <div className="pl-6 hidden sm:flex items-center gap-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
            <span>
              Atendimentos Hoje: <strong className="text-stone-900 dark:text-stone-100 font-bold tabular-nums">{stats?.metrics.appointmentsToday ?? 0}</strong>
            </span>
            <span>
              Pacientes Ativos: <strong className="text-stone-900 dark:text-stone-100 font-bold tabular-nums">{stats?.metrics.activePatients ?? 0}</strong>
            </span>
          </div>

          <div className="pl-6 flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="capitalize">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>

      </header>

      {/* 2. SPLIT LAYOUT CLÍNICO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* COLUNA ESQUERDA (5 cols): Timeline Operacional da Agenda */}
        <section className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
          
          <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/40">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              <h2 className="text-xs font-semibold tracking-tight text-stone-900 dark:text-stone-100 uppercase font-mono">
                Agenda do Dia & Próximas Sessões
              </h2>
            </div>
            <Link
              to="/admin/atendimentos"
              className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:underline flex items-center gap-1 font-medium font-mono"
            >
              <span>Ver Completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400 space-y-2">
              <Calendar className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
              <p>Nenhuma sessão agendada para este momento.</p>
              <Link
                to="/admin/atendimentos"
                className="inline-block mt-2 font-mono text-stone-800 dark:text-stone-200 font-semibold hover:underline"
              >
                Cadastrar novo atendimento na agenda
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80">
              {activeAppointments.map((apt) => {
                const date = new Date(apt.scheduledAt);
                const isSelected = selectedAppointment?.id === apt.id;
                const timeString = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-stone-100 dark:bg-stone-800 border-l-4 border-stone-900 dark:border-stone-100 pl-3'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold tabular-nums text-stone-900 dark:text-stone-100">
                          {timeString}
                        </span>
                        {getStatusBadge(apt.status)}
                      </div>

                      <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-100 leading-tight">
                        {apt.patient.fullName}
                      </h3>

                      <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                        {apt.type} • {apt.durationMinutes} min
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-stone-900 dark:text-stone-100 translate-x-0.5' : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                      {apt.patient.phone && (
                        <a
                          href={`https://wa.me/55${apt.patient.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1"
                          title="Contato direto com paciente"
                        >
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tarefas Operacionais */}
          <div className="border-t border-stone-200 dark:border-stone-800 p-4 bg-stone-50/40 dark:bg-stone-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase text-stone-400 tracking-wider font-semibold">
                Tarefas Operacionais do Consultório
              </span>
              <Link to="/admin/atividades" className="text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:underline">
                Gerenciar
              </Link>
            </div>

            <div className="space-y-2">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-stone-800/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate pr-2">
                      {act.title}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400 shrink-0">
                      {act.priority === 'HIGH' ? 'Urgente' : 'Pendente'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400">Nenhuma pendência administrativa pendente.</p>
              )}
            </div>
          </div>

        </section>

        {/* COLUNA DIREITA (7 cols): Prontuário Rápido & Atendimento Clínico Ativo */}
        <section className="lg:col-span-7 space-y-4">
          
          {selectedAppointment ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden transition-colors">
              
              {/* Header do Prontuário */}
              <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded font-semibold">
                        Sessão Selecionada
                      </span>
                      <span className="font-mono text-xs text-stone-500 tabular-nums">
                        {new Date(selectedAppointment.scheduledAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(selectedAppointment.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-stone-950 dark:text-stone-50 mt-1">
                      {selectedAppointment.patient.fullName}
                    </h2>

                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-3 font-mono">
                      <span>Tel: {selectedAppointment.patient.phone}</span>
                      {selectedAppointment.patient.birthDate && (
                        <span>
                          Nasc: {new Date(selectedAppointment.patient.birthDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Ações de Status da Sessão */}
                  <div className="flex items-center gap-2">
                    {selectedAppointment.status !== 'IN_PROGRESS' && selectedAppointment.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAppointment.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar Sessão</span>
                      </button>
                    )}

                    {selectedAppointment.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAppointment.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finalizar Atendimento</span>
                      </button>
                    )}

                    <Link
                      to={`/admin/pacientes`}
                      className="inline-flex items-center gap-1 text-xs border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 px-3 py-2 rounded-lg font-medium text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Ver Ficha Completa</span>
                    </Link>
                  </div>
                </div>

                {/* Observações Prévias */}
                {selectedAppointment.patient.administrativeNotes && (
                  <div className="mt-4 p-3 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block font-mono text-[10px] uppercase text-stone-400">
                        Atenção Clínica Prévia:
                      </strong>
                      {selectedAppointment.patient.administrativeNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Registro de Evolução e Conduta da Sessão */}
              <form onSubmit={handleSaveEvolution} className="p-5 space-y-5">
                
                {/* Escala Visual Analógica de Dor (EVA) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-stone-600 dark:text-stone-400 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-stone-400" />
                      Escala Visual Analógica de Dor (EVA Atual)
                    </label>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                      Nível {painLevel} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-11 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = painLevel === num;
                      const colorClass = isSelected
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700';

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPainLevel(num)}
                          className={`h-8 text-xs font-mono font-bold rounded border transition-all ${colorClass}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>0: Sem dor</span>
                    <span>5: Dor moderada</span>
                    <span>10: Dor máxima insuportável</span>
                  </div>
                </div>

                {/* Conduta */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-600 dark:text-stone-400 font-semibold">
                    Conduta Cinesioterapêutica & Terapia Manual
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={clinicalConduct}
                    onChange={(e) => setClinicalConduct(e.target.value)}
                    placeholder="Ex: Liberação miofascial em trapézio e rombóides. Exercício pendular de Codman 3x15..."
                    className="w-full text-xs font-sans p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                {/* Exercícios Domiciliares */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-600 dark:text-stone-400 font-semibold">
                    Orientações e Exercícios Domiciliares (Home Care)
                  </label>
                  <input
                    type="text"
                    value={homeExercise}
                    onChange={(e) => setHomeExercise(e.target.value)}
                    placeholder="Ex: Crioterapia 20 min pós-esforço. Alongamento de isquiotibiais 2x ao dia."
                    className="w-full text-xs p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                {/* Anotações Gerais & Intercorrências Clínicas */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-600 dark:text-stone-400 font-semibold">
                    Anotações Gerais & Observações da Sessão
                  </label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Ex: Paciente relatou melhora ao subir escadas. Reagendou retorno para terça-feira..."
                    className="w-full text-xs font-sans p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                {/* Histórico de Anotações Clínicas com 'Mostrar Mais' e Edição */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/30 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-stone-700 dark:text-stone-300 font-semibold">
                      <History className="w-3.5 h-3.5 text-stone-500" />
                      <span>Histórico de Anotações Clínicas ({patientNotesList.length})</span>
                    </div>

                    {patientNotesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllNotes(!showAllNotes)}
                        className="text-[11px] font-mono text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white underline"
                      >
                        {showAllNotes ? 'Mostrar Menos' : `Mostrar Mais (${patientNotesList.length})`}
                      </button>
                    )}
                  </div>

                  {loadingNotesHistory ? (
                    <div className="h-10 bg-stone-200/50 dark:bg-stone-700/40 rounded animate-pulse" />
                  ) : patientNotesList.length > 0 ? (
                    <div className="space-y-2.5">
                      {(showAllNotes ? patientNotesList : patientNotesList.slice(0, 1)).map((item, idx) => {
                        const itemDate = new Date(item.date);
                        const isEditing = editingNoteId === item.id;

                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border border-stone-200/90 dark:border-stone-700/80 bg-white dark:bg-stone-900/60 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-1.5">
                              <div className="flex items-center gap-2 font-mono text-[10px] text-stone-500 dark:text-stone-400">
                                <span className="font-semibold text-stone-800 dark:text-stone-200">
                                  {idx === 0 ? 'Última Consulta' : `Consulta Anterior #${patientNotesList.length - idx}`}
                                </span>
                                <span>•</span>
                                <span>
                                  {itemDate.toLocaleDateString('pt-BR')} às{' '}
                                  {itemDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span>•</span>
                                <span className="text-stone-600 dark:text-stone-300">{item.type}</span>
                              </div>

                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditNote(item.id, item.notes)}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                  title="Editar esta anotação"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  rows={3}
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="w-full text-xs font-sans p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50/50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={handleCancelEditNote}
                                    disabled={savingEditNote}
                                    className="px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditedNote(item.id)}
                                    disabled={savingEditNote || !editingNoteText.trim()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 text-[11px] font-semibold rounded-md shadow-xs transition-colors"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{savingEditNote ? 'Salvando...' : 'Salvar Alteração'}</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-400 font-mono py-1">
                      Nenhuma anotação prévia registrada para este paciente. As próximas evoluções salvas aparecerão aqui.
                    </p>
                  )}
                </div>

                {/* Feedback e Salvar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                  {evolutionFeedback ? (
                    <span className="text-xs text-stone-900 dark:text-stone-100 font-mono font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {evolutionFeedback}
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400">
                      As anotações ficam gravadas no prontuário do paciente.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={savingEvolution || !clinicalConduct.trim()}
                    className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{savingEvolution ? 'Salvando...' : 'Gravar Evolução'}</span>
                  </button>
                </div>

              </form>

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-400 text-xs">
              Selecione um paciente na agenda ao lado para abrir o prontuário de atendimento.
            </div>
          )}

        </section>

      </div>

    </div>
  );
};

export const DashboardPage = ClinicalDashboard;
