# FisioPro - Plataforma Tecnológica e Portfólio Digital para Estudantes de Fisioterapia
> Projeto de Extensão Universitária (PEX) • Curso de Análise e Desenvolvimento de Sistemas (ADS) • Centro Universitário Descomplica (UniAmérica).

O **FisioPro** é uma solução tecnológica gratuita e de código aberto, desenvolvida no âmbito da extensão universitária para demonstrar a **estudantes de Fisioterapia** como ferramentas digitais modernas podem contribuir para a organização de informações, gestão de horários e elaboração de portfólios acadêmicos.

O projeto foi concebido em parceria com **pessoa física** (Letícia Souza, estudante de Fisioterapia) e opera de forma **100% demonstrativa com dados fictícios**, não representando uma clínica comercial nem prestando serviços profissionais de saúde. A plataforma foi desenhada para a realização de **apresentações gratuitas a outros estudantes de Fisioterapia**, demonstrando a substituição de controles manuais em papel por fluxos digitais seguros, estruturados e alinhados às boas práticas da LGPD.

---

## 🏛️ Alinhamento com as Diretrizes Oficiais da Tutoria Descomplica

Em resposta formal da tutoria acadêmica da Descomplica para este PEX, foram validadas as seguintes diretrizes institucionais:
1. **Parceria com Pessoa Física**: É plenamente permitido firmar parceria extensionista com pessoa física (estudante de Fisioterapia), utilizando CPF em substituição ao CNPJ.
2. **Estudante sem CREFITO**: A parceira atua na condição de graduanda/estudante, não sendo exigido registro no conselho de classe (CREFITO) para fins de colaboração acadêmica extensionista.
3. **Formalização Digital Gov.br**: O Termo de Parceria e Ciência assinado digitalmente através da plataforma Gov.br possui plena validade documental acadêmica.
4. **Caráter Demonstrativo e Dados Fictícios**: A plataforma tem propósito didático-demonstrativo com dados sintéticos/simulados, sem operação de clínica comercial nem prestação de serviços de saúde.
5. **Benefício Social e Ação Extensionista Complementar**: Para além do benefício direto à estudante parceira, a apresentação gratuita da plataforma para outros estudantes de Fisioterapia constitui atividade extensionista recomendada pela instituição, a qual será realizada e documentada complementarmente com registros de feedback e avaliação.

---

## 🎯 Finalidade e Público Beneficiado
- **Público Beneficiado**: A estudante parceira, outros estudantes de graduação em Fisioterapia e pessoas interessadas na adoção de tecnologias de gestão no ambiente de saúde.
- **Portfólio Acadêmico**: Área pública responsiva para apresentação didática de áreas de estudo, projetos acadêmicos e canais de contato simulados.
- **Gestão Organizacional Demonstrativa**: Simulação de controle cadastral de atendimentos, agendamento de sessões, acompanhamento didático da evolução funcional e organização de tarefas de rotina.
- **Privacidade e LGPD**: Minimização estrita de campos, uso exclusivo de dados sintéticos/fictícios, autenticação segura com OAuth 2.0 (Google), cookies `HttpOnly`, `Secure` e `SameSite`, proteção contra SQL Injection com Prisma ORM e sem exposição de dados pessoais reais.
- **Segurança de Borda & Demonstração Blindada**: O endpoint `/api/auth/dev-login` opera com verificação estrita restrita à conta de testes padrão configurada (`ALLOWED_ADMIN_EMAIL`), impedindo a criação ou apropriação indevida de privilégios de administrador por e-mails arbitrários em produção.
- **Ação Extensionista Complementar**: Preparado para workshop e apresentação gratuita com demonstração prática das funcionalidades para estudantes de Fisioterapia, a ser realizada e documentada subsequentemente.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com **TypeScript**
- **Vite** (Build tool de altíssima performance)
- **Tailwind CSS** (Design system customizado em tons de saúde/teal)
- **Lucide React** (Ícones modernos e leves)
- **React Router DOM v6** (Roteamento público e rotas protegidas)
- **Axios** (Comunicação com a API com suporte a envio automático de credenciais)

### Backend
- **Node.js** com **Fastify** e **TypeScript**
- **Prisma ORM** (Modelagem declarativa e geração de migrações)
- **Zod** (Validação estrita de contratos de dados em runtime)
- **JWT (`jsonwebtoken`)** e `@fastify/cookie` (Sessões seguras sem exposição de tokens no localStorage)
- **@fastify/helmet**, **@fastify/cors**, **@fastify/rate-limit** (Camada de segurança de borda)

### Banco de Dados & Nuvem
- **PostgreSQL** (Hospedado na nuvem via **Neon Serverless**)
- **Vercel** (Deploy contínuo do frontend)
- **Render / Railway** (Hospedagem do backend no free tier)

---

## 📂 Estrutura do Repositório (Monorepo)

```
pex-fisioterapia/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Modelagem relacional e enums
│   │   │   └── seed.ts             # Dados de teste/demonstração acadêmica
│   │   ├── src/
│   │   │   ├── config/env.ts       # Validação de variáveis de ambiente com Zod
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # OAuth Google e emissão de sessões
│   │   │   │   ├── dashboard/      # Agregação de métricas em tempo real
│   │   │   │   ├── patients/       # CRUD de pacientes com auditoria
│   │   │   │   ├── appointments/   # Agenda e ciclo de sessões
│   │   │   │   ├── activities/     # Tarefas e pendências clínicas
│   │   │   │   ├── history/        # Trilha de auditoria administrativa
│   │   │   │   └── profile/        # Configuração do perfil profissional
│   │   │   ├── shared/             # Middlewares de segurança e erro
│   │   │   ├── app.ts              # Montagem do Fastify e plugins
│   │   │   └── server.ts           # Inicialização da porta
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/layout/  # PublicLayout, DashboardLayout, ProtectedRoute
│       │   ├── contexts/           # AuthContext (login, logout, perfil)
│       │   ├── pages/
│       │   │   ├── public/         # Landing Page (HomePage)
│       │   │   ├── auth/           # Login com Google e Modo Avaliação
│       │   │   └── admin/          # Dashboard, Pacientes, Atendimentos, Atividades, Perfil
│       │   ├── services/api.ts     # Cliente Axios com interceptors
│       │   ├── App.tsx             # Roteador principal
│       │   └── index.css           # Tailwind e tipografia moderna
│       └── package.json
├── PLANEJAMENTO.md                 # Documentação de arquitetura detalhada
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- **Node.js** (versão 20 ou superior)
- **npm** (versão 10 ou superior)

### 2. Instalação das Dependências
Na raiz do projeto:
```bash
npm install
```

### 3. Configuração do Banco de Dados
No backend, crie o arquivo `.env` baseado no [.env.example](file:///c:/Users/Gama/Documents/GitHub/pex-fisioterapia/apps/backend/.env.example):
```env
PORT=3333
NODE_ENV=development
DATABASE_URL="sua-url-postgres-do-neon"
SESSION_SECRET="uma-chave-secreta-forte-com-mais-de-32-caracteres"
ALLOWED_ADMIN_EMAIL="fisioterapeuta@exemplo.com"
FRONTEND_URL="http://localhost:5173"
```

Para gerar os tipos do Prisma e criar as tabelas no banco:
```bash
npx --workspace=backend prisma db push
# ou para aplicar migrações:
npm run prisma:migrate --workspace=backend
```

Para popular com dados de demonstração da banca:
```bash
npm run db:seed --workspace=backend
```

### 4. Executando a Aplicação
Você pode iniciar os dois ambientes em terminais separados ou a partir da raiz:

- **Iniciar Backend**:
```bash
npm run dev:backend
```
*(Disponível em `http://localhost:3333`)*

- **Iniciar Frontend**:
```bash
npm run dev:frontend
```
*(Disponível em `http://localhost:5173`)*

### 5. Verificação Automatizada e Testes
Para rodar a verificação estrita de tipagem (TypeScript) e build de produção de todo o monorepo:
```bash
npm test
```

### 6. Geração dos Relatórios Acadêmicos Oficiais
Os relatórios formatados conforme as diretrizes do Centro Universitário Descomplica podem ser recompilados a qualquer momento:
```bash
# Gera o relatório em DOCX (.docx) com capa, tabelas ABNT e capturas reais
npm run report:docx

# Gera o relatório diagramado em PDF (.pdf) pronto para submissão
npm run report:pdf
```
Os arquivos gerados são salvos na raiz do repositório:
- `Relatorio_PEX_FisioPro.docx`
- `Relatorio_PEX_FisioPro.pdf`

---

## 🎓 Roteiro da Demonstração Acadêmica no PEX

Para a realização da apresentação e demonstração a estudantes de Fisioterapia:
1. Acesse `http://localhost:5173` para demonstrar a **Área Pública e Portfólio Acadêmico**.
2. Destaque a substituição de fichas manuais pela apresentação organizada de áreas de estudo e simulação de contato.
3. Clique em **Acesso ao Sistema** no topo direito.
4. Na tela de login, apresente as opções de autenticação:
   - Login oficial com **Google OAuth**;
   - Ou o botão **Acesso Rápido de Testes** para demonstração ágil sem dependência de chaves de nuvem no momento da apresentação.
5. Navegue pelos módulos funcionais demonstrativos:
   - **Dashboard**: Métricas agregadas em tempo real e visualização de atendimentos simulados.
   - **Pacientes**: Cadastro didático de pacientes fictícios, filtros, inativação lógica e simulação de ficha com histórico.
   - **Atendimentos**: Controle de horários e sessões com fluxo de status (*Agendado* ➔ *Confirmar* ➔ *Iniciar* ➔ *Finalizar*).
   - **Atividades**: Organização de tarefas acadêmicas e operacionais com prioridades.
   - **Simulação de Prontuário**: Exportação em PDF com métricas da escala EVA e histórico de sessões.
   - **Meu Perfil**: Atualização de dados cadastrais e áreas de estudo que refletem em tempo real no portfólio.

---

## 📄 Licença
Este projeto foi desenvolvido para fins acadêmicos no âmbito do Projeto de Extensão (PEX) de Análise e Desenvolvimento de Sistemas (ADS).