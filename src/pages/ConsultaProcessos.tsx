import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

interface Tribunal {
  nome: string;
  alias: string;
  categoria: string;
  url: string;
}

interface ProcessoResult {
  numeroProcesso: string;
  classe: string;
  tribunal: string;
  sistema: string;
  formato: string;
  grau: string;
  dataAjuizamento: string;
  dataHoraUltimaAtualizacao: string;
  orgaoJulgador: {
    codigo?: number;
    nome: string;
    codigoMunicipioIBGE?: number;
  };
  assuntos: Array<{
    codigo: number;
    nome: string;
  }>;
  nivelSigilo: number;
  partes?: Array<{
    nome: string;
    tipo: string;
  }>;
  movimentos?: Array<{
    codigo: number;
    nome: string;
    dataHora: string;
    complementosTabelados?: Array<{
      codigo: number;
      valor: number;
      nome: string;
      descricao: string;
    }>;
  }>;
}

const TRIBUNAIS: Tribunal[] = [
  // Tribunais Superiores
  {
    nome: "Tribunal Superior do Trabalho",
    alias: "tst",
    categoria: "Tribunais Superiores",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tst/_search",
  },
  {
    nome: "Tribunal Superior Eleitoral",
    alias: "tse",
    categoria: "Tribunais Superiores",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tse/_search",
  },
  {
    nome: "Tribunal Superior de Justiça",
    alias: "stj",
    categoria: "Tribunais Superiores",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search",
  },
  {
    nome: "Tribunal Superior Militar",
    alias: "stm",
    categoria: "Tribunais Superiores",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_stm/_search",
  },

  // Justiça Federal
  {
    nome: "Tribunal Regional Federal da 1ª Região",
    alias: "trf1",
    categoria: "Justiça Federal",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search",
  },
  {
    nome: "Tribunal Regional Federal da 2ª Região",
    alias: "trf2",
    categoria: "Justiça Federal",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf2/_search",
  },
  {
    nome: "Tribunal Regional Federal da 3ª Região",
    alias: "trf3",
    categoria: "Justiça Federal",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf3/_search",
  },
  {
    nome: "Tribunal Regional Federal da 4ª Região",
    alias: "trf4",
    categoria: "Justiça Federal",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf4/_search",
  },
  {
    nome: "Tribunal Regional Federal da 5ª Região",
    alias: "trf5",
    categoria: "Justiça Federal",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf5/_search",
  },
  {
    nome: "Tribunal Regional Federal da 6ª Região",
    alias: "trf6",
    categoria: "Justiça Federal",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_trf6/_search",
  },

  // Justiça Estadual (principais)
  {
    nome: "Tribunal de Justiça de São Paulo",
    alias: "tjsp",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search",
  },
  {
    nome: "Tribunal de Justiça do Rio de Janeiro",
    alias: "tjrj",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search",
  },
  {
    nome: "Tribunal de Justiça de Minas Gerais",
    alias: "tjmg",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjmg/_search",
  },
  {
    nome: "TJ do Distrito Federal e Territórios",
    alias: "tjdft",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjdft/_search",
  },
  {
    nome: "Tribunal de Justiça do Rio Grande do Sul",
    alias: "tjrs",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjrs/_search",
  },
  {
    nome: "Tribunal de Justiça do Paraná",
    alias: "tjpr",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjpr/_search",
  },
  {
    nome: "Tribunal de Justiça de Santa Catarina",
    alias: "tjsc",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjsc/_search",
  },
  {
    nome: "Tribunal de Justiça da Bahia",
    alias: "tjba",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search",
  },
  {
    nome: "Tribunal de Justiça do Ceará",
    alias: "tjce",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjce/_search",
  },
  {
    nome: "Tribunal de Justiça de Goiás",
    alias: "tjgo",
    categoria: "Justiça Estadual",
    url: "https://api-publica.datajud.cnj.jus.br/api_publica_tjgo/_search",
  },
];

const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

export default function ConsultaProcessos() {
  const { user } = useAuth();
  const [tribunalSelecionado, setTribunalSelecionado] = useState<string>("");
  const [numeroProcesso, setNumeroProcesso] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resultados, setResultados] = useState<ProcessoResult[]>([]);
  const [erro, setErro] = useState<string>("");

  const buscarProcesso = async () => {
    if (!numeroProcesso.trim() || !tribunalSelecionado) {
      setErro(
        "Por favor, selecione um tribunal e informe o número do processo"
      );
      return;
    }

    setLoading(true);
    setErro("");
    setResultados([]);

    try {
      // URL do webhook do n8n - substitua pela URL real do seu webhook
      const webhookUrl = "https://oito.typebot.live/webhook/consulta-processo";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tribunal: tribunalSelecionado,
          numeroProcesso: numeroProcesso,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta do webhook:", data); // Debug

      if (data.success && data.data) {
        setResultados([data.data]);
      } else {
        setErro(data.message || "Nenhum processo encontrado com este número");
      }
    } catch (error) {
      console.error("Erro ao buscar processo:", error);
      setErro("Erro ao buscar processo: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      return new Date(dataString).toLocaleDateString("pt-BR");
    } catch {
      return dataString;
    }
  };

  const formatarNumeroProcesso = (numero: string) => {
    // Formatar número do processo no padrão NNNNNNN-DD.AAAA.J.TR.OOOO
    if (numero && numero.length === 20) {
      return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(
        9,
        13
      )}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(
        16,
        20
      )}`;
    }
    return numero;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Consulta de Processos - Datajud</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Processo</CardTitle>
          <CardDescription>Consulte processos judiciais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tribunal">Tribunal</Label>
              <Select
                value={tribunalSelecionado}
                onValueChange={setTribunalSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tribunal" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Tribunais Superiores",
                    "Justiça Federal",
                    "Justiça Estadual",
                  ].map((categoria) => (
                    <div key={categoria}>
                      <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                        {categoria}
                      </div>
                      {TRIBUNAIS.filter((t) => t.categoria === categoria).map(
                        (tribunal) => (
                          <SelectItem
                            key={tribunal.alias}
                            value={tribunal.alias}
                          >
                            {tribunal.nome}
                          </SelectItem>
                        )
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroProcesso">Número do Processo</Label>
              <Input
                id="numeroProcesso"
                placeholder="Ex: 00008323520184013202"
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                maxLength={25}
              />
            </div>
          </div>

          <Button
            onClick={buscarProcesso}
            disabled={loading || !tribunalSelecionado || !numeroProcesso}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Processo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {resultados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Consulta</CardTitle>
            <CardDescription>
              {resultados.length} processo(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resultados.map((processo, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {formatarNumeroProcesso(processo.numeroProcesso)}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Classe:</span>{" "}
                            {processo.classe}
                          </p>
                          <p>
                            <span className="font-medium">Sistema:</span>{" "}
                            {processo.sistema}
                          </p>
                          <p>
                            <span className="font-medium">Formato:</span>{" "}
                            {processo.formato}
                          </p>
                          <p>
                            <span className="font-medium">Grau:</span>{" "}
                            {processo.grau}
                          </p>
                          <p>
                            <span className="font-medium">
                              Data de Ajuizamento:
                            </span>{" "}
                            {formatarData(processo.dataAjuizamento)}
                          </p>
                          <p>
                            <span className="font-medium">
                              Última Atualização:
                            </span>{" "}
                            {formatarData(processo.dataHoraUltimaAtualizacao)}
                          </p>
                          <p>
                            <span className="font-medium">Órgão Julgador:</span>{" "}
                            {processo.orgaoJulgador.nome}
                            {processo.orgaoJulgador.codigo && (
                              <span className="text-muted-foreground"> (Código: {processo.orgaoJulgador.codigo})</span>
                            )}
                          </p>
                          <p>
                            <span className="font-medium">
                              Nível de Sigilo:
                            </span>{" "}
                            {processo.nivelSigilo}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Assuntos:</h4>
                        <div className="space-y-1 text-sm">
                          {processo.assuntos
                            ?.slice(0, 5)
                            .map((assunto, idx) => (
                              <p key={idx} className="text-muted-foreground">
                                <span className="font-medium">
                                  {assunto.codigo}:
                                </span>{" "}
                                {assunto.nome}
                              </p>
                            ))}
                          {processo.assuntos?.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{processo.assuntos.length - 5} outros assuntos
                            </p>
                          )}
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Partes:</h4>
                          <div className="space-y-1 text-sm">
                            {processo.partes?.slice(0, 3).map((parte, idx) => (
                              <p key={idx} className="text-muted-foreground">
                                <span className="font-medium">
                                  {parte.tipo}:
                                </span>{" "}
                                {parte.nome}
                              </p>
                            ))}
                            {processo.partes?.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{processo.partes.length - 3} outras partes
                              </p>
                            )}
                          </div>
                        </div>

                        {processo.movimentos &&
                          processo.movimentos.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">
                                Movimentos ({processo.movimentos.length}):
                              </h4>
                              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                                {processo.movimentos
                                  ?.slice(0, 5)
                                  .map((mov, idx) => (
                                    <div
                                      key={idx}
                                      className="border-l-2 border-gray-200 pl-3"
                                    >
                                      <p className="font-medium">
                                        {mov.nome}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {formatarData(mov.dataHora)} (Código: {mov.codigo})
                                      </p>
                                      {mov.complementosTabelados && mov.complementosTabelados.length > 0 && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          <span className="font-medium">Complementos:</span>
                                          {mov.complementosTabelados.map((comp, compIndex) => (
                                            <div key={compIndex} className="ml-2">
                                              • {comp.nome} ({comp.descricao})
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                {processo.movimentos.length > 5 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{processo.movimentos.length - 5} outros
                                    movimentos
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
