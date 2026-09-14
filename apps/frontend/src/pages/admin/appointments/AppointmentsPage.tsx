import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import {
  Calendar,
  Plus,
  Filter,
  CheckCircle2,
  PlayCircle,
  XCircle,
  CalendarCheck,
  X,
  FileText,
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

  // Controle de Modal de Agendamento
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    scheduledAt: '',
    durationMinutes: 60,
    type: 'Sessão Fisioterapia Ortopédica',
    notes: '',
  });

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
    // Sugere o horário atual formatado para datetime-local
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
      await api.patch(`/appointments/${id}`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert('Erro ao atualizar status do atendimento.');
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Agendado
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            Confirmado
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            Em Andamento
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Finalizado
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Agenda Clínica
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Atendimentos</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Controle de sessões, evolução de status e fluxo do paciente.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Filtros por Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Status:</span>
        </div>

        <div className="flex items-center gap-1.5">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === item.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => {
              const date = new Date(apt.scheduledAt);
              return (
                <div
                  key={apt.id}
                  className="p-4 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-brand-100/60 min-w-[64px]">
                      <span className="text-[10px] font-bold uppercase text-brand-500">
                        {date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-xl font-extrabold text-brand-700 leading-none my-0.5">
                        {date.getDate()}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {apt.patient.fullName}
                        </h3>
                        {getStatusBadge(apt.status)}
                      </div>

                      <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-brand-600" />
                        {apt.type} • {apt.durationMinutes} min
                      </p>

                      {apt.notes && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações de Transição de Status */}
                  <div className="flex items-center gap-1.5 self-end md:self-center flex-wrap">
                    {apt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold rounded-xl border border-cyan-200 transition-colors"
                        title="Confirmar presença com o paciente"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar</span>
                      </button>
                    )}

                    {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors"
                        title="Iniciar sessão de atendimento"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Iniciar</span>
                      </button>
                    )}

                    {apt.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                        title="Concluir sessão e arquivar no histórico"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finalizar Sessão</span>
                      </button>
                    )}

                    {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                        className="inline-flex items-center gap-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Cancelar Atendimento"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum atendimento nesta categoria</p>
            <p className="text-xs text-slate-400 mt-1">
              Agende uma nova sessão de fisioterapia para organizar a agenda.
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Atendimento</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Agendamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Novo Agendamento</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paciente *
                </label>
                {patients.length > 0 ? (
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                  >
                    {patients.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-500">
                    Nenhum paciente cadastrado ativo. Cadastre um paciente primeiro.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data e Horário *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duração (minutos) *
                  </label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo / Especialidade do Atendimento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Avaliação Fisioterapêutica, Pilates Clínico, Ortopedia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações da Sessão
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Sessão focada em fortalecimento de manguito rotador; trazer roupas confortáveis."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
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
