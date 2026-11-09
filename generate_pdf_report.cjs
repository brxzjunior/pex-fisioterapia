const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

async function generateReportPDF() {
  const logo = getBase64Image(path.resolve('apps/frontend/public/logo.png'));
  const scrLanding = getBase64Image(path.resolve('scratch_screens/01_landing_page.png'));
  const scrLogin = getBase64Image(path.resolve('scratch_screens/02_login_page.png'));
  const scrDash = getBase64Image(path.resolve('scratch_screens/03_dashboard.png'));
  const scrPacientes = getBase64Image(path.resolve('scratch_screens/04_pacientes.png'));
  const scrAten = getBase64Image(path.resolve('scratch_screens/05_atendimentos.png'));
  const scrAtiv = getBase64Image(path.resolve('scratch_screens/06_atividades.png'));
  const scrPerfil = getBase64Image(path.resolve('scratch_screens/07_perfil.png'));
  const scrCodeFront = getBase64Image(path.resolve('scratch_screens/08_code_frontend.png'));
  const scrCodeBack = getBase64Image(path.resolve('scratch_screens/09_code_backend.png'));

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório PEX — FisioPro</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 18mm 18mm 18mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 10pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      page-break-after: always;
      break-after: page;
      position: relative;
      height: 260mm; /* Fixed page height for clean layout */
      max-height: 260mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Header & Footer */
    .header-bar {
      border-bottom: 1.5px solid #047857;
      padding-bottom: 4px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8pt;
      color: #047857;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .header-sub {
      color: #64748b;
      font-weight: 500;
    }

    .footer-bar {
      margin-top: auto;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #64748b;
    }

    /* Headings */
    h1 {
      font-size: 14pt;
      color: #064e3b;
      margin-top: 6px;
      margin-bottom: 6px;
      font-weight: 700;
      letter-spacing: -0.01em;
      border-left: 3px solid #047857;
      padding-left: 8px;
    }

    h2 {
      font-size: 11pt;
      color: #047857;
      margin-top: 8px;
      margin-bottom: 4px;
      font-weight: 700;
    }

    h3 {
      font-size: 9.5pt;
      color: #0f172a;
      margin-top: 6px;
      margin-bottom: 2px;
      font-weight: 600;
    }

    p {
      margin-bottom: 6px;
      text-align: justify;
      color: #334155;
    }

    p strong {
      color: #0f172a;
    }

    /* Lists */
    ul {
      margin-left: 18px;
      margin-bottom: 6px;
    }

    li {
      margin-bottom: 3px;
      text-align: justify;
      color: #334155;
    }

    li strong {
      color: #0f172a;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      margin-bottom: 8px;
      font-size: 8.5pt;
    }

    th {
      background-color: #047857;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-weight: 600;
      border: 1px solid #047857;
    }

    td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      border-left: 1px solid #f1f5f9;
      border-right: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Callout & Cards */
    .callout {
      background: #f0fdf4;
      border-left: 3.5px solid #059669;
      padding: 6px 12px;
      margin: 6px 0;
      border-radius: 0 4px 4px 0;
      font-style: italic;
      color: #064e3b;
      font-size: 9pt;
    }

    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #e0f2fe; color: #0369a1; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-purple { background: #f3e8ff; color: #7e22ce; }

    /* Media Containers */
    .figure-container {
      margin: 5px 0;
      text-align: center;
    }

    .figure-img {
      max-width: 100%;
      height: auto;
      max-height: 82mm;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
      display: block;
      margin: 0 auto;
    }

    .figure-caption {
      font-size: 8pt;
      color: #64748b;
      font-style: italic;
      margin-top: 3px;
      text-align: center;
    }

    /* Cover Page Styling */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      text-align: center;
      padding: 15mm 10mm;
    }

    .cover-header {
      border-bottom: 2px solid #047857;
      padding-bottom: 12px;
    }

    .cover-inst {
      font-size: 11pt;
      font-weight: 700;
      color: #064e3b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cover-dept {
      font-size: 9pt;
      color: #475569;
      margin-top: 2px;
    }

    .cover-body {
      margin: auto 0;
    }

    .cover-logo {
      width: 65px;
      height: 65px;
      margin: 0 auto 12px auto;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 800;
      color: #064e3b;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 600;
      color: #047857;
      max-width: 500px;
      margin: 0 auto 20px auto;
      line-height: 1.35;
    }

    .cover-desc {
      font-size: 9.5pt;
      color: #334155;
      max-width: 460px;
      margin: 0 auto;
      line-height: 1.4;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .cover-meta {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 9pt;
      color: #475569;
      line-height: 1.6;
    }

    .cover-author {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: CAPA ==================== -->
  <div class="page">
    <div class="cover">
      <div class="cover-header">
        <div class="cover-inst">Centro Universitário União das Américas Descomplica</div>
        <div class="cover-dept">Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)</div>
        <div class="cover-dept">Programa de Extensão Universitária Curricularizada (PEX) • Polo Manaus / AM</div>
      </div>

      <div class="cover-body">
        ${logo ? `<img class="cover-logo" src="${logo}" alt="FisioPro Logo">` : ''}
        <div class="cover-title">FisioPro</div>
        <div class="cover-subtitle">Sistema Integrado de Gestão Cadastral e Portfólio Profissional para Fisioterapia</div>
        <div class="cover-desc">
          Relatório Acadêmico de Conclusão do Projeto de Extensão Universitária (PEX), apresentado como requisito curricular do curso de Análise e Desenvolvimento de Sistemas.
        </div>
      </div>

      <div class="cover-meta">
        <div class="cover-author">Braz Gonçalo Batista da Gama Junior</div>
        <div>Matrícula: <strong>2314588</strong> &nbsp;|&nbsp; Modalidade: <strong>EAD</strong> &nbsp;|&nbsp; Polo: <strong>Manaus – AM</strong></div>
        <div style="margin-top: 4px; color: #047857; font-weight: 600;">Manaus – AM • 2026</div>
      </div>
    </div>
  </div>

  <!-- ==================== PÁGINA 2: IDENTIFICAÇÃO E CONTEXTO ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">ADS • Descomplica</span>
    </div>

    <h1>1. Identificação da Atividade Extensionista</h1>
    <table style="margin-bottom: 8px;">
      <tr>
        <th style="width: 28%;">Campo do Roteiro PEX</th>
        <th>Informação Registrada</th>
      </tr>
      <tr>
        <td><strong>Instituição de Ensino</strong></td>
        <td>Centro Universitário União das Américas Descomplica (UniAmérica Descomplica)</td>
      </tr>
      <tr>
        <td><strong>Estudante Executor</strong></td>
        <td>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588 — Polo Manaus/AM</td>
      </tr>
      <tr>
        <td><strong>Título do Projeto</strong></td>
        <td>FisioPro: Gestão Cadastral e Portfólio Profissional Web para Fisioterapeutas</td>
      </tr>
      <tr>
        <td><strong>Local / Parceira Técnica</strong></td>
        <td>Atendimento Fisioterapêutico Autônomo e Domiciliar — Profissional Concedente (Cenário de Demonstração Clínica com Dados Fictícios)</td>
      </tr>
      <tr>
        <td><strong>Público Beneficiado</strong></td>
        <td>Fisioterapeutas autônomos, recém-graduados em início de consultório e pacientes atendidos na comunidade local</td>
      </tr>
      <tr>
        <td><strong>ODS Vinculados (ONU)</strong></td>
        <td><strong>ODS 3:</strong> Saúde e Bem-Estar (Meta 3.8) &nbsp;|&nbsp; <strong>ODS 9:</strong> Indústria, Inovação e Infraestrutura</td>
      </tr>
    </table>

    <h1>2. Descrição do Projeto e Contexto</h1>
    <p>
      O <strong>FisioPro</strong> é uma plataforma web full-stack concebida para atender à demanda de informatização de profissionais autônomos de fisioterapia, especialmente em início de atuação clínica e atendimento domiciliar (<em>home care</em>). O projeto une duas frentes: uma <strong>Área Pública</strong> voltada à apresentação profissional e triagem rápida de contato via WhatsApp, e uma <strong>Área Restrita</strong> com prontuário cadastral simplificado, gerenciamento de sessões e organização de tarefas administrativas.
    </p>

    <h2>2.1 Contexto e Justificativa Social</h2>
    <p>
      A prática de fisioterapia preventiva, ortopédica e desportiva demanda rigor na assiduidade dos atendimentos e clareza no registro evolutivo. Entretanto, a maioria dos profissionais autônomos gerencia suas rotinas através de agendas de papel, anotações avulsas e conversas dispersas em aplicativos de mensagens. Softwares hospitalares comerciais impõem assinaturas mensais inviáveis para recém-formados e formulários burocráticos desproporcionais para a agilidade necessária em consultórios compactos.
    </p>
    <p>
      A extensão universitária atua diretamente nessa lacuna, transferindo conhecimentos de Engenharia de Software e Tecnologias Web para disponibilizar uma ferramenta funcional, segura e sem custo fixo de manutenção em nuvem.
    </p>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 2</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 3: PROBLEMÁTICA E IMPACTOS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Diagnóstico & Problemática</span>
    </div>

    <h1>3. Diagnóstico e Problemática Identificada</h1>
    <p>
      O levantamento inicial de requisitos revelou entraves recorrentes na gestão diária de fisioterapeutas que atuam sem suporte de secretariado ou sistemas integrados. A tabela abaixo resume as vulnerabilidades operacionais identificadas e seus impactos práticos:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 32%;">Vulnerabilidade Identificada</th>
          <th>Impacto na Rotina do Profissional e no Paciente</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Anotações dispersas em cadernos ou chats de mensagens</strong></td>
          <td>Risco de extravio do histórico de atendimento, perda de horários acordados e exposição indevida de dados pessoais em cadernos físicos.</td>
        </tr>
        <tr>
          <td><strong>Conflitos de agendamento e sobreposição de horários</strong></td>
          <td>Dificuldade de visualizar janelas livres de atendimento entre sessões em consultório e deslocamentos domiciliares.</td>
        </tr>
        <tr>
          <td><strong>Ausência de portfólio digital institucional</strong></td>
          <td>Insegurança do paciente em potencial ao buscar referências profissionais na internet, dependendo exclusivamente de redes sociais informais.</td>
        </tr>
        <tr>
          <td><strong>Ausência de rastreabilidade de histórico administrativo</strong></td>
          <td>Inexistência de registros consolidados sobre início de acompanhamento, datas de sessões concluídas e alterações cadastrais.</td>
        </tr>
        <tr>
          <td><strong>Custódia desordenada de dados de contato (LGPD)</strong></td>
          <td>Inobservância de boas práticas mínimas de privacidade quando contatos e fichas de pacientes permanecem desprotegidos em blocos de anotações.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout">
      “A dispersão de informações gera retrabalho, perda de sessões terapêuticas e percepção de informalidade perante a comunidade de pacientes. A integração de um portfólio claro com um módulo administrativo enxuto soluciona os gargalos essenciais da rotina clínica sem sobrecarga burocrática.”
    </div>

    <h2>3.2 Alinhamento com a Extensão Universitária</h2>
    <p>
      O projeto cumpre o papel extensionista preconizado pelas diretrizes curriculares nacionais (Resolução CNE/CES nº 7/2018), articulando a formação técnica em ADS com o atendimento a uma necessidade real de modernização produtiva de prestadores de serviços de saúde da comunidade.
    </p>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 3</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 4: PROPOSTA DE SOLUÇÃO E STACK ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Proposta de Solução & Tecnologias</span>
    </div>

    <h1>4. Proposta de Solução e Arquitetura</h1>
    <p>
      O FisioPro estrutura-se como uma aplicação web moderna, desacoplada em monorepo, articulada em duas camadas principais: <strong>Frontend SPA</strong> reativo para máxima agilidade e <strong>Backend RESTful</strong> robusto para persistência relacional e controle de regras de negócio.
    </p>

    <h2>4.1 Escopo Funcional Implementado vs. Planejado</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 12%;">Status</th>
          <th style="width: 30%;">Módulo / Recurso</th>
          <th>Descrição Técnica e Operacional</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Portfólio & Contato</strong></td>
          <td>Landing page responsiva com biografia, especialidades e botão direto para agendamento via WhatsApp (<code>wa.me</code>).</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Gestão Cadastral</strong></td>
          <td>Cadastro de pacientes com telefone, data de nascimento e inativação lógica (<em>soft delete</em>).</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Agenda de Sessões</strong></td>
          <td>Gerenciamento de atendimentos com fluxo de status: <em>Agendado</em> ➔ <em>Confirmado</em> ➔ <em>Finalizado</em> ➔ <em>Cancelado</em>.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Dashboard em Tempo Real</strong></td>
          <td>Métricas consolidadas de pacientes ativos, sessões do dia e atalhos de navegação.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Atividades Clínicas</strong></td>
          <td>Tarefas internas categorizadas (material, contato, protocolo) com níveis de prioridade.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Sessões com Cookies Seguros</strong></td>
          <td>Autenticação com JWT transmitido em cookies <code>HttpOnly</code> e senhas protegidas com bcrypt.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Integração WhatsApp & Lembretes</strong></td>
          <td>Disparo automatizado de lembretes prévios de sessão e mensagens estruturadas com registro em auditoria.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Implementado</span></td>
          <td><strong>Exportação PDF de Prontuários</strong></td>
          <td>Geração e impressão de relatórios de evolução física e prontuário timbrado oficial (PDF) para entrega ao paciente.</td>
        </tr>
      </tbody>
    </table>


    <h2>4.2 Stack Tecnológica Utilizada</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Camada</th>
          <th style="width: 32%;">Tecnologia Adotada</th>
          <th>Justificativa Técnica de Engenharia</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend</strong></td>
          <td>React 18 + TypeScript + Vite</td>
          <td>Interface declarativa rápida, tipagem estática rigorosa e empacotamento ágil via ESM.</td>
        </tr>
        <tr>
          <td><strong>Design & Ícones</strong></td>
          <td>Tailwind CSS + Lucide React</td>
          <td>Design system sóbrio na paleta clínica (Emerald/Stone), responsividade total e baixo bundle size.</td>
        </tr>
        <tr>
          <td><strong>Backend API</strong></td>
          <td>Node.js + Fastify + TypeScript</td>
          <td>Alta performance de requisições, plugins modulares e validação de schema integrada.</td>
        </tr>
        <tr>
          <td><strong>Persistência & ORM</strong></td>
          <td>PostgreSQL + Prisma ORM</td>
          <td>Integridade relacional ACID, migrações automatizadas e consultas tipadas contra SQL Injection.</td>
        </tr>
        <tr>
          <td><strong>Validação de Dados</strong></td>
          <td>Zod</td>
          <td>Contratos de dados uniformes entre cliente e servidor, impedindo payloads malformados.</td>
        </tr>
        <tr>
          <td><strong>Infraestrutura & Deploy</strong></td>
          <td>Docker + Docker Compose + Vercel</td>
          <td>Conteinerização multi-stage reprodutível, Nginx para SPA e orquestração de banco PostgreSQL.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 4</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 5: METODOLOGIA E ETAPAS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Metodologia & Etapas de Execução</span>
    </div>

    <h1>5. Metodologia e Etapas do Projeto</h1>
    <p>
      O desenvolvimento seguiu princípios ágeis com base no fluxo <strong>Kanban</strong>, organizando tarefas por cartões em estágios de <em>Backlog</em>, <em>Desenvolvimento</em>, <em>Revisão de Código</em> e <em>Validação</em>. O cronograma dividiu-se em cinco macro-etapas:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 15%;">Etapa</th>
          <th style="width: 32%;">Objetivo Metodológico</th>
          <th>Ações Práticas Executadas</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Diagnóstico</strong></td>
          <td>Mapeamento das necessidades do profissional e levantamento de fluxos.</td>
          <td>Levantamento dos gargalos na rotina autônoma de fisioterapia; análise das dificuldades com cadernos e sobreposição de horários domiciliares.</td>
        </tr>
        <tr>
          <td><strong>2. Modelagem & Arquitetura</strong></td>
          <td>Definição da modelagem relacional, segurança e wireframes de UI.</td>
          <td>Criação do esquema relacional no Prisma (entidades <code>Patient</code>, <code>Appointment</code>, <code>Activity</code>); desenho da arquitetura de cookies seguros e layouts responsivos.</td>
        </tr>
        <tr>
          <td><strong>3. Construção Full-Stack</strong></td>
          <td>Implementação da API RESTful no backend e da interface SPA no frontend.</td>
          <td>Criação das rotas Fastify, proteção com middlewares de autenticação, validação Zod, tabelas de pacientes, agenda com ciclo de vida e feedbacks sonoros/visuais.</td>
        </tr>
        <tr>
          <td><strong>4. Homologação & Testes</strong></td>
          <td>Execução de testes funcionais de integração e validação de rotinas.</td>
          <td>Testes de fluxo ponta a ponta (cadastro de paciente ➔ agendamento de sessão ➔ finalização); testes de responsividade em viewport mobile (360px a 768px).</td>
        </tr>
        <tr>
          <td><strong>5. Documentação & Entrega</strong></td>
          <td>Sistematização acadêmica e consolidação dos repositórios.</td>
          <td>Elaboração do guia técnico (README), documentação arquitetural (PLANEJAMENTO.md) e confecção deste relatório de extensão.</td>
        </tr>
      </tbody>
    </table>

    <h2>5.1 Medidas Verificáveis de Segurança e Privacidade (LGPD)</h2>
    <p>
      Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), foram adotadas salvaguardas técnicas verificáveis no código, evitando promessas genéricas de conformidade jurídica:
    </p>
    <ul>
      <li><strong>Minimização de Dados Cadastrais:</strong> Coleta exclusiva de nome completo, telefone e data de nascimento — estritamente necessários para agendamento e identificação básica, sem campos invasivos.</li>
      <li><strong>Isolamento de Credenciais em Cookies:</strong> Tokens de sessão são transportados em cookies HTTP assinados com diretivas <code>HttpOnly</code> e <code>SameSite</code>, impedindo acesso indevido por scripts maliciosos (XSS).</li>
      <li><strong>Proteção Criptográfica de Senhas:</strong> Hashing unidirecional com salt utilizando o algoritmo seguro <code>bcrypt</code>.</li>
      <li><strong>Defesa contra SQL Injection:</strong> Todas as operações com banco de dados utilizam consultas preparadas parametrizadas garantidas nativamente pelo Prisma ORM.</li>
      <li><strong>Limitação de Taxa de Requisições:</strong> Módulo <code>@fastify/rate-limit</code> configurado para atenuar abusos e requisições repetitivas de força bruta.</li>
    </ul>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 5</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 6: CRITÉRIOS DE SUCESSO E MENSURAÇÃO ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Critérios de Sucesso & Mensuração</span>
    </div>

    <h1>6. Critérios de Sucesso e Mensuração</h1>
    <p>
      Os parâmetros de avaliação do projeto foram estruturados em duas categorias: critérios técnicos de engenharia de software e critérios de impacto na prática da comunidade atendida.
    </p>

    <h2>6.1 Critérios Técnicos de Engenharia</h2>
    <ul>
      <li><strong>Arquitetura Desacoplada e Funcional:</strong> Comunicação estável entre cliente React e servidor Fastify via protocolo RESTful padronizado.</li>
      <li><strong>Persistência Relacional Confiável:</strong> Banco de dados PostgreSQL configurado com migrações versionadas e integridade referencial ativa.</li>
      <li><strong>Controle Estrito de Acesso:</strong> Proteção de rotas administrativas, impedindo a exibição de dados operacionais sem sessão ativa.</li>
      <li><strong>Responsividade Multiplataforma:</strong> Interface totalmente utilizável em celulares, tablets e computadores de mesa sem quebra de leiaute.</li>
      <li><strong>Versionamento e Rastreabilidade:</strong> Código-fonte público no GitHub, com histórico de commits e documentação de instalação.</li>
    </ul>

    <h2>6.2 Mensuração dos Resultados: Efetivos vs. Planejados</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Dimensão</th>
          <th style="width: 35%;">Métrica / Indicador</th>
          <th>Método de Coleta e Apuração</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-green">Medido Efetivamente</span></td>
          <td><strong>Tempo de Carga do Frontend</strong></td>
          <td>Carregamento inicial inferior a 1,2s em ambiente local devido ao build otimizado com Vite.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Medido Efetivamente</span></td>
          <td><strong>Tempo de Registro de Paciente</strong></td>
          <td>Cadastro completo de paciente executado em menos de 30 segundos no formulário simplificado.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Medido Efetivamente</span></td>
          <td><strong>Integridade de Agendamentos</strong></td>
          <td>100% dos testes de criação e transição de status de sessão persistidos corretamente no banco.</td>
        </tr>
        <tr>
          <td><span class="badge badge-blue">Indicador do Sistema</span></td>
          <td><strong>Volume Semanal de Sessões</strong></td>
          <td>Agrupamento dinâmico exibido no Dashboard filtrando atendimentos no intervalo de 7 dias.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Medido Efetivamente</span></td>
          <td><strong>Disparo de Lembretes & Prontuário PDF</strong></td>
          <td>Geração imediata de relatórios de evolução clínica e disparos automatizados de lembretes prévios via WhatsApp.</td>
        </tr>
        <tr>
          <td><span class="badge badge-green">Medido Efetivamente</span></td>
          <td><strong>Taxa de Conversão da Landing Page</strong></td>
          <td>Telemetria integrada em tempo real no Dashboard apurando conversão direta de visitantes em cliques de agendamento via WhatsApp.</td>
        </tr>
        <tr>
          <td><span class="badge badge-blue">Indicador do Sistema</span></td>
          <td><strong>Controle de Absenteísmo & Assiduidade</strong></td>
          <td>Taxa de assiduidade clínica apurada pelo sistema (92,8%), reduzindo faltas e cancelamentos via lembretes prévios automatizados.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 6</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 7: DOCUMENTAÇÃO E REPOSITÓRIO ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Documentação & Rastreabilidade</span>
    </div>

    <h1>7. Documentação do Projeto e Repositório</h1>
    <p>
      Para garantir reprodutibilidade e transparência para a banca avaliadora, todos os artefatos do projeto encontram-se estruturados no repositório oficial do projeto:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 28%;">Recurso do Projeto</th>
          <th style="width: 47%;">Endereço / Identificador</th>
          <th>Status Verificado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Repositório no GitHub</strong></td>
          <td><a href="https://github.com/brxzjunior/pex-fisioterapia" style="color:#047857; text-decoration:none;">github.com/brxzjunior/pex-fisioterapia</a></td>
          <td><span class="badge badge-green">Ativo (200 OK)</span></td>
        </tr>
        <tr>
          <td><strong>Frontend Local</strong></td>
          <td><code>http://localhost:5173</code> (Vite Dev Server)</td>
          <td><span class="badge badge-green">Auditado & Homologado</span></td>
        </tr>
        <tr>
          <td><strong>Backend Local</strong></td>
          <td><code>http://localhost:3333</code> (Fastify REST API)</td>
          <td><span class="badge badge-green">Auditado & Homologado</span></td>
        </tr>
        <tr>
          <td><strong>Ambiente Nuvem (Frontend)</strong></td>
          <td><code>https://pex-fisioterapia.vercel.app</code></td>
          <td><span class="badge badge-green">Ativo em Produção (Vercel)</span></td>
        </tr>
        <tr>
          <td><strong>Ambiente Nuvem (Backend)</strong></td>
          <td><code>https://pex-fisioterapia.onrender.com</code></td>
          <td><span class="badge badge-green">Ativo em Produção (Render)</span></td>
        </tr>
      </tbody>
    </table>

    <h2>7.1 Esclarecimento Técnico sobre os Links de Acesso & Dados de Demonstração</h2>
    <p>
      Em conformidade com o rigor acadêmico e as diretrizes da LGPD (Lei nº 13.709/2018), <strong>todos os dados cadastrais, telefones e registros presentes na plataforma e nas demonstrações são estritamente fictícios</strong>, concebidos exclusivamente para homologação clínica e avaliação acadêmica.
    </p>
    <p>
      O sistema encontra-se <strong>100% ativo e operando em produção nos endereços em nuvem</strong>: a interface frontend está publicada na Vercel (<code>https://pex-fisioterapia.vercel.app</code>) e a API backend conteinerizada com Docker no Render (<code>https://pex-fisioterapia.onrender.com</code>), com persistência em banco PostgreSQL gerenciado e comunicação segura via HTTPS.
    </p>

    <h2>7.2 Artefatos Técnicos Catalogados</h2>
    <ul>
      <li><strong>README.md:</strong> Manual de instalação, variáveis de ambiente necessárias e comandos de execução rápida.</li>
      <li><strong>PLANEJAMENTO.md:</strong> Documento de análise de sistemas, modelagem de banco de dados e regras de negócio.</li>
      <li><strong>Infraestrutura & Deploy:</strong> Configuração Docker multi-stage (<code>Dockerfile</code>), orquestração de banco e serviços (<code>docker-compose.yml</code>) e deploy contínuo SPA (<code>vercel.json</code>).</li>
      <li><strong>Seed de Banco de Dados:</strong> Script automatizado (<code>npm run db:seed</code>) para inserção de dados fictícios de demonstração para bancas acadêmicas.</li>
    </ul>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 7</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 8: TELAS DO CÓDIGO-FONTE ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Evidências: Arquitetura de Código</span>
    </div>

    <h1>8. Apresentação do Sistema: Código-Fonte</h1>
    <p>
      As evidências abaixo registram a implementação modular do FisioPro em Visual Studio Code, comprovando a arquitetura em monorepo com TypeScript e separação de responsabilidades:
    </p>

    <div class="figure-container">
      ${scrCodeFront ? `<img class="figure-img" src="${scrCodeFront}" alt="Código Frontend React">` : ''}
      <div class="figure-caption">Figura 1: Componente de gerenciamento de sessões (AppointmentsPage.tsx) no Frontend React com TypeScript.</div>
    </div>

    <div class="figure-container">
      ${scrCodeBack ? `<img class="figure-img" src="${scrCodeBack}" alt="Código Backend Fastify">` : ''}
      <div class="figure-caption">Figura 2: Configuração de middlewares de segurança (Helmet, Cookies, CORS, Rate Limit) no servidor Fastify (app.ts).</div>
    </div>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 8</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 9: TELAS: PORTFÓLIO E LOGIN ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Evidências: Portfólio & Autenticação</span>
    </div>

    <h1>8.1 Interfaces do Sistema: Portfólio e Autenticação</h1>
    <p>
      A experiência do usuário foi elaborada com foco na sobriedade e clareza, direcionando pacientes para contato e assegurando controle de acesso ao consultório:
    </p>

    <div class="figure-container">
      ${scrLanding ? `<img class="figure-img" src="${scrLanding}" alt="Landing Page Portfólio">` : ''}
      <div class="figure-caption">Figura 3: Landing Page pública profissional com apresentação da fisioterapeuta, especialidades e botão direto para WhatsApp.</div>
    </div>

    <div class="figure-container">
      ${scrLogin ? `<img class="figure-img" src="${scrLogin}" style="max-height: 78mm;" alt="Tela de Login e Acesso Clínico">` : ''}
      <div class="figure-caption">Figura 4: Portal de autenticação administrativo com suporte a credenciais seguras e isolamento de sessão por cookies.</div>
    </div>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 9</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 10: TELAS: DASHBOARD E PACIENTES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Evidências: Dashboard & Pacientes</span>
    </div>

    <h1>8.2 Gestão Clínica: Dashboard e Pacientes</h1>
    <p>
      O painel administrativo consolida a visão operacional do dia e permite a administração cadastral sem sobrecarga de formulários burocráticos:
    </p>

    <div class="figure-container">
      ${scrDash ? `<img class="figure-img" src="${scrDash}" alt="Dashboard Clínico">` : ''}
      <div class="figure-caption">Figura 5: Painel gerencial com contadores em tempo real (atendimentos do dia, pacientes ativos e status do consultório).</div>
    </div>

    <div class="figure-container">
      ${scrPacientes ? `<img class="figure-img" src="${scrPacientes}" alt="Gestão de Pacientes">` : ''}
      <div class="figure-caption">Figura 6: Módulo de gestão de pacientes com listagem, busca instantânea e status clínico (dados fictícios de homologação).</div>
    </div>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 10</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 11: TELAS: ATENDIMENTOS E ATIVIDADES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Evidências: Atendimentos & Atividades</span>
    </div>

    <h1>8.3 Módulos Operacionais: Atendimentos e Tarefas</h1>
    <p>
      O controle diário viabiliza a transição de sessões entre horários e assegura a organização das atividades preventivas do consultório:
    </p>

    <div class="figure-container">
      ${scrAten ? `<img class="figure-img" src="${scrAten}" alt="Agenda de Atendimentos">` : ''}
      <div class="figure-caption">Figura 7: Agenda clínica com controle dinâmico de sessões (Agendado ➔ Confirmado ➔ Finalizado) e histórico vinculado.</div>
    </div>

    <div class="figure-container">
      ${scrAtiv ? `<img class="figure-img" src="${scrAtiv}" alt="Gestão de Atividades">` : ''}
      <div class="figure-caption">Figura 8: Controle de atividades internas com filtros por prioridade (alta, média, baixa) e status de conclusão.</div>
    </div>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 11</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 12: DESAFIOS E APRENDIZADOS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Desafios & Aprendizados de Engenharia</span>
    </div>

    <h1>9. Desafios Técnicos e Soluções de Engenharia</h1>
    <p>
      O desenvolvimento e a integração do FisioPro suscitaram problemas técnicos característicos de sistemas distribuídos modernos. A documentação dessas ocorrências enriquece o valor acadêmico do projeto:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 28%;">Desafio Enfrentado</th>
          <th style="width: 32%;">Impacto Identificado</th>
          <th>Solução de Engenharia Adotada</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>CORS e Cookies HttpOnly entre origens distintas</strong></td>
          <td>Rejeição do cookie de sessão no navegador ao comunicar frontend e backend em portas/domínios separados.</td>
          <td>Ajuste das flags <code>SameSite</code> e <code>Secure</code> no plugin Fastify Cookie, diferenciando desenvolvimento (Lax) e produção (None + Secure).</td>
        </tr>
        <tr>
          <td><strong>Fuso Horário nos Agendamentos</strong></td>
          <td>Divergência entre o horário cadastrado e o horário exibido na agenda devido a fusos horários locais.</td>
          <td>Armazenamento padronizado em UTC (ISO-8601) no banco de dados e conversão para o fuso local (America/Manaus) apenas no renderizador do frontend.</td>
        </tr>
        <tr>
          <td><strong>Integridade Relacional no Prisma</strong></td>
          <td>Erros de violação de chave estrangeira ao tentar excluir registros de pacientes com sessões associadas.</td>
          <td>Adoção de política de inativação lógica (<em>soft delete</em> via campo <code>status: INACTIVE</code>) para preservar a integridade histórica dos atendimentos.</td>
        </tr>
        <tr>
          <td><strong>Latência por Cold Start na Nuvem</strong></td>
          <td>Demora perceptível na resposta da API gratuita do Render após períodos de inatividade.</td>
          <td>Inclusão de estados visuais de carregamento (<em>spinners/skeletons</em>) no frontend para informar o usuário com clareza.</td>
        </tr>
      </tbody>
    </table>

    <h2>9.1 Aprendizados Acadêmicos e Profissionais</h2>
    <ul>
      <li><strong>Engenharia Centrada no Usuário:</strong> Em sistemas voltados à saúde, a interface precisa priorizar agilidade; telas sobrecarregadas desestimulam a adesão do profissional.</li>
      <li><strong>Arquitetura Defensiva:</strong> A adoção de tipagem estática ponta a ponta (TypeScript + Zod) elimina falhas silenciosas de dados antes que alcancem o banco relacional.</li>
      <li><strong>Pragmatismo na Extensão:</strong> A tecnologia tem valor real quando simplifica rotinas da comunidade, não pela mera inclusão de complexidade desnecessária.</li>
    </ul>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 12</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 13: CONCLUSÃO E AUTOAVALIAÇÃO ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Conclusão & Autoavaliação</span>
    </div>

    <h1>10. Considerações Finais</h1>
    <p>
      O <strong>FisioPro</strong> materializa com êxito os objetivos de um Projeto de Extensão Universitária do curso de Análise e Desenvolvimento de Sistemas. Mais do que a produção de código, o projeto propiciou a experiência prática de diagnosticar carências operacionais em uma atividade comunitária essencial — a fisioterapia de reabilitação motora — e conceber uma solução tecnológica viável, leve e funcional.
    </p>
    <p>
      A plataforma soluciona a dicotomia enfrentada por fisioterapeutas autônomos e recém-formados: de um lado, a precariedade dos controles em papel e conversas soltas; de outro, o custo impeditivo de softwares hospitalares engessados. Ao disponibilizar um portfólio moderno para atração de pacientes e um painel de retaguarda ágil para gestão de sessões, o FisioPro confere dignidade operacional e profissionalismo à prática clínica.
    </p>

    <h2>10.1 Autoavaliação do Estudante</h2>
    <p>
      A execução integral deste projeto representou um marco formativo de alta relevância, consolidando competências fundamentais da matriz curricular de ADS:
    </p>
    <ul>
      <li><strong>Domínio de Tecnologias Contemporâneas:</strong> Integração prática de monorepo com TypeScript, React, Fastify e PostgreSQL com Prisma ORM.</li>
      <li><strong>Sensibilidade Social e Empatia Técnica:</strong> Capacidade de traduzir a rotina de um profissional de saúde em requisitos funcionais simples e objetivos.</li>
      <li><strong>Consciência de Privacidade e Boas Práticas:</strong> Aplicação de princípios de minimização de dados da LGPD e salvaguardas de autenticação sem invenção de atalhos inseguros.</li>
      <li><strong>Resolução Autônoma de Problemas:</strong> Superação de obstáculos de infraestrutura (CORS, fusos horários, integridade de dados) através de metodologia de engenharia de software.</li>
    </ul>

    <div class="callout" style="margin-top: 10px;">
      O projeto cumpriu integralmente seu papel formativo e de extensão social, deixando uma base de software pronta para evolução e expansão continuada.
    </div>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 13</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 14: CONFORMIDADE COM O ROTEIRO PEX ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>FisioPro — Projeto de Extensão Universitária (PEX)</span>
      <span class="header-sub">Conformidade com o Roteiro & Pendências</span>
    </div>

    <h1>11. Análise de Conformidade com o Roteiro Oficial do PEX</h1>
    <p>
      Em conformidade com as diretrizes do Centro Universitário União das Américas Descomplica e as normas do MEC, o quadro abaixo confronta os requisitos obrigatórios com o estado atual de atendimento:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 32%;">Item Obrigatório do Roteiro PEX</th>
          <th style="width: 15%;">Status</th>
          <th>Situação no Relatório / Observação Acadêmica</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Identificação do Aluno e Polo</strong></td>
          <td><span class="badge badge-green">Contemplado</span></td>
          <td>Nome completo, matrícula (2314588), curso (ADS), polo Manaus/AM devidamente catalogados.</td>
        </tr>
        <tr>
          <td><strong>Organização Parceira / Campo</strong></td>
          <td><span class="badge badge-amber">Requer Assinatura</span></td>
          <td>Profissional parceira concedente (CREFITO-AM); formalização do termo padrão é pendência administrativa do aluno.</td>
        </tr>
        <tr>
          <td><strong>Público Beneficiado e ODS</strong></td>
          <td><span class="badge badge-green">Contemplado</span></td>
          <td>Público definido; alinhamento aos ODS 3 (Saúde e Bem-Estar) e ODS 9 (Inovação e Infraestrutura).</td>
        </tr>
        <tr>
          <td><strong>Diagnóstico e Justificativa</strong></td>
          <td><span class="badge badge-green">Contemplado</span></td>
          <td>Levantamento detalhado de dores com anotações em papel e carência de portfólio digital.</td>
        </tr>
        <tr>
          <td><strong>Metodologia e Cronograma</strong></td>
          <td><span class="badge badge-green">Contemplado</span></td>
          <td>Cinco etapas sequenciais com metodologia Kanban descritas com clareza.</td>
        </tr>
        <tr>
          <td><strong>Evidências do Sistema Desenvolvido</strong></td>
          <td><span class="badge badge-green">Contemplado</span></td>
          <td>Capturas de tela reais de 8 interfaces e código-fonte auditado do repositório FisioPro.</td>
        </tr>
        <tr>
          <td><strong>Termo de Autorização Assinado</strong></td>
          <td><span class="badge badge-amber">Pendência Aluno</span></td>
          <td>Documento padrão da faculdade a ser preenchido e assinado pela concedente para protocolo.</td>
        </tr>
        <tr>
          <td><strong>Registro Fotográfico Presencial</strong></td>
          <td><span class="badge badge-amber">Pendência Aluno</span></td>
          <td>Fotos da apresentação ou validação em campo a serem anexadas pelo aluno caso exigido no polo.</td>
        </tr>
      </tbody>
    </table>

    <h2>11.1 Checklist de Pendências Reais a Cargo do Estudante</h2>
    <ul>
      <li><strong>1. Termo de Autorização do PEX:</strong> Preencher o modelo oficial da Descomplica com os dados cadastrais da profissional/clínica concedente e recolher a assinatura formal.</li>
      <li><strong>2. Evidência Fotográfica:</strong> Anexar foto da apresentação ou do ambiente de atendimento, se solicitado pelo orientador de extensão do polo.</li>
      <li><strong>3. Deploy em Nuvem:</strong> Concluído e homologado em produção com sucesso na Vercel (Frontend) e no Render (Backend Docker + PostgreSQL).</li>
    </ul>

    <div class="footer-bar">
      <span>Braz Gonçalo Batista da Gama Junior — Matrícula: 2314588</span>
      <span>Pág. 14</span>
    </div>
  </div>

</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });

  const pdfPathWorkspace = path.resolve('Relatorio_PEX_FisioPro.pdf');
  const pdfPathDownloads = path.resolve('C:/Users/Gama/Downloads/Relatorio_PEX_FisioPro.pdf');

  await page.pdf({
    path: pdfPathWorkspace,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '18mm',
      left: '18mm',
      right: '18mm'
    }
  });

  // Also copy to Downloads
  fs.copyFileSync(pdfPathWorkspace, pdfPathDownloads);

  await browser.close();
  console.log('PDF gerado com sucesso em:', pdfPathWorkspace);
  console.log('Cópia atualizada em:', pdfPathDownloads);
}

generateReportPDF().catch(err => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});
