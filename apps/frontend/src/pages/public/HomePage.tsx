import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Activity,
  HeartPulse,
  UserCheck,
  MessageCircle,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
} from 'lucide-react';

interface PublicProfile {
  name: string;
  phone?: string | null;
  professionalBio?: string | null;
  specialties?: string | null;
}

export const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<PublicProfile>({
    name: 'Dra. Fisioterapeuta',
    phone: '(11) 99999-8888',
    professionalBio:
      'Planos de tratamento e reabilitação baseados em evidências científicas, com atendimento acolhedor, individualizado e focado na sua qualidade de vida e movimento.',
    specialties: 'Ortopedia, Fisioterapia Esportiva, Pilates Clínico, Reabilitação Postural',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<PublicProfile>('/profile/public');
        if (res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        // Fallback seguro em caso de indisponibilidade
      }
    };

    fetchProfile();
  }, []);

  const cleanPhone = (profile.phone || '11999998888').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Vim%20pelo%20FisioPro%20e%20gostaria%20de%20solicitar%20uma%20avalia%C3%A7%C3%A3o.`;

  const specialtiesList = profile.specialties
    ? profile.specialties.split(',').map((s) => s.trim())
    : ['Ortopedia', 'Pilates Clínico', 'Desportiva', 'Postura'];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Hero */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Atendimento Personalizado & Fisioterapia Integrada</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Recupere seu bem-estar,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                  movimento e saúde.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {profile.professionalBio}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Agendar Consulta</span>
                </a>

                <a
                  href="#servicos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
                >
                  <span>Conhecer Serviços</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Atendimento em Clínica e Domiciliar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Horários Flexíveis</span>
                </div>
              </div>
            </div>

            {/* Card Profissional / Foto Ilustrativa */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-400 to-teal-300 rounded-3xl blur-xl opacity-30 animate-pulse" />

                <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
                  <div className="h-64 rounded-2xl bg-gradient-to-tr from-brand-100 via-teal-50 to-slate-100 flex items-center justify-center border border-brand-100/50 relative overflow-hidden">
                    <HeartPulse className="w-20 h-20 text-brand-400/40" />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/60 shadow-sm flex items-center gap-3">
                      <div className="p-2 bg-brand-500 rounded-lg text-white">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{profile.name}</p>
                        <p className="text-[11px] text-slate-500">Fisioterapeuta</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                    <p className="text-xs text-brand-700 font-medium">Reabilitação & Fisioterapia Integrada</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {specialtiesList.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Atuação / Serviços */}
      <section id="servicos" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Serviços</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Tratamentos Especializados</p>
          <p className="text-sm text-slate-500 mt-2">
            Metodologias modernas adaptadas às necessidades do seu corpo e rotina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl inline-block mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Fisioterapia Ortopédica</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tratamento de dores articulares, musculares, hérnias de disco, tendinites e reabilitação pós-operatória.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl inline-block mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Pilates Clínico & Postura</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fortalecimento do core, reeducação postural e ganho de flexibilidade com controle biomecânico rigoroso.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl inline-block mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Fisioterapia Desportiva</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prevenção de lesões esportivas, recuperação muscular acelerada e retorno seguro à prática física.
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona o Atendimento */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">Como Funciona</h2>
            <h3 className="text-2xl font-bold text-slate-900">Seu Ciclo de Cuidado</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-800">Contato Inicial</h4>
              <p className="text-xs text-slate-500">Agendamento prático e alinhamento de sintomas via WhatsApp.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-800">Avaliação Biomecânica</h4>
              <p className="text-xs text-slate-500">Análise de mobilidade, postura e causas primárias da dor.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-800">Sessões & Tratamento</h4>
              <p className="text-xs text-slate-500">Exercícios terapêuticos e terapia manual direcionada.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-800">Alta & Manutenção</h4>
              <p className="text-xs text-slate-500">Orientações contínuas para prevenir novas queixas e dores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chamada para Ação */}
      <section id="contato" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-brand-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-brand-900/10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Pronto para iniciar seu tratamento?</h2>
          <p className="text-teal-100 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Entre em contato direto pelo WhatsApp para tirar dúvidas sobre valores, horários e marcar sua primeira consulta com {profile.name}.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-teal-50 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>Falar com a Fisioterapeuta via WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
