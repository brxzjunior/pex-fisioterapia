import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  FileCheck2,
  Activity,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageCircle,
} from 'lucide-react';

interface PublicProfile {
  name: string;
  phone?: string | null;
  professionalBio?: string | null;
  specialties?: string | null;
}

export const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<PublicProfile>({
    name: 'Dra. Letícia Souza de Moraes',
    phone: '(92) 99177-9987',
    professionalBio:
      'Diagnóstico funcional, reabilitação musculoesquelética e reeducação do movimento baseados em literatura científica contemporânea.',
    specialties: 'Ortopedia Clínica, Terapia Manual, Reabilitação Desportiva, Controle Motor',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<PublicProfile>('/profile/public');
        if (res.data) {
          // O nome da Responsável Técnica é fixo e institucional (Dra. Letícia Souza de Moraes)
          setProfile({
            ...res.data,
            name: 'Dra. Letícia Souza de Moraes',
          });
        }
      } catch {
        // Fallback seguro em caso de indisponibilidade momentânea
      }
    };

    fetchProfile();
  }, []);

  const cleanPhone = (profile.phone || '92991779987').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=Olá,%20Dra.%20Letícia.%20Gostaria%20de%20agendar%20uma%20avaliação%20funcional.`;

  // Linhas de cuidado estruturadas com rigor clínico
  const clinicalServices = [
    {
      code: '01',
      title: 'Fisioterapia Ortopédica & Traumática',
      description:
        'Intervenção analgésica e restauradora para discopatias vertebrais, tendinopatias crônicas, pós-operatórios articulares e artrose.',
      indications: 'Lombalgias, Cervicalgias, Lesões Meniscais e Manguito Rotador',
      duration: '50 a 60 min',
    },
    {
      code: '02',
      title: 'Reabilitação Desportiva & Return-to-Play',
      description:
        'Protocolo progressivo de carga e testes funcionais biomecânicos para atletas amadores e profissionais retornarem ao esporte com segurança.',
      indications: 'Entorses ligamentares, estiramentos musculares e prevenção de recidivas',
      duration: '60 min',
    },
    {
      code: '03',
      title: 'Controle Motor & Pilates Terapêutico',
      description:
        'Treinamento da musculatura estabilizadora profunda, reeducação cinesiológica postural e correção de padrões compensatórios de movimento.',
      indications: 'Instabilidade articular, fadiga postural crônica e sobrecarga laboral',
      duration: '50 min',
    },
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Anamnese & Triagem Funcional',
      detail:
        'Mapeamento minucioso do histórico de dor, mecanismo de lesão, demandas da rotina profissional e testes ortopédicos ortostáticos.',
    },
    {
      step: '02',
      title: 'Diagnóstico Cinesiológico Biomecânico',
      detail:
        'Identificação objetiva de restrições articulares, assimetrias de força muscular e padrões compensatórios de movimento.',
    },
    {
      step: '03',
      title: 'Intervenção Terapêutica Baseada em Evidências',
      detail:
        'Terapia manual para alívio de dor associada a exercícios cinesioterapêuticos progressivos com dosagem de carga controlada.',
    },
    {
      step: '04',
      title: 'Métricas de Evolução & Autonomia',
      detail:
        'Reavaliações periódicas com testes funcionais e prescrição de protocolos domiciliares para prevenção sustentável de recidivas.',
    },
  ];

  return (
    <div className="space-y-0 pb-20 text-stone-900 dark:text-stone-100">
      
      {/* ========================================================================= */}
      {/* 1. HERO EDITORIAL (Assimetria Funcional, Sem Clichês de IA)              */}
      {/* ========================================================================= */}
      <section className="border-b border-stone-200/80 dark:border-stone-800/80 bg-white/40 dark:bg-stone-900/30">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-10 pb-16 lg:pt-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Coluna Esquerda: Texto Denso e Manifesto Clínico */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Metadado Sóbrio Superior */}
              <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-mono text-stone-500 dark:text-stone-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500" />
                <span>Prática Clínica Especializada</span>
                <span className="text-stone-300 dark:text-stone-700">/</span>
                <span>Atendimento Individualizado</span>
              </div>

              {/* Título com Tracking Negativo Editorial */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-semibold tracking-tighter text-stone-950 dark:text-stone-50 leading-[1.06]">
                Movimento preciso.{' '}
                <span className="font-normal text-stone-600 dark:text-stone-400">
                  Reabilitação guiada por evidências.
                </span>
              </h1>

              {/* Parágrafo Editorial */}
              <p className="text-base sm:text-lg lg:text-xl text-stone-700 dark:text-stone-300 leading-relaxed font-normal max-w-2xl">
                {profile.professionalBio} Cuidado individualizado focado no diagnóstico 
                mecânico da dor, restauração funcional duradoura e autonomia terapêutica.
              </p>

              {/* Ações de Conversão Diretas */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-stone-900 hover:bg-emerald-800 text-stone-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-emerald-100 font-medium px-7 py-4 rounded-xl text-base transition-colors duration-200 shadow-sm"
                >
                  <span>Agendar Consulta Avaliativa</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </a>

                <a
                  href="#servicos"
                  className="inline-flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-700 hover:border-stone-400 text-stone-800 dark:text-stone-200 px-7 py-4 rounded-xl text-base font-medium transition-colors"
                >
                  <span>Ver Linhas de Cuidado</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </a>
              </div>

              {/* Metadados Práticos Inferiores */}
              <div className="pt-8 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap gap-8 text-sm text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>Consultório & Domiciliar sob consulta prévia</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>Sessões exclusivas de 50 a 60 minutos</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Card Profissional Amplo Preenchendo a Tela */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-stone-100/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm">
                
                {/* Layout Lado a Lado Amplo */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-7 items-center">
                  
                  {/* Foto Profissional Completa e de Grande Impacto */}
                  <div className="sm:col-span-5 lg:col-span-6 flex justify-center">
                    <div className="w-full max-w-[280px] sm:max-w-none overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-200/40 dark:bg-stone-950/60 p-2 flex items-center justify-center">
                      <img
                        src="/Dra%20Leticia.jpg"
                        alt="Dra. Letícia Souza de Moraes - Fisioterapeuta"
                        className="w-full h-auto max-h-[420px] object-contain rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                  </div>

                  {/* Informações Profissionais ao Lado */}
                  <div className="sm:col-span-7 lg:col-span-6 flex flex-col justify-center space-y-5">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
                        Responsável Técnica
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100 leading-tight mt-1">
                        {profile.name}
                      </h2>
                      <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium mt-1">
                        Fisioterapia Traumato-Ortopédica e Reabilitação
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-200/70 dark:border-stone-800/70">
                      <span className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2.5">
                        Áreas de Atuação
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties?.split(',').map((item, idx) => (
                          <span
                            key={idx}
                            className="text-xs sm:text-sm font-medium border border-stone-200 dark:border-stone-700/80 px-3 py-1 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-2xs"
                          >
                            {item.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critérios Clínicos na Base Preenchendo Toda a Largura */}
                <div className="mt-6 pt-5 border-t border-stone-200/80 dark:border-stone-800/80">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
                    Critérios de Conduta Clínica
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    <li className="flex items-start gap-2.5 bg-white/70 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 p-3 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Avaliação cinesiológica detalhada pré-tratamento.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/70 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 p-3 rounded-xl">
                      <FileCheck2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Evolução clínica registrada a cada sessão.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/70 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 p-3 rounded-xl">
                      <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Protocolos para autonomia e independência funcional.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LINHAS DE CUIDADO (Lista Editorial Tipográfica)                         */}
      {/* ========================================================================= */}
      <section id="servicos" className="border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
          
          {/* Cabeçalho da Seção */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-stone-200/80 dark:border-stone-800">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-semibold">
                Áreas de Intervenção
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-950 dark:text-stone-50">
                Linhas de Cuidado Fisioterapêutico
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
              Planos terapêuticos organizados por fases: controle álgico, recuperação de amplitude articular,
              estabilidade neuromuscular e fortalecimento funcional.
            </p>
          </div>

          {/* Lista Editorial com Linhas Divisórias */}
          <div className="divide-y divide-stone-200/80 dark:divide-stone-800">
            {clinicalServices.map((service) => (
              <div
                key={service.code}
                className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start group hover:bg-stone-100/40 dark:hover:bg-stone-900/40 px-2 sm:px-4 rounded-xl transition-colors duration-150"
              >
                {/* Código & Título */}
                <div className="lg:col-span-5 flex items-start gap-4">
                  <span className="font-mono text-xs text-stone-400 dark:text-stone-600 pt-1 font-semibold">
                    [{service.code}]
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                      {service.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <Activity className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>Duração clínica: {service.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Descrição Terapêutica */}
                <div className="lg:col-span-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  {service.description}
                </div>

                {/* Indicações & Diagnósticos Recorrentes */}
                <div className="lg:col-span-3 text-xs text-stone-500 dark:text-stone-400 bg-stone-100/70 dark:bg-stone-900/90 p-4 rounded-xl border border-stone-200/70 dark:border-stone-800">
                  <span className="block font-mono text-[10px] uppercase text-stone-400 dark:text-stone-500 tracking-wider mb-1 font-semibold">
                    Indicações Frequentes
                  </span>
                  {service.indications}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. METODOLOGIA CLÍNICA BASEADA EM EVIDÊNCIAS                             */}
      {/* ========================================================================= */}
      <section id="metodologia" className="border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
          
          <div className="max-w-xl space-y-2 mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-semibold">
              Conduta Clínica
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-950 dark:text-stone-50">
              Ciclo de Tratamento e Reabilitação
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              O atendimento clínico obedece a etapas estruturadas para garantir segurança diagnóstica 
              e mensuração objetiva dos ganhos de mobilidade e alívio da dor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {methodologySteps.map((step) => (
              <div
                key={step.step}
                className="space-y-3 pt-6 border-t-2 border-stone-300 dark:border-stone-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                    Fase {step.step}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-stone-300 dark:text-stone-700" />
                </div>
                <h4 className="font-semibold text-base text-stone-900 dark:text-stone-100 tracking-tight">
                  {step.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TRIAGEM & CONTATO CLÍNICO DIRETO (Sóbrio e Acolhedor)                 */}
      {/* ========================================================================= */}
      <section id="contato" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-stone-900 dark:bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-14 text-stone-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Triagem & Informações
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-white">
              Inicie seu acompanhamento com a Dra. Letícia.
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xl">
              Entre em contato para alinhar suas queixas articulares ou musculares, 
              verificar a disponibilidade de agenda no consultório ou agendar uma triagem inicial.
            </p>
            <div className="flex flex-wrap gap-6 pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Atendimento com hora marcada
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Segunda a Sexta
              </span>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-stone-900 hover:bg-emerald-50 hover:text-emerald-900 font-semibold text-sm px-7 py-4 rounded-xl shadow-sm transition-colors shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-emerald-700" />
            <span>Conversar via WhatsApp</span>
          </a>
        </div>
      </section>

    </div>
  );
};
