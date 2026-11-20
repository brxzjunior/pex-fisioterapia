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
    name: 'Letícia Souza (Estudante de Fisioterapia)',
    phone: '(92) 98888-0000',
    professionalBio:
      'Demonstração de organização digital, acompanhamento didático e controle de mobilidade funcional no contexto da graduação em Fisioterapia.',
    specialties: 'Estudos em Traumato-Ortopedia, Cinesiologia Aplicada, Pilates Acadêmico, Avaliação Biomecânica',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<PublicProfile>('/profile/public');
        if (res.data) {
          setProfile(res.data);
        }
      } catch {
        // Fallback seguro em caso de indisponibilidade momentânea
      }
    };

    // Registra visualização de página para telemetria de conversão
    api.post('/analytics/track', { event: 'PAGE_VIEW' }).catch(() => {});

    fetchProfile();
  }, []);

  const cleanPhone = (profile.phone || '92988880000').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=Olá,%20gostaria%20de%20conhecer%20a%20demonstração%20acadêmica%20do%20projeto%20FisioPro.`;

  const handleWhatsAppClick = () => {
    api.post('/analytics/track', { event: 'WHATSAPP_CLICK' }).catch(() => {});
  };

  // Módulos de estudo prático e simulação didática
  const clinicalServices = [
    {
      code: '01',
      title: 'Fisioterapia Traumato-Ortopédica (Estudo de Caso)',
      description:
        'Simulação de intervenção e acompanhamento para discopatias, tendinopatias e pós-operatórios articulares com registros digitais.',
      indications: 'Lombalgias, Cervicalgias, Lesões Meniscais e Manguito Rotador (Cenários Didáticos)',
      duration: '50 a 60 min (simulado)',
    },
    {
      code: '02',
      title: 'Reabilitação Desportiva & Biomecânica (Simulação)',
      description:
        'Demonstração de controle progressivo de carga e testes funcionais para o retorno seguro às atividades físicas.',
      indications: 'Entorses ligamentares e protocolos de estabilidade articular em estudo',
      duration: '60 min (simulado)',
    },
    {
      code: '03',
      title: 'Controle Motor & Prática de Pilates Acadêmico',
      description:
        'Estudo da musculatura estabilizadora profunda, reeducação cinesiológica e correção de padrões compensatórios de movimento.',
      indications: 'Instabilidade funcional, fadiga postural e ergonomia de rotina',
      duration: '50 min (simulado)',
    },
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Anamnese & Levantamento Simulado',
      detail:
        'Mapeamento de queixas, histórico funcional e demandas da rotina organizado em campos padronizados.',
    },
    {
      step: '02',
      title: 'Análise Cinesiológica e Metas de Estudo',
      detail:
        'Identificação de restrições de movimento e assimetrias com definição de metas didáticas mensuráveis.',
    },
    {
      step: '03',
      title: 'Registro Estruturado de Exercícios',
      detail:
        'Organização de condutas com dosagem de exercícios e acompanhamento da evolução ao longo das sessões.',
    },
    {
      step: '04',
      title: 'Métricas de Evolução e Avaliação Didática',
      detail:
        'Acompanhamento da escala analógica de dor (EVA) e assiduidade com relatórios acadêmicos automatizados.',
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
                <span>Projeto de Extensão Universitária</span>
                <span className="text-stone-300 dark:text-stone-700">/</span>
                <span>Fisioterapia & Tecnologia</span>
              </div>

              {/* Título com Tracking Negativo Editorial */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-semibold tracking-tighter text-stone-950 dark:text-stone-50 leading-[1.06]">
                Organização digital.{' '}
                <span className="font-normal text-stone-600 dark:text-stone-400">
                  Tecnologia aplicada à Fisioterapia.
                </span>
              </h1>

              {/* Parágrafo Editorial */}
              <p className="text-base sm:text-lg lg:text-xl text-stone-700 dark:text-stone-300 leading-relaxed font-normal max-w-2xl">
                {profile.professionalBio} Plataforma desenvolvida para capacitar estudantes de Fisioterapia na transição do registro em papel para fluxos digitais estruturados, controle de horários e portfólio acadêmico.
              </p>

              {/* Ações de Conversão Diretas */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href={whatsappUrl}
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-stone-900 hover:bg-emerald-800 text-stone-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-emerald-100 font-medium px-7 py-4 rounded-xl text-base transition-colors duration-200 shadow-sm"
                >
                  <span>Simular Contato Acadêmico</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </a>

                <a
                  href="#servicos"
                  className="inline-flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-700 hover:border-stone-400 text-stone-800 dark:text-stone-200 px-7 py-4 rounded-xl text-base font-medium transition-colors"
                >
                  <span>Ver Módulos de Estudo</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </a>
              </div>

              {/* Metadados Práticos Inferiores */}
              <div className="pt-8 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap gap-8 text-sm text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>Ambiente de estudo e simulação prática</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>Protótipo demonstrativo para estudantes de Fisioterapia</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Card Profissional Amplo Preenchendo a Tela */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-stone-100/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm">
                
                {/* Layout Lado a Lado Amplo */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-7 items-center">
                  
                  {/* Foto da Estudante Parceira */}
                  <div className="sm:col-span-5 lg:col-span-6 flex justify-center">
                    <div className="w-full max-w-[280px] sm:max-w-none overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-200/40 dark:bg-stone-950/60 p-2 flex items-center justify-center">
                      <img
                        src="/Dra%20Leticia.jpg"
                        alt={`${profile.name || 'Letícia Souza'} - Estudante de Fisioterapia`}
                        className="w-full h-auto max-h-[420px] object-contain rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                  </div>

                  {/* Informações da Estudante Parceira ao Lado */}
                  <div className="sm:col-span-7 lg:col-span-6 flex flex-col justify-center space-y-5">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                        Estudante Parceira do Projeto
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100 leading-tight mt-1">
                        {profile.name}
                      </h2>
                      <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium mt-1">
                        Estudante de Fisioterapia • Pesquisa & Prática Acadêmica
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-200/70 dark:border-stone-800/70">
                      <span className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2.5">
                        Áreas de Estudo & Interesse Acadêmico
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

                {/* Pilares do Estudo Prático na Base */}
                <div className="mt-6 pt-5 border-t border-stone-200/80 dark:border-stone-800/80">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
                    Pilares da Capacitação Prática
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    <li className="flex items-start gap-2.5 bg-white/70 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 p-3 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Organização de dados e prontuários acadêmicos demonstrativos.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/70 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 p-3 rounded-xl">
                      <FileCheck2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Registro de evolução e métricas para simulação de casos.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/70 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 p-3 rounded-xl">
                      <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Capacitação digital para futuros profissionais da área.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MÓDULOS DE ESTUDO & DEMONSTRAÇÃO (Lista Editorial Tipográfica)           */}
      {/* ========================================================================= */}
      <section id="servicos" className="border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
          
          {/* Cabeçalho da Seção */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-stone-200/80 dark:border-stone-800">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-semibold">
                Áreas de Estudo & Demonstração
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-950 dark:text-stone-50">
                Módulos de Estudo e Prática Acadêmica
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
              Casos didáticos organizados por fases: avaliação funcional, acompanhamento da mobilidade,
              estabilidade neuromuscular e registros de evolução.
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
                      <span>{service.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Descrição Terapêutica */}
                <div className="lg:col-span-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  {service.description}
                </div>

                {/* Indicações & Cenários de Estudo */}
                <div className="lg:col-span-3 text-xs text-stone-500 dark:text-stone-400 bg-stone-100/70 dark:bg-stone-900/90 p-4 rounded-xl border border-stone-200/70 dark:border-stone-800">
                  <span className="block font-mono text-[10px] uppercase text-stone-400 dark:text-stone-500 tracking-wider mb-1 font-semibold">
                    Cenários de Estudo
                  </span>
                  {service.indications}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FLUXO METODOLÓGICO DO PROJETO EXTENSIONISTA                            */}
      {/* ========================================================================= */}
      <section id="metodologia" className="border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
          
          <div className="max-w-xl space-y-2 mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-semibold">
              Metodologia Extensionista
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-950 dark:text-stone-50">
              Ciclo de Aprendizagem e Registro Digital
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Etapas simuladas na plataforma para capacitar estudantes de Fisioterapia na transição
              de anotações em papel para registros estruturados e controle de horários.
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
      {/* 4. APRESENTAÇÃO & EXTENSÃO (Sóbrio e Acolhedor)                           */}
      {/* ========================================================================= */}
      <section id="contato" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-stone-900 dark:bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-14 text-stone-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Apresentação & Extensão
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-white">
              Demonstração gratuita para estudantes de Fisioterapia.
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xl">
              O FisioPro é apresentado gratuitamente a estudantes para demonstrar o impacto de ferramentas digitais
              na organização de rotinas, controle de horários e elaboração de portfólio acadêmico.
            </p>
            <div className="flex flex-wrap gap-6 pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Demonstração didática
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Protótipo acadêmico (PEX)
              </span>
            </div>
          </div>

          <a
            href={whatsappUrl}
            onClick={handleWhatsAppClick}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-stone-900 hover:bg-emerald-50 hover:text-emerald-900 font-semibold text-sm px-7 py-4 rounded-xl shadow-sm transition-colors shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-emerald-700" />
            <span>Simular Contato Acadêmico</span>
          </a>
        </div>
      </section>

    </div>
  );
};
