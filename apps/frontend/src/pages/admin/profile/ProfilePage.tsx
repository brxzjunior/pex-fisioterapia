import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { User, Phone, BookOpen, Award, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialties, setSpecialties] = useState(user?.specialties || '');
  const [professionalBio, setProfessionalBio] = useState(user?.professionalBio || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.put('/profile', {
        name,
        phone,
        specialties,
        professionalBio,
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-stone-900 dark:text-stone-100 font-sans">
      {/* Header Cirúrgico */}
      <div className="bg-white dark:bg-stone-900/90 p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm transition-colors">
        <span className="text-[10px] font-mono uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 font-semibold">
          Configuração Profissional
        </span>
        <h1 className="text-xl font-bold text-stone-950 dark:text-stone-100 mt-1 tracking-tight">
          Perfil Profissional & Apresentação
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
          Estes dados alimentam diretamente a apresentação na landing page pública e links de contato.
        </p>
      </div>

      {/* Formulário de Perfil Sóbrio */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900/90 p-6 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5 transition-colors text-xs">
        {savedSuccess && (
          <div className="p-3.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Perfil atualizado com sucesso! As alterações já estão ativas na área pública.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Nome Profissional *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dra. Letícia Souza de Moraes"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              Telefone / WhatsApp de Atendimento
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(92) 99177-9987"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-stone-400" />
            Especialidades Clínicas
          </label>
          <input
            type="text"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="Ex: Fisioterapia Ortopédica, Pilates Clínico, Reabilitação Postural, Desportiva"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none"
          />
          <p className="text-[10px] text-stone-400 mt-1 font-mono">Separe as especialidades por vírgula.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
            Biografia & Filosofia de Atendimento
          </label>
          <textarea
            rows={4}
            value={professionalBio}
            onChange={(e) => setProfessionalBio(e.target.value)}
            placeholder="Metodologia de atendimento, compromisso com a literatura científica contemporânea..."
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-stone-400 outline-none leading-relaxed"
          />
        </div>

        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};
