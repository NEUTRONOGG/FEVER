"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, TrendingUp, Award, Star,
  Trophy, Target, Calendar, Users
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function BonosPage() {
  const [rps, setRps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Obtener métricas del mes
      const { data: metricas, error } = await supabase
        .from('vista_mesas_rp_periodo')
        .select('*')
        .order('mesas_mes', { ascending: false })
      
      if (error) throw error
      
      // Calcular bonos
      const rpsConBonos = metricas?.map(rp => {
        const bonoBase = 1000
        const bonoMesas = (rp.mesas_mes || 0) * 50
        const bonoConsumo = Math.round(((rp.consumo_mes || 0) / 10000) * 100)
        const bonoCalificacion = 4.5 * 200 // TODO: Obtener calificación real
        const bonoTotal = bonoBase + bonoMesas + bonoConsumo + bonoCalificacion
        
        return {
          ...rp,
          bono_base: bonoBase,
          bono_mesas: bonoMesas,
          bono_consumo: bonoConsumo,
          bono_calificacion: bonoCalificacion,
          bono_total: bonoTotal,
          calificacion: 4.5
        }
      })
      
      setRps(rpsConBonos || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = rps.slice(0, 5).map(rp => ({
    rp: rp.rp_nombre,
    bono: rp.bono_total
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 glow-amber">Dashboard de Bonos</h1>
        <p className="text-slate-400 mt-1">Cálculo de bonos mensuales por desempeño</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Bonos Totales</p>
                <p className="text-2xl font-bold text-slate-50">
                  ${rps.reduce((sum, r) => sum + r.bono_total, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">RPs del Mes</p>
                <p className="text-2xl font-bold text-slate-50">{rps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Mejor RP</p>
                <p className="text-lg font-bold text-slate-50">{rps[0]?.rp_nombre || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Mesas del Mes</p>
                <p className="text-2xl font-bold text-slate-50">
                  {rps.reduce((sum, r) => sum + (r.mesas_mes || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de Bonos */}
      <Card className="glass border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-50">Top 5 RPs - Bonos del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              bono: {
                label: "Bono",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                <XAxis 
                  dataKey="rp" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass rounded-lg p-3 border border-emerald-500/30">
                          <p className="text-xs text-slate-400">{payload[0].payload.rp}</p>
                          <p className="text-lg font-bold text-emerald-500">
                            ${payload[0].value?.toLocaleString()}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="bono"
                  fill="oklch(0.68 0.19 156)"
                  radius={[8, 8, 0, 0]}
                  filter="drop-shadow(0 0 12px oklch(0.68 0.19 156 / 0.4))"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tabla Detallada de Bonos */}
      <Card className="glass border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-50">Desglose de Bonos por RP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rps.map((rp, index) => (
              <div key={rp.rp_nombre} className="glass rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      index === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-700 to-orange-800 text-white' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-200">{rp.rp_nombre}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${
                              star <= Math.round(rp.calificacion) ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                            }`} />
                          ))}
                        </div>
                        <span className="text-sm text-slate-400">{rp.calificacion.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Bono Total</p>
                    <p className="text-3xl font-bold text-emerald-500">
                      ${rp.bono_total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass rounded-lg p-3">
                    <p className="text-xs text-slate-500">Mesas (Mes)</p>
                    <p className="text-lg font-semibold text-purple-500">{rp.mesas_mes || 0}</p>
                    <p className="text-xs text-slate-600">Semana: {rp.mesas_semana || 0}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-xs text-slate-500">Consumo (Mes)</p>
                    <p className="text-lg font-semibold text-emerald-500">
                      ${(rp.consumo_mes || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600">
                      Semana: ${(rp.consumo_semana || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-xs text-slate-500">Ticket Promedio</p>
                    <p className="text-lg font-semibold text-amber-500">
                      ${Math.round((rp.consumo_mes || 0) / (rp.mesas_mes || 1)).toLocaleString()}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-xs text-slate-500">Calificación</p>
                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                      ⭐ {rp.calificacion.toFixed(1)}
                    </Badge>
                  </div>
                </div>

                {/* Desglose del Bono */}
                <div className="glass rounded-lg p-4 bg-slate-800/30">
                  <p className="text-xs text-slate-400 mb-3">Desglose del Bono:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Base</p>
                      <p className="text-slate-300 font-semibold">${rp.bono_base.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Por Mesas</p>
                      <p className="text-purple-400 font-semibold">+${rp.bono_mesas.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Por Consumo</p>
                      <p className="text-emerald-400 font-semibold">+${rp.bono_consumo.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Por Calificación</p>
                      <p className="text-amber-400 font-semibold">+${rp.bono_calificacion.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
