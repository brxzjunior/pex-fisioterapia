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
  FileText,
  Clock,
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
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Gerenciamento
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Pacientes</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Cadastro, histórico e acompanhamento de pacientes atendidos.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'ALL' && 'Todos'}
              {filter === 'ACTIVE' && 'Ativos'}
              {filter === 'INACTIVE' && 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Pacientes (Desktop) e Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : patients.length > 0 ? (
          <>
            {/* Versão Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Paciente</th>
                    <th className="py-3.5 px-6">Contato</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Sessões</th>
                    <th className="py-3.5 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {patients.map((pt) => (
                    <tr key={pt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{pt.fullName}</p>
                        {pt.birthDate && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            Nascimento: {new Date(pt.birthDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-brand-600" />
                          {pt.phone}
                        </p>
                        {pt.email && <p className="text-[11px] text-slate-400 mt-0.5">{pt.email}</p>}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(pt.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            pt.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pt.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {pt.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 font-medium">
                          {pt._count?.appointments ?? 0} agendamento(s)
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(pt.id)}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Ver Detalhes e Histórico"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(pt)}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar Dados"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Versão Mobile (Cards) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {patients.map((pt) => (
                <div key={pt.id} className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-base">{pt.fullName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3.5 h-3.5 text-brand-600" />
                        {pt.phone}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        pt.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pt.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">{pt._count?.appointments ?? 0} atendimentos</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(pt.id)}
                        className="p-2 bg-white border border-slate-200 text-brand-600 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(pt)}
                        className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum paciente encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre um novo paciente para começar a registrar atendimentos.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Paciente</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ex: Ana Maria dos Santos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="paciente@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço / Bairro
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 120 - Bairro Centro"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Administrativas
                </label>
                <textarea
                  rows={3}
                  value={formData.administrativeNotes}
                  onChange={(e) => setFormData({ ...formData, administrativeNotes: e.target.value })}
                  placeholder="Ex: Preferência por horários no final da tarde; indicação de médico parceiro."
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
                  {editingPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes e Histórico */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedPatientDetails?.fullName || 'Ficha do Paciente'}
                </h2>
                <p className="text-xs text-slate-500">Histórico e informações de gestão do paciente</p>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center text-slate-500 text-xs">Carregando ficha...</div>
            ) : selectedPatientDetails ? (
              <div className="space-y-6">
                {/* Cartão de Informações Básicas */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Telefone:</span>
                    <p className="font-bold text-slate-800">{selectedPatientDetails.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">E-mail:</span>
                    <p className="font-bold text-slate-800">{selectedPatientDetails.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Endereço:</span>
                    <p className="font-bold text-slate-800">{selectedPatientDetails.address || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Status:</span>
                    <p className="font-bold text-brand-700">
                      {selectedPatientDetails.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                {/* Observações */}
                {selectedPatientDetails.administrativeNotes && (
                  <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5" /> Observações Administrativas
                    </span>
                    <p className="text-xs text-teal-800 leading-relaxed">
                      {selectedPatientDetails.administrativeNotes}
                    </p>
                  </div>
                )}

                {/* Linha do Tempo / Histórico Administrativo */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    Histórico de Eventos
                  </h3>

                  {selectedPatientDetails.history.length > 0 ? (
                    <div className="space-y-2 border-l-2 border-brand-200 ml-3 pl-4">
                      {selectedPatientDetails.history.map((hist) => (
                        <div key={hist.id} className="relative text-xs space-y-0.5">
                          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white" />
                          <p className="font-medium text-slate-800">{hist.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(hist.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Nenhum evento registrado ainda.</p>
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
