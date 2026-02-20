# 🏛️ AssessoriaPY

**Sistema Completo de Gestão Jurídica**

Um sistema moderno e completo para gestão de escritórios de advocacia, desenvolvido com React, TypeScript e Supabase.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-cyan)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **AssessoriaPY** é uma solução completa para gestão de escritórios de advocacia, oferecendo ferramentas modernas para:

- Gestão de clientes e processos
- Controle de Agendados e prazos
- Gerenciamento financeiro
- Sistema de documentos
- Relatórios e dashboards
- Comunicação com clientes

## ⚡ Funcionalidades

### 📊 Dashboard Inteligente

- Métricas em tempo real
- Gráficos de receita e produtividade
- Próximas Agendados e prazos
- Resumo financeiro mensal

### 👥 Gestão de Clientes

- Cadastro completo de clientes
- Controle de status (Ativo/Inativo)
- Histórico de contatos
- Vinculação com processos

### ⚖️ Gestão de Processos

- Controle completo de processos jurídicos
- Sistema de prioridades
- Acompanhamento de status
- Controle de prazos e instâncias
- Valor da causa

### 📅 Agendados

- Agendamento de Agendados
- Tipos: Instrução, Conciliação, Julgamento, Una
- Status: Agendada, Realizada, Cancelada, Reagendada
- Notificações de prazos

### ✅ Sistema de Tarefas

- Criação e acompanhamento de tarefas
- Sistema de prioridades
- Controle de responsáveis
- Prazos e status

### 📁 Gestão de Documentos

- Upload e organização de documentos
- Vinculação com clientes e processos
- Storage seguro na nuvem
- Controle de acesso

### 💰 Controle Financeiro

- Lançamentos financeiros
- Controle de recebimentos
- Relatórios de receita
- Status de pagamentos

### 📈 Relatórios

- Gráficos de receitas
- Métricas de produtividade
- Análises mensais e anuais
- Exportação de dados

### 💬 Sistema de Mensagens

- Templates de mensagens
- Comunicação com clientes
- Histórico de comunicações

## 🛠️ Tecnologias

### Frontend

- **React 18.3.1** - Biblioteca para interfaces
- **TypeScript 5.5.3** - Tipagem estática
- **Vite 5.4.1** - Build tool moderna
- **Tailwind CSS 3.4.11** - Framework CSS
- **Shadcn/ui** - Componentes de interface
- **React Router DOM** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query** - Gerenciamento de estado
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

### Backend

- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança
- **Supabase Auth** - Autenticação
- **Supabase Storage** - Armazenamento de arquivos

### Ferramentas de Desenvolvimento

- **ESLint** - Linting
- **PostCSS** - Processamento CSS
- **Autoprefixer** - Prefixos CSS

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- npm, yarn ou bun
- Conta no Supabase (para backend)

## 🚀 Instalação

1. Faça download do arquivo advogapro.zip
   e extraia na pasta do projeto

2. **Instale as dependências**

```bash
# Com npm
npm install

# Com yarn
yarn install

# Com bun
bun install
```

3. **Configure o Supabase**

- Crie um projeto no [Supabase](https://supabase.com)
- Execute as migrações do banco de dados
- Configure as variáveis de ambiente

4. **Configure as variáveis de ambiente**

```bash
# As configurações do Supabase já estão no arquivo client.ts
# Verifique se as URLs e chaves estão corretas
```

5. **Execute as migrações do banco**

```bash
# Se você tiver o Supabase CLI instalado
supabase db push
```

## 🎮 Uso

### Desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

Acesse: `http://localhost:8080`

### Build para Produção

```bash
npm run build
# ou
yarn build
# ou
bun run build
```

### Preview da Build

```bash
npm run preview
# ou
yarn preview
# ou
bun run preview
```

### Linting

```bash
npm run lint
# ou
yarn lint
# ou
bun run lint
```

## 📁 Estrutura do Projeto

```
advoga-pro/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base (Shadcn/ui)
│   │   ├── audiencias/    # Componentes de Agendados
│   │   ├── documentos/    # Componentes de documentos
│   │   ├── financeiro/    # Componentes financeiros
│   │   ├── relatorios/    # Componentes de relatórios
│   │   └── tarefas/       # Componentes de tarefas
│   ├── hooks/             # Custom hooks
│   ├── integrations/      # Integrações (Supabase)
│   ├── lib/               # Utilitários
│   ├── pages/             # Páginas da aplicação
│   └── data/              # Dados estáticos
├── supabase/              # Configurações do Supabase
│   ├── migrations/        # Migrações do banco
│   └── config.toml        # Configuração do projeto
└── ...
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **profiles** - Perfis de usuários
- **clientes** - Dados dos clientes
- **processos** - Processos jurídicos
- **audiencias** - Agendados agendadas
- **tarefas** - Tarefas e atividades
- **documentos** - Arquivos e documentos
- **financeiro_lancamentos** - Lançamentos financeiros
- **message_templates** - Templates de mensagens

### Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- Políticas de acesso por usuário
- Autenticação via Supabase Auth
- Proteção de rotas no frontend

## 🔐 Autenticação

O sistema utiliza o Supabase Auth para:

- Login/logout de usuários
- Registro de novos usuários
- Recuperação de senha
- Sessões persistentes
- Proteção de rotas

## 🎨 Interface

- **Design System**: Shadcn/ui + Tailwind CSS
- **Tema**: Suporte a modo claro/escuro
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Acessibilidade**: Componentes acessíveis
- **UX**: Interface intuitiva e moderna

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:

- 🖥️ Desktop (1200px+)
- 💻 Laptop (768px - 1199px)
- 📱 Tablet (480px - 767px)
- 📱 Mobile (< 480px)

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `dist`

### Outros Provedores

O projeto pode ser deployado em qualquer provedor que suporte aplicações React estáticas.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Club do Software**

- Website: [clubdosoftware.com](https://clubdosoftware.com)
- Email: contato@packtypebot.com.br

## 🙏 Agradecimentos

- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---
