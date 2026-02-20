import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string; // Assumindo que você pode ter um campo de nome completo
  created_at: string;
}

const Usuarios = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // ATENÇÃO: Esta é uma simulação. Para listar usuários de forma segura
      // e robusta no frontend, você precisará de uma tabela 'profiles'
      // com RLS configurado ou uma Supabase Edge Function/API de backend.
      // Substitua 'profiles' pelo nome real da sua tabela de perfis de usuário.
      const { data, error } = await supabase
        .from('profiles') // Assumindo que você tem uma tabela 'profiles'
        .select('id, email, full_name, created_at'); // Selecione os campos relevantes

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        });
        setUsers([]);
      } else {
        setUsers(data as UserProfile[]);
      }
    } catch (e) {
      console.error("Erro inesperado ao buscar usuários:", e);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);

    try {
      // IMPORTANTE: Criar usuários via admin API (`supabase.auth.admin.createUser`)
      // no frontend é uma VULNERABILIDADE DE SEGURANÇA, pois exigiria a
      // service_role_key exposta.
      //
      // A implementação CORRETA e SEGURA para um administrador cadastrar usuários
      // via frontend é através de uma Supabase Edge Function ou uma API de backend
      // que faz a chamada `supabase.auth.admin.createUser()` de forma segura.
      //
      // Para fins de demonstração, vamos simular ou deixar um placeholder aqui.
      // Você precisará implementar o endpoint seguro no seu backend.

      toast({
        title: "Funcionalidade de Cadastro (Backend Necessário)",
        description: "Para criar um usuário de forma segura, você deve implementar uma Edge Function do Supabase ou uma API de backend que chame 'supabase.auth.admin.createUser()' com a service_role_key.",
        variant: "warning",
      });

      // Simulação de sucesso (REMOVER APÓS IMPLEMENTAR BACKEND)
      // const { data, error } = await supabase.auth.admin.createUser({
      //   email: newEmail,
      //   password: newPassword,
      //   email_confirm: true, // Ou false, dependendo da sua necessidade
      //   user_metadata: { full_name: newFullName },
      // });

      // if (error) {
      //   throw error;
      // }

      // console.log("Usuário criado (simulado/para backend):", data);
      
      // Após o cadastro real ser bem-sucedido no backend, você chamaria fetchUsers()
      // e fecharia o modal. Por ora, apenas fechamos e recarregamos a lista.
      setTimeout(() => { // Simula um tempo de processamento
        toast({
          title: "Usuário Criado (Simulado)",
          description: `Um pedido de criação para ${newEmail} foi enviado. Verifique seu backend.`,
        });
        setIsModalOpen(false);
        setNewEmail("");
        setNewPassword("");
        setNewFullName("");
        fetchUsers(); // Recarrega a lista para refletir a mudança
      }, 1500);

    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Usuários do Sistema</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Cadastrar Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Crie uma nova conta de usuário para acessar o sistema.
                <p className="text-red-500 font-bold mt-2">
                  IMPORTANTE: Esta função requer uma Edge Function/API de backend para ser segura e funcional.
                </p>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newFullName">Nome Completo</Label>
                <Input
                  id="newFullName"
                  type="text"
                  placeholder="Nome completo do usuário"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="email@dominio.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creatingUser}>
                {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Usuário
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando usuários...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {users.length === 0 ? (
                <p className="text-muted-foreground">Nenhum usuário encontrado. Cadastre o primeiro!</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.full_name ? user.email : ''}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Usuarios;
