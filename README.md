# FisioPro - Sistema Integrado de Gestão e Portfólio Profissional para Fisioterapia
> Projeto de Extensão Acadêmica (PEX) - Curso de Análise e Desenvolvimento de Sistemas (ADS).

O **FisioPro** é uma plataforma web full-stack desacoplada, moderna e segura, projetada para atender fisioterapeutas autônomos e em início de carreira/estágio. O sistema combina uma **área pública de alta conversão** (com portfólio profissional e contato direto via WhatsApp) a um **painel administrativo protegido** para controle de pacientes, agenda de atendimentos clínicos, gestão de tarefas e trilha de auditoria/histórico.

---

## 🎯 Objetivos do Projeto
- **Presença Profissional**: Portfólio responsivo para apresentação de biografia, especialidades, serviços e agendamento prático via WhatsApp.
- **Gestão Operacional Simplificada**: Foco estrito em organização cadastral, sessões, status de atendimento e tarefas administrativas — sem complexidade de prontuários hospitalares invasivos.
- **Segurança & Privacidade (LGPD)**: Minimização de dados cadastrais, autenticação OAuth 2.0 com Google, cookies assinados `HttpOnly`, `Secure` e `SameSite`, cabeçalhos de segurança com Helmet, proteção contra ataques de força bruta com rate-limiting e prepared statements automáticos com Prisma ORM contra SQL Injection.
- **Custo Zero em Produção**: Arquitetura planejada para operar dentro dos limites gratuitos de serviços em nuvem (Vercel, Render e Neon PostgreSQL).

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

---

## 🎓 Demonstração Acadêmica e Apresentação no PEX

Para facilitar a apresentação na faculdade e em bancas de avaliação:
1. Acesse `http://localhost:5173` para demonstrar a **Landing Page do Portfólio**.
2. Clique em **Área Profissional** no topo direito.
3. Na tela de login, você pode:
   - Utilizar o botão oficial do **Google OAuth**;
   - Ou utilizar o campo de **Modo Avaliação Acadêmica** para autenticação instantânea local sem dependência de chaves de nuvem no momento da apresentação.
4. Navegue pelos módulos:
   - **Dashboard**: Métricas agregadas em tempo real e lista de próximos atendimentos.
   - **Pacientes**: Cadastro completo, filtros, ativação/inativação e visualização da ficha com histórico de auditoria.
   - **Atendimentos**: Agendamento de sessões com o fluxo prático: *Agendado* ➔ *Confirmar* ➔ *Iniciar* ➔ *Finalizar Sessão*.
   - **Atividades**: Controle de tarefas com prioridades e checkboxes de conclusão.
   - **Meu Perfil**: Alteração de nome e especialidades, que atualizam em tempo real o portfólio público.

---

## 📄 Licença
Este projeto foi desenvolvido para fins acadêmicos no âmbito do Projeto de Extensão (PEX) de Análise e Desenvolvimento de Sistemas (ADS).