import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { isPast, subDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReceitasChart } from "@/components/relatorios/ReceitasChart";
import { DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

const Relatorios = () => {
    const [lancamentos, setLancamentos] = useState<any[]>([]);

    useEffect(() => {
      const load = async () => {
        const { data, error } = await supabase
          .from('financeiro_lancamentos')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error(error);
          return;
        }
        setLancamentos(data || []);
      };
      load();
    }, []);

    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    const aReceber = (lancamentos || [])
        .filter((l: any) => l.status !== 'Pago')
        .reduce((acc: number, l: any) => acc + Number(l.valor), 0);

    const recebidoUltimos30Dias = (lancamentos || [])
        .filter((l: any) => l.status === 'Pago' && l.data_pagamento && parseISO(l.data_pagamento) >= thirtyDaysAgo)
        .reduce((acc: number, l: any) => acc + Number(l.valor), 0);
    
    const lancamentosAtrasadosCount = (lancamentos || [])
        .filter((l: any) => l.status === 'Pendente' && l.data_vencimento && isPast(parseISO(l.data_vencimento)))
        .length;

    const anoAtual = today.getFullYear();
    const mesesDoAno = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(anoAtual, i, 1);
      return {
        mesChave: format(date, 'yyyy-MM'),
        label: format(date, 'MMM/yy', { locale: ptBR }).charAt(0).toUpperCase() + format(date, 'MMM/yy', { locale: ptBR }).slice(1),
      };
    });

    const receitasAgregadas = (lancamentos || [])
        .filter((l: any) => l.status === 'Pago' && l.data_pagamento)
        .reduce((acc: Record<string, number>, l: any) => {
            const dataPagamento = parseISO(l.data_pagamento as string);
            if (dataPagamento.getFullYear() === anoAtual) {
              const mesChave = format(dataPagamento, 'yyyy-MM');
              acc[mesChave] = (acc[mesChave] || 0) + Number(l.valor);
            }
            return acc;
        }, {} as Record<string, number>);

    const chartData = mesesDoAno.map(mes => ({
        name: mes.label,
        total: receitasAgregadas[mes.mesChave] || 0,
    }));

    return (
        <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Relatórios Financeiros</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{aReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <p className="text-xs text-muted-foreground">Valor de todos lançamentos pendentes.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebido (Últimos 30 dias)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recebidoUltimos30Dias.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <p className="text-xs text-muted-foreground">Soma dos valores pagos recentemente.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lançamentos Atrasados</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lancamentosAtrasadosCount}</div>
                        <p className="text-xs text-muted-foreground">Lançamentos pendentes com data vencida.</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
              <ReceitasChart data={chartData} />
            </div>
        </div>
    )
}

export default Relatorios;
