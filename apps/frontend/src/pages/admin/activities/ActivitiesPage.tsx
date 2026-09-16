import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import {
  Plus,
  CheckCircle2,
  Trash2,
  X,
  Clock,
} from 'lucide-react';

interface PatientOption {
  id: string;
  fullName: string;
}

interface Activity {
  id: string;
  patientId?: string | null;
  title: string;
  description?: string | null;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string | null;
  patient?: {
    id: string;
    fullName: string;
  } | null;
}

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal de Nova Tarefa
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Acompanhamento',
    priority: 'MEDIUM',
    patientId: '',
    dueDate: '',
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      const res = await api.get<Activity[]>('/activities', { params });
      setActivities(res.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
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
    fetchActivities();
    fetchPatients();
  }, [statusFilter, priorityFilter]);

  const handleOpenModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Acompanhamento',
      priority: 'MEDIUM',
      patientId: '',
      dueDate: '',
    });
    setModalOpen(true);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/activities', {
        ...formData,
        patientId: formData.patientId || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
      setModalOpen(false);
      fetchActivities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar tarefa.');
    }
  };

  const handleToggleComplete = async (activity: Activity) => {
    const newStatus = activity.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.patch(`/activities/${activity.id}`, { status: newStatus });
      fetchActivities();
    } catch (err) {
      alert('Erro ao atualizar status da tarefa.');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('Deseja realmente remover esta atividade?')) return;
    try {
      await api.delete(`/activities/${id}`);
      fetchActivities();
    } catch (err) {
      alert('Erro ao excluir tarefa.');
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-stone-900 dark:text-stone-100 font-sans">
      
      {/* Header Cirúrgico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900/90 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 font-semibold">
              Módulo Operacional
            </span>
            <span className="font-mono text-xs text-stone-500 tabular-nums">
              Total: {activities.length} atividade(s)
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-950 dark:text-stone-100 mt-1">
            Atividades Clínicas & Gestão Interna
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
            Checklist de pendências, protocolos domiciliares e preparo de materiais.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Barra de Filtros Neutros */}
      <div className="bg-white dark:bg-stone-900/90 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Status:</span>
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'PENDING', label: 'Pendentes' },
            { id: 'COMPLETED', label: 'Concluídas' },
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

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Prioridade:</span>
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'HIGH', label: 'Alta' },
            { id: 'MEDIUM', label: 'Média' },
            { id: 'LOW', label: 'Baixa' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPriorityFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                priorityFilter === item.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Atividades */}
      <div className="bg-white dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/80">
            {activities.map((act) => {
              const isCompleted = act.status === 'COMPLETED';
              return (
                <div
                  key={act.id}
                  className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                    isCompleted ? 'bg-stone-50/50 dark:bg-stone-900/40 opacity-60' : 'hover:bg-stone-50/60 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleComplete(act)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900'
                          : 'border-stone-300 dark:border-stone-600 hover:border-stone-500 bg-white dark:bg-stone-800'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            isCompleted ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {act.title}
                        </span>

                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {act.priority === 'HIGH' ? 'Prioridade Alta' : act.priority === 'LOW' ? 'Baixa' : 'Média'}
                        </span>

                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                          {act.category}
                        </span>
                      </div>

                      {act.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {act.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400 font-mono">
                        {act.patient && (
                          <span>Paciente: <strong>{act.patient.fullName}</strong></span>
                        )}
                        {act.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            Prazo: {new Date(act.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    title="Excluir Atividade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-14 text-center">
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Nenhuma atividade encontrada</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Crie uma nova tarefa para organizar sua rotina do consultório.
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-3 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Atividade</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Nova Tarefa Sóbrio */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider font-semibold">
                  Operacional
                </span>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Nova Atividade Clínica
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Enviar protocolo de exercícios domiciliares"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  >
                    <option value="Acompanhamento">Acompanhamento</option>
                    <option value="Contato">Contato com Paciente</option>
                    <option value="Material">Preparar Material</option>
                    <option value="Documentação">Documentação / Ficha</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  >
                    <option value="LOW">Baixa Prioridade</option>
                    <option value="MEDIUM">Média Prioridade</option>
                    <option value="HIGH">Alta Prioridade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Vincular a Paciente (Opcional)
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                >
                  <option value="">Nenhum (Tarefa Interna Geral)</option>
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Prazo Limite (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Orientações e detalhes para a tarefa..."
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
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-semibold shadow-sm transition-colors"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
