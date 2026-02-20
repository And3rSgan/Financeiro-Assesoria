-- supabase/migrations/20260213193953_create_core_modules.sql

-- Habilita o RLS (Row Level Security) por padrão em todas as tabelas criadas
-- e define a política para "nobody" até que políticas específicas sejam adicionadas.
-- Isso é uma boa prática de segurança no Supabase.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 1. Tabela: user_profiles
-- Estende a tabela auth.users com informações de perfil e assinatura.
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE, -- para garantir que perfis e auth.users.email estejam sincronizados
    role TEXT DEFAULT 'user' NOT NULL, -- 'admin', 'user', 'owner'
    subscription_ends_at TIMESTAMP WITH TIME ZONE, -- Data de vencimento da assinatura
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para user_profiles
-- Admin e o próprio usuário podem ver e editar seus perfis
CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all user profiles" ON public.user_profiles
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger para criar um perfil automaticamente quando um novo usuário é autenticado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para desativar o acesso de usuários não-administradores com assinatura vencida
-- Esta função será chamada ANTES de qualquer SELECT, INSERT, UPDATE, DELETE em qualquer tabela
-- para usuários não-administradores.
CREATE OR REPLACE FUNCTION public.check_subscription_status()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  subscription_end TIMESTAMP WITH TIME ZONE;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Se for INSERT ou UPDATE, o usuário já está logado, então podemos verificar o perfil
    SELECT role, subscription_ends_at INTO user_role, subscription_end
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF user_role != 'admin' AND subscription_end IS NOT NULL AND subscription_end < NOW() THEN
      RAISE EXCEPTION 'Acesso negado: Sua assinatura venceu. Por favor, renove para continuar usando o sistema.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o trigger a todas as tabelas relevantes para usuários, clientes, etc.
-- Exemplo: para a tabela 'clients'. Você precisará adicionar isso para cada tabela principal.
-- CREATE TRIGGER enforce_subscription_on_clients
--   BEFORE INSERT OR UPDATE OR DELETE ON public.clients
--   FOR EACH ROW EXECUTE PROCEDURE public.check_subscription_status();

-- 2. Tabela: subscriptions (Se você tiver planos de assinatura mais complexos)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE, -- Data de término da assinatura
    status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'inactive', 'canceled', 'trial'
    price NUMERIC(10, 2),
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Tabela: clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Cliente pertence a um usuário
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    document_id TEXT, -- CPF/CNPJ
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all clients" ON public.clients
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

-- 4. Tabela: processes
CREATE TABLE public.processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients ON DELETE CASCADE NOT NULL, -- Processo pertence a um cliente
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Processo pertence a um usuário
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'in_progress', 'completed', 'canceled'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE, -- Prazo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all processes" ON public.processes
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own processes" ON public.processes
    FOR ALL USING (auth.uid() = user_id);

-- 5. Tabela: tasks (Tarefas dentro de processos ou avulsas)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID REFERENCES public.processes ON DELETE CASCADE, -- Tarefa pode estar ligada a um processo
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Tarefa pertence a um usuário
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' NOT NULL, -- 'todo', 'in_progress', 'done', 'canceled'
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all tasks" ON public.tasks
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

-- 6. Tabela: appointments (Agendamentos)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Agendamento pertence a um usuário
    client_id UUID REFERENCES public.clients ON DELETE SET NULL, -- Agendamento pode ser para um cliente
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'scheduled' NOT NULL, -- 'scheduled', 'completed', 'canceled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all appointments" ON public.appointments
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own appointments" ON public.appointments
    FOR ALL USING (auth.uid() = user_id);

-- 7. Tabela: documents
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Documento pertence a um usuário
    client_id UUID REFERENCES public.clients ON DELETE CASCADE, -- Documento pode estar ligado a um cliente
    process_id UUID REFERENCES public.processes ON DELETE CASCADE, -- Documento pode estar ligado a um processo
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Caminho para o arquivo no Supabase Storage
    file_type TEXT,
    file_size_bytes BIGINT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all documents" ON public.documents
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

-- 8. Tabela: teams (Equipe)
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Quem criou a equipe
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all teams" ON public.teams
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Team owners can manage their teams" ON public.teams
    FOR ALL USING (auth.uid() = owner_id);

-- 9. Tabela: team_members (Membros da equipe)
CREATE TABLE public.team_members (
    team_id UUID REFERENCES public.teams ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' NOT NULL, -- 'member', 'leader'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all team members" ON public.team_members
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Team members can view their teams" ON public.team_members
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));
CREATE POLICY "Team owners can manage their team members" ON public.team_members
    FOR ALL USING (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));


-- 10. Tabela: financial_entries (Financeiro)
CREATE TABLE public.financial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL, -- Entrada pertence a um usuário
    client_id UUID REFERENCES public.clients ON DELETE SET NULL, -- Pode estar ligada a um cliente
    process_id UUID REFERENCES public.processes ON DELETE SET NULL, -- Pode estar ligada a um processo
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- 'income' (receita) ou 'expense' (despesa)
    amount NUMERIC(10, 2) NOT NULL,
    entry_date DATE DEFAULT NOW(),
    category TEXT,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all financial entries" ON public.financial_entries
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own financial entries" ON public.financial_entries
    FOR ALL USING (auth.uid() = user_id);

-- 11. Tabela: messages (Mensagens internas do sistema/notificações, não WhatsApp)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users ON DELETE SET NULL, -- Quem enviou a mensagem
    receiver_id UUID REFERENCES auth.users ON DELETE CASCADE, -- Para quem é a mensagem
    chat_id UUID REFERENCES public.clients ON DELETE CASCADE, -- Mensagem pode estar ligada a um cliente (contexto de conversa)
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage their own messages" ON public.messages
    FOR ALL USING (auth.uid() = receiver_id OR auth.uid() = sender_id);


-- IMPORTANTE:
-- Para o trigger 'check_subscription_status' funcionar em outras tabelas,
-- você precisará adicionar um TRIGGER AFTER INSERT OR UPDATE OR DELETE ON public.<SUA_TABELA>
-- FOR EACH ROW EXECUTE PROCEDURE public.check_subscription_status();
-- para CADA tabela que você deseja proteger.
-- Por exemplo:
-- CREATE TRIGGER enforce_subscription_on_clients
--   BEFORE INSERT OR UPDATE OR DELETE ON public.clients
--   FOR EACH ROW EXECUTE PROCEDURE public.check_subscription_status();

-- Definir a regra de RLS para auth.users para que perfis possam ser criados
-- CREATE POLICY "Enable insert for authenticated users" ON "auth"."users" FOR INSERT WITH CHECK (true);
-- Mas isso já deve estar configurado no Supabase default.

-- Finaliza por definir que o OWNER das tabelas é o autenticado por default, e não o anon
ALTER TABLE public.user_profiles OWNER TO postgres;
ALTER TABLE public.subscriptions OWNER TO postgres;
ALTER TABLE public.clients OWNER TO postgres;
ALTER TABLE public.processes OWNER TO postgres;
ALTER TABLE public.tasks OWNER TO postgres;
ALTER TABLE public.appointments OWNER TO postgres;
ALTER TABLE public.documents OWNER TO postgres;
ALTER TABLE public.teams OWNER TO postgres;
ALTER TABLE public.team_members OWNER TO postgres;
ALTER TABLE public.financial_entries OWNER TO postgres;
ALTER TABLE public.messages OWNER TO postgres;