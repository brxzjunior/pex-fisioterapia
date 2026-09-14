import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Trash2,
  X,
  User,
  Clock,
  Tag,
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
      console.error('Erro ao carregar pacientes:', err);
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
        patientId: formData.patientId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
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
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.delete(`/activities/${id}`);
      fetchActivities();
    } catch (err) {
      alert('Erro ao excluir tarefa.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Produtividade
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Atividades & Tarefas</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Organização de pendências internas, materiais e acompanhamento de pacientes.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-medium text-slate-400">Status:</span>
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'PENDING', label: 'Pendentes' },
            { id: 'COMPLETED', label: 'Concluídas' },
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

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-medium text-slate-400">Prioridade:</span>
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'HIGH', label: 'Alta' },
            { id: 'MEDIUM', label: 'Média' },
            { id: 'LOW', label: 'Baixa' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPriorityFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                priorityFilter === item.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Atividades */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {activities.map((act) => {
              const isCompleted = act.status === 'COMPLETED';
              return (
                <div
                  key={act.id}
                  className={`p-4 sm:p-5 transition-colors flex items-start justify-between gap-4 ${
                    isCompleted ? 'bg-slate-50/60 opacity-70' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleComplete(act)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-brand-500 bg-white'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {act.title}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            act.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : act.priority === 'LOW'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {act.priority === 'HIGH'
                            ? 'Alta'
                            : act.priority === 'LOW'
                            ? 'Baixa'
                            : 'Média'}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {act.category}
                        </span>
                      </div>

                      {act.description && (
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {act.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-0.5">
                        {act.patient && (
                          <span className="flex items-center gap-1 text-brand-700 font-medium">
                            <User className="w-3.5 h-3.5 text-brand-600" />
                            Paciente: {act.patient.fullName}
                          </span>
                        )}

                        {act.dueDate && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Prazo: {new Date(act.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    title="Excluir Atividade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma atividade encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Crie uma nova tarefa para organizar sua rotina clínica.
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Atividade</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Nova Tarefa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Nova Atividade</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Enviar orientações de exercícios para casa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                  >
                    <option value="Acompanhamento">Acompanhamento</option>
                    <option value="Contato">Contato com Paciente</option>
                    <option value="Material">Preparar Material</option>
                    <option value="Documentação">Documentação / Ficha</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                  >
                    <option value="LOW">Baixa Prioridade</option>
                    <option value="MEDIUM">Média Prioridade</option>
                    <option value="HIGH">Alta Prioridade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a Paciente (Opcional)
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                >
                  <option value="">Nenhum (Tarefa Interna / Geral)</option>
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo de Conclusão (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instruções adicionais sobre a execução da tarefa..."
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
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-600/20 transition-all"
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
