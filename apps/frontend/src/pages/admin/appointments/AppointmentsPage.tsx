import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import {
  Plus,
  CheckCircle2,
  PlayCircle,
  XCircle,
  X,
  FileText,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Phone,
} from 'lucide-react';

interface PatientOption {
  id: string;
  fullName: string;
}

interface Appointment {
  id: string;
  patientId: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
  };
}

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedPatientIds, setExpandedPatientIds] = useState<Record<string, boolean>>({});

  // Controle de Modal de Agendamento
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    scheduledAt: '',
    durationMinutes: 60,
    type: 'Sessão Fisioterapia Ortopédica',
    notes: '',
  });

  const toggleExpandPatient = (patientId: string) => {
    setExpandedPatientIds((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get<Appointment[]>('/appointments', { params });
      setAppointments(res.data);
    } catch (err) {
      console.error('Erro ao buscar atendimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get<PatientOption[]>('/patients', { params: { status: 'ACTIVE' } });
      setPatients(res.data);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [statusFilter]);

  const handleOpenModal = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);

    setFormData({
      patientId: patients.length > 0 ? patients[0].id : '',
      scheduledAt: localISOTime,
      durationMinutes: 60,
      type: 'Sessão Fisioterapia Ortopédica',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      alert('Selecione um paciente para agendar.');
      return;
    }

    try {
      await api.post('/appointments', {
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
      setModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao agendar atendimento.');
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar status do atendimento.');
    }
  };

  const handleDeleteAppointment = async (id: string, patientName: string) => {
    const confirmDelete = window.confirm(
      `Deseja realmente apagar o atendimento de ${patientName}? Esta ação removerá o registro permanentemente.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/appointments/${id}`);
      await fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir o atendimento.');
    }
  };

  // Agrupa os atendimentos por paciente para uma visualização limpa e organizada
  const groupedPatients = React.useMemo(() => {
    const groups: Record<
      string,
      {
        patientId: string;
        patientName: string;
        patientPhone: string;
        items: Appointment[];
      }
    > = {};

    const filtered = appointments.filter((apt) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const name = apt.patient.fullName.toLowerCase();
      const phone = (apt.patient.phone || '').toLowerCase();
      return name.includes(term) || phone.includes(term);
    });

    for (const apt of filtered) {
      const pId = apt.patient.id;
      if (!groups[pId]) {
        groups[pId] = {
          patientId: pId,
          patientName: apt.patient.fullName,
          patientPhone: apt.patient.phone,
          items: [],
        };
      }
      groups[pId].items.push(apt);
    }

    return Object.values(groups);
  }, [appointments, searchTerm]);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            AGENDADO
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-600">
            CONFIRMADO
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 animate-pulse">
            EM ATENDIMENTO
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
            CONCLUÍDO
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700">
            CANCELADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-stone-900 dark:text-stone-100 font-sans">
      
      {/* Header Cirúrgico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900/90 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 font-semibold">
              Módulo Agenda
            </span>
            <span className="font-mono text-xs text-stone-500 tabular-nums">
              Total: {appointments.length} atendimento(s)
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-950 dark:text-stone-100 mt-1">
            Agenda Clínica de Atendimentos
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
            Controle de sessões, evolução de status e fluxo do paciente no consultório.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Barra de Busca e Filtros Integrados */}
      <div className="bg-white dark:bg-stone-900/90 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Campo de Busca por Paciente */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do paciente ou telefone..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'SCHEDULED', label: 'Agendados' },
            { id: 'CONFIRMED', label: 'Confirmados' },
            { id: 'IN_PROGRESS', label: 'Em Andamento' },
            { id: 'COMPLETED', label: 'Finalizados' },
            { id: 'CANCELLED', label: 'Cancelados' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                statusFilter === item.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pacientes com Histórico de Atendimentos Expansível */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-6 space-y-3 bg-white dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : groupedPatients.length > 0 ? (
          groupedPatients.map((group) => {
            const isExpanded = expandedPatientIds[group.patientId] ?? false;
            const nextOrRecentApt = group.items[0];

            return (
              <div
                key={group.patientId}
                className="bg-white dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm transition-all overflow-hidden"
              >
                {/* Linha Principal do Paciente (Header Clicável) */}
                <div
                  onClick={() => toggleExpandPatient(group.patientId)}
                  className="p-4 sm:p-4.5 cursor-pointer hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors flex items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-mono font-bold text-xs text-stone-700 dark:text-stone-300 shrink-0">
                      {group.patientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-stone-950 dark:text-stone-100 text-sm truncate">
                          {group.patientName}
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                          {group.items.length} {group.items.length === 1 ? 'sessão' : 'sessões'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-mono flex-wrap">
                        {group.patientPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {group.patientPhone}
                          </span>
                        )}
                        {nextOrRecentApt && (
                          <span className="text-[11px] text-stone-600 dark:text-stone-300">
                            Última/Próxima:{' '}
                            <strong>
                              {new Date(nextOrRecentApt.scheduledAt).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(nextOrRecentApt.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-stone-400 hidden sm:inline">
                      {isExpanded ? 'Ocultar histórico' : 'Ver histórico'}
                    </span>
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Histórico Detalhado do Paciente (Aberto ao Clicar) */}
                {isExpanded && (
                  <div className="border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 p-3 sm:p-4 space-y-2.5">
                    <div className="px-1 text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold flex items-center justify-between">
                      <span>Sessões & Prontuário Registrados ({group.items.length})</span>
                    </div>

                    <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80 border border-stone-200/80 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
                      {group.items.map((apt) => {
                        const date = new Date(apt.scheduledAt);
                        return (
                          <div
                            key={apt.id}
                            className="p-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg flex flex-col items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700 min-w-[56px] font-mono">
                                <span className="text-[9px] uppercase text-stone-400 font-semibold">
                                  {date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                </span>
                                <span className="text-base font-bold text-stone-900 dark:text-stone-100 leading-none my-0.5 tabular-nums">
                                  {date.getDate()}
                                </span>
                                <span className="text-[9px] text-stone-500 tabular-nums">
                                  {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                                    {apt.type}
                                  </span>
                                  {getStatusBadge(apt.status)}
                                  <span className="text-[10px] font-mono text-stone-400">
                                    {apt.durationMinutes} min
                                  </span>
                                </div>

                                {apt.notes && (
                                  <p className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1 font-sans bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                                    <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-wrap">{apt.notes}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Ações da Sessão */}
                            <div className="flex items-center gap-2 self-end md:self-center flex-wrap pt-1 md:pt-0">
                              {apt.status === 'SCHEDULED' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-mono font-semibold rounded-lg border border-stone-300 dark:border-stone-600 transition-colors"
                                  title="Confirmar presença com o paciente"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirmar</span>
                                </button>
                              )}

                              {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'IN_PROGRESS')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 text-xs font-mono font-semibold rounded-lg transition-colors shadow-sm"
                                  title="Iniciar sessão de atendimento"
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>Iniciar</span>
                                </button>
                              )}

                              {apt.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-mono font-semibold rounded-lg shadow-sm transition-colors"
                                  title="Concluir sessão e arquivar no histórico"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Finalizar</span>
                                </button>
                              )}

                              {/* Botão de Cancelar Sessão (X) */}
                              {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-transparent hover:border-stone-200 dark:hover:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                  title="Cancelar Atendimento"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              {/* Botão de Apagar Permanentemente (Lixeira) */}
                              <button
                                onClick={() => handleDeleteAppointment(apt.id, apt.patient.fullName)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                title="Apagar Atendimento da Agenda"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-14 text-center bg-white dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <User className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
            <p className="text-[11px] text-stone-400 mt-0.5">
              {searchTerm ? 'Tente buscar por outro termo ou limpe o filtro.' : 'Agende uma nova sessão para preencher a agenda.'}
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-3 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Atendimento</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Agendamento Sóbrio */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider font-semibold">
                  Novo Horário
                </span>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Agendar Atendimento Clínico
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Paciente *
                </label>
                {patients.length > 0 ? (
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  >
                    {patients.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-stone-500">
                    Nenhum paciente cadastrado ativo. Cadastre um paciente primeiro.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Data e Horário *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Duração da Sessão *
                  </label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Tipo / Linha de Cuidado *
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Avaliação Fisioterapêutica, Pilates Clínico, Ortopedia"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Observações da Sessão
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Queixa álgica em ombro direito; trazer exames de imagem."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
