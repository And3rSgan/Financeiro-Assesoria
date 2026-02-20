import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  PlusCircle,
  Trash2,
  Copy,
  Pencil,
  Key,
  Eye,
  EyeOff,
  Send,
} from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

type Template = {
  id: string
  title: string
  content: string
  is_default: boolean
  user_id: string | null
}

const variables = [
  "[nome_cliente]",
  "[id_processo]",
  "[status_processo]",
  "[valor_honorarios]",
  "[data_vencimento]",
  "[data_audiencia]",
  "[hora_audiencia]",
]

const Configuracoes: React.FC = () => {
  const { toast } = useToast()

  const [templates, setTemplates] = useState<Template[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  // 🔐 Modal senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ===============================
  // LOAD MODELOS
  // ===============================
  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setCurrentUserId(uid)

      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar modelos.",
          variant: "destructive",
        })
        return
      }

      setTemplates(data || [])
    }

    load()
  }, [toast])

  // ===============================
  // MODAL CRIAR
  // ===============================
  const openCreateModal = () => {
    setSelectedTemplate(null)
    setTitle("")
    setContent("")
    setIsTemplateModalOpen(true)
  }

  // ===============================
  // MODAL EDITAR
  // ===============================
  const openEditModal = (template: Template) => {
    setSelectedTemplate(template)
    setTitle(template.title)
    setContent(template.content)
    setIsTemplateModalOpen(true)
  }

  // ===============================
  // INSERIR VARIÁVEL
  // ===============================
  const insertVariable = (variable: string) => {
    setContent((prev) => prev + " " + variable)
  }

  // ===============================
  // COPIAR TEXTO
  // ===============================
  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(content)

    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    })
  }

  // ===============================
  // SALVAR TEMPLATE
  // ===============================
  const handleSaveTemplate = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // EDITAR
    if (selectedTemplate) {
      const { error } = await supabase
        .from("message_templates")
        .update({ title, content })
        .eq("id", selectedTemplate.id)

      if (error) {
        toast({
          title: "Erro",
          description: "Falha ao editar modelo.",
          variant: "destructive",
        })
        return
      }

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === selectedTemplate.id ? { ...t, title, content } : t
        )
      )

      toast({
        title: "Atualizado!",
        description: "Modelo editado com sucesso.",
      })

      setIsTemplateModalOpen(false)
      return
    }

    // CRIAR NOVO
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id

    const { data, error } = await supabase
      .from("message_templates")
      .insert({
        title,
        content,
        user_id: uid,
        is_default: false,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar modelo.",
        variant: "destructive",
      })
      return
    }

    setTemplates((prev) => [data, ...prev])

    toast({
      title: "Criado!",
      description: "Novo modelo salvo com sucesso.",
    })

    setIsTemplateModalOpen(false)
  }

  // ===============================
  // DUPLICAR
  // ===============================
  const handleDuplicate = async (template: Template) => {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id

    const { data, error } = await supabase
      .from("message_templates")
      .insert({
        title: template.title + " (Cópia)",
        content: template.content,
        user_id: uid,
        is_default: false,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao duplicar.",
        variant: "destructive",
      })
      return
    }

    setTemplates((prev) => [data, ...prev])

    toast({
      title: "Duplicado!",
      description: "Modelo copiado com sucesso.",
    })
  }

  // ===============================
  // REMOVER
  // ===============================
  const handleDelete = async (id: string) => {
    await supabase.from("message_templates").delete().eq("id", id)

    setTemplates((prev) => prev.filter((t) => t.id !== id))

    toast({
      title: "Removido!",
      description: "Modelo apagado com sucesso.",
    })
  }

  // ===============================
  // ALTERAR SENHA
  // ===============================
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Sucesso!",
      description: "Senha alterada com sucesso.",
    })

    setNewPassword("")
    setConfirmPassword("")
    setIsPasswordModalOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* 🔐 SEGURANÇA */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Gerencie sua senha de acesso.</CardDescription>
          </div>

          <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Alterar Senha
          </Button>
        </CardHeader>
      </Card>

      {/* MODELOS */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Modelos WhatsApp</CardTitle>
            <CardDescription>
              Clique para editar, duplicar ou remover.
            </CardDescription>
          </div>

          <Button onClick={openCreateModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Modelo
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => openEditModal(template)}
              className="cursor-pointer rounded-xl border p-4 hover:bg-muted transition flex justify-between"
            >
              <div>
                <p className="font-semibold">{template.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.content}
                </p>
              </div>

              <div className="flex gap-2">
                {/* DUPLICAR */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicate(template)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>

                {/* APAGAR */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(template.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MODAL TEMPLATE ULTRA */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Editar Modelo" : "Criar Modelo"}
            </DialogTitle>
            <DialogDescription>
              
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8">
            {/* FORM */}
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <Label>Mensagem</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[180px]"
                />
              </div>

              {/* VARIÁVEIS */}
              <div>
                <Label className="text-sm">Variáveis rápidas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variables.map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant="outline"
                      onClick={() => insertVariable(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>


            </div>

            {/* PREVIEW WHATSAPP REAL */}
            <div className="rounded-xl border p-4 bg-[#ece5dd] dark:bg-zinc-900 flex justify-end">
              <div className="bg-white dark:bg-zinc-100 text-black p-3 rounded-lg shadow max-w-[90%]">
                <p className="text-sm whitespace-pre-wrap">{content}</p>
                <p className="text-[10px] text-right mt-2 opacity-60">
                  12:45 ✓✓
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveTemplate}>
              <Pencil className="mr-2 h-4 w-4" />
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL SENHA */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nova senha */}
            <div className="relative">
              <Label>Nova senha</Label>
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-7"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            {/* Confirmar */}
            <div className="relative">
              <Label>Confirmar senha</Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-7"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleChangePassword}>Salvar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Configuracoes
