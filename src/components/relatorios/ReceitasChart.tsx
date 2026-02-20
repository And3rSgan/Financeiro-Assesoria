import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type ReceitasChartProps = {
  data: { name: string; total: number }[]
}

const chartConfig = {
  total: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ReceitasChart({ data }: ReceitasChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Mensal</CardTitle>
        <CardDescription>
          Receitas pagas agrupadas por mês.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* ✅ Altura fixa obrigatória */}
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={data}>
            {/* ✅ Gradiente Premium */}
            <defs>
              <linearGradient
                id="greenGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                {/* Verde claro em cima */}
                <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                {/* Verde escuro embaixo */}
                <stop offset="100%" stopColor="#166534" stopOpacity={0.95} />
              </linearGradient>

              {/* Glow Premium */}
              <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="6"
                  floodColor="#4ade80"
                  floodOpacity="0.55"
                />
              </filter>
            </defs>

            {/* Fundo com grid suave */}
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
            />

            {/* Eixo X */}
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="#888888"
              fontSize={12}
            />

            {/* Eixo Y */}
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#888888"
              fontSize={12}
              tickFormatter={(value) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
            />

            {/* Tooltip Premium */}
            <ChartTooltip
              cursor={{
                fill: "rgba(74,222,128,0.08)",
              }}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : value
                  }
                  indicator="dot"
                />
              }
            />

            {/* ✅ Barra Premium Verde */}
            <Bar
              dataKey="total"
              fill="url(#greenGradient)"
              radius={[10, 10, 0, 0]}
              filter="url(#greenGlow)"
            />
          </BarChart>
        </ChartContainer>

        {/* Caso não tenha dados */}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">
            Nenhuma receita registrada ainda.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
