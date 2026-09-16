import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import {
  Users,
  Search,
  Plus,
  Phone,
  Calendar,
  Eye,
  Edit2,
  X,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  birthDate?: string | null;
  address?: string | null;
  administrativeNotes?: string | null;
  createdAt: string;
  _count?: {
    appointments: number;
    activities: number;
  };
}

interface PatientDetails extends Patient {
  appointments: Array<{
    id: string;
    scheduledAt: string;
    type: string;
    status: string;
    notes?: string | null;
  }>;
  activities: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
  }>;
  history: Array<{
    id: string;
    actionType: string;
    description: string;
    createdAt: string;
  }>;
}

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Controle de Modal de Cadastro/Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    address: '',
    administrativeNotes: '',
  });

  // Controle de Modal de Detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get<Patient[]>('/patients', { params });
      setPatients(res.data);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingPatient(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      birthDate: '',
      address: '',
      administrativeNotes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email || '',
      birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
      address: patient.address || '',
      administrativeNotes: patient.administrativeNotes || '',
    });
    setModalOpen(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      setModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar dados do paciente.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/patients/${id}/toggle-status`);
      fetchPatients();
    } catch (err) {
      alert('Erro ao alterar status do paciente.');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      setDetailsModalOpen(true);
      const res = await api.get<PatientDetails>(`/patients/${id}`);
      setSelectedPatientDetails(res.data);
    } catch (err) {
      alert('Erro ao carregar detalhes do paciente.');
      setDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto text-stone-900 dark:text-stone-100 font-sans">
      
      {/* Header Cirúrgico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900/90 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 font-semibold">
              Módulo Prontuários
            </span>
            <span className="font-mono text-xs text-stone-500 tabular-nums">
              Total: {patients.length} registro(s)
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-950 dark:text-stone-100 mt-1">
            Gestão de Pacientes & Prontuários
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
            Cadastro, histórico clínico biomecânico e acompanhamento de sessões.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-stone-900/90 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome completo ou telefone..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {filter === 'ALL' && 'Todos'}
              {filter === 'ACTIVE' && 'Ativos'}
              {filter === 'INACTIVE' && 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Pacientes Cirúrgica */}
      <div className="bg-white dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : patients.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    <th className="py-3 px-5">Paciente</th>
                    <th className="py-3 px-5">Contato</th>
                    <th className="py-3 px-5">Status Clínico</th>
                    <th className="py-3 px-5">Sessões Realizadas</th>
                    <th className="py-3 px-5 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/80 text-xs text-stone-700 dark:text-stone-300">
                  {patients.map((pt) => (
                    <tr key={pt.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-stone-950 dark:text-stone-100 text-xs">{pt.fullName}</p>
                        {pt.birthDate && (
                          <p className="text-[11px] font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            Nasc: {new Date(pt.birthDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs">
                        <a
                          href={`https://wa.me/55${pt.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors"
                        >
                          <Phone className="w-3 h-3 text-stone-500" />
                          {pt.phone}
                        </a>
                        {pt.email && <p className="text-[11px] text-stone-400 mt-0.5">{pt.email}</p>}
                      </td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleToggleStatus(pt.id)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border transition-colors ${
                            pt.status === 'ACTIVE'
                              ? 'bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700'
                              : 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pt.status === 'ACTIVE' ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-400'
                            }`}
                          />
                          {pt.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO'}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs">
                        <span className="text-stone-900 dark:text-stone-100 font-bold tabular-nums">
                          {pt._count?.appointments ?? 0}
                        </span>
                        <span className="text-stone-400 text-[11px] ml-1">sessões</span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetails(pt.id)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
                            title="Visualizar Prontuário & Histórico"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(pt)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
                            title="Editar Cadastro"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Versão Mobile */}
            <div className="md:hidden divide-y divide-stone-200/80 dark:divide-stone-800 p-3 space-y-3">
              {patients.map((pt) => (
                <div key={pt.id} className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-3 border border-stone-200/70 dark:border-stone-700/60">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-white text-sm">{pt.fullName}</p>
                      <p className="text-xs font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-500" />
                        {pt.phone}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                        pt.status === 'ACTIVE'
                          ? 'bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700'
                          : 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'
                      }`}
                    >
                      {pt.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-xs">
                    <span className="font-mono text-stone-400 text-[11px]">
                      {pt._count?.appointments ?? 0} atendimentos
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(pt.id)}
                        className="p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(pt)}
                        className="p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-14 text-center">
            <Users className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Nenhum paciente cadastrado no momento</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Cadastre um novo paciente para iniciar a rotina de prontuários e atendimentos.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-3 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Paciente</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição Sóbrio */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider font-semibold">
                  Ficha Cadastral
                </span>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {editingPatient ? 'Editar Ficha do Paciente' : 'Cadastrar Novo Paciente'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ex: Ana Maria dos Santos"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(92) 99999-9999"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="paciente@exemplo.com"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Endereço / Localização
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 120"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Observações Clínicas & Histórico Pregresso
                </label>
                <textarea
                  rows={3}
                  value={formData.administrativeNotes}
                  onChange={(e) => setFormData({ ...formData, administrativeNotes: e.target.value })}
                  placeholder="Ex: Queixa de dor crônica em joelho direito; cirurgia prévia de LCA há 2 anos."
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
                  {editingPatient ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes e Prontuário */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider font-semibold">
                  Prontuário Clínico Completo
                </span>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {selectedPatientDetails?.fullName || 'Ficha do Paciente'}
                </h2>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center text-stone-400 text-xs">Carregando prontuário...</div>
            ) : selectedPatientDetails ? (
              <div className="space-y-5 text-xs">
                {/* Informações Básicas */}
                <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/80 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Telefone:</span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 font-mono">{selectedPatientDetails.phone}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">E-mail:</span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{selectedPatientDetails.email || 'Não cadastrado'}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Endereço:</span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{selectedPatientDetails.address || 'Não cadastrado'}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase block">Status Clínico:</span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 font-mono">
                      {selectedPatientDetails.status === 'ACTIVE' ? 'ATIVO EM TRATAMENTO' : 'ALTA / INATIVO'}
                    </p>
                  </div>
                </div>

                {/* Observações Clínicas / Histórico Pregresso */}
                {selectedPatientDetails.administrativeNotes && (
                  <div className="p-4 bg-stone-100 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                    <span className="text-xs font-semibold flex items-center gap-1.5 mb-1 text-stone-900 dark:text-stone-100">
                      <ShieldAlert className="w-3.5 h-3.5 text-stone-500" /> Anotação Clínica Prévia
                    </span>
                    <p className="text-xs leading-relaxed">
                      {selectedPatientDetails.administrativeNotes}
                    </p>
                  </div>
                )}

                {/* Histórico das Sessões e Prontuários Salvos */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    Histórico de Evoluções & Atendimentos
                  </h3>

                  {selectedPatientDetails.appointments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatientDetails.appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3.5 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                              {new Date(apt.scheduledAt).toLocaleDateString('pt-BR')} • {apt.type}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                              {apt.status}
                            </span>
                          </div>
                          {apt.notes && (
                            <p className="text-xs text-stone-600 dark:text-stone-300 whitespace-pre-wrap pt-1 border-t border-stone-200/60 dark:border-stone-700/60 font-sans">
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400">Nenhum atendimento concluído registrado.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
