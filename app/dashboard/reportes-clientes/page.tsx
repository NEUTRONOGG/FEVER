"use client"

import { useState, useEffect } from "react"
import { 
  obtenerClientes,
  obtenerEstadisticasGenerales,
  obtenerVisitasPorDia
} from "@/lib/supabase-clientes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Flame, Users, TrendingUp, Award, Calendar,
  Download, Filter, Star, Clock, DollarSign
} from "lucide-react"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function ReportesClientesPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes")
  const [loading, setLoading] = useState(true)
  const [datosReales, setDatosReales] = useState<any>({})

  useEffect(() => {
    cargarDatosReales()
    const interval = setInterval(cargarDatosReales, 60000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatosReales() {
    try {
      const [estadisticas, clientes, visitas] = await Promise.all([
        obtenerEstadisticasGenerales(),
        obtenerClientes(),
        obtenerVisitasPorDia(7)
      ])
      
      // Calcular rachas (clientes con más visitas)
      const clientesOrdenados = clientes
        .sort((a, b) => (b.total_visitas || 0) - (a.total_visitas || 0))
        .slice(0, 5)
      
      setDatosReales({
        clientesConRachas: clientesOrdenados,
        estadisticas: estadisticas,
        totalClientes: clientes.length,
        visitas: visitas
      })
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Datos reales de clientes con rachas
  const clientesConRachas = loading ? [] : (datosReales.clientesConRachas || []).map((c: any) => ({
    nombre: c.nombre,
    racha: c.total_visitas || 0,
    nivel: c.nivel_fidelidad || 'bronce',
    consumo: c.consumo_total || 0
  }))

  // Rachas de fines de semana (por ahora vacío - requiere lógica adicional)
  const rachasFinesSemana = loading ? [] : []

  const metricasGenero = [
    { 
      genero: "Masculino", 
      clientes: datosReales.estadisticas?.genero?.masculinos || 0, 
      visitas: 0, 
      consumo: 0, 
      promedio: 0 
    },
    { 
      genero: "Femenino", 
      clientes: datosReales.estadisticas?.genero?.femeninos || 0, 
      visitas: 0, 
      consumo: 0, 
      promedio: 0 
    },
  ]

  const distribucionNiveles = [
    { nivel: "Diamante", cantidad: datosReales.estadisticas?.niveles?.diamante || 0, color: "#06b6d4" },
    { nivel: "Platino", cantidad: datosReales.estadisticas?.niveles?.platino || 0, color: "#a855f7" },
    { nivel: "Oro", cantidad: datosReales.estadisticas?.niveles?.oro || 0, color: "#f59e0b" },
    { nivel: "Plata", cantidad: datosReales.estadisticas?.niveles?.plata || 0, color: "#94a3b8" },
    { nivel: "Bronce", cantidad: datosReales.estadisticas?.niveles?.bronce || 0, color: "#c2410c" },
  ]

  // Procesar visitas por día de la semana
  const visitasPorDia = (() => {
    if (loading || !datosReales.visitas) return []
    
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const visitasPorDiaMap = new Map<string, number>()
    
    // Inicializar todos los días en 0
    dias.forEach(dia => visitasPorDiaMap.set(dia, 0))
    
    // Contar visitas por día
    datosReales.visitas.forEach((visita: any) => {
      const fecha = new Date(visita.created_at)
      const dia = dias[fecha.getDay()]
      visitasPorDiaMap.set(dia, (visitasPorDiaMap.get(dia) || 0) + 1)
    })
    
    return dias.map(dia => ({
      dia,
      visitas: visitasPorDiaMap.get(dia) || 0
    }))
  })()

  // Procesar visitas por horario
  const visitasPorHorario = (() => {
    if (loading || !datosReales.visitas) return []
    
    const horarios: Record<string, number> = {
      'Desayuno\n(8-12)': 0,
      'Comida\n(12-17)': 0,
      'Tarde\n(17-20)': 0,
      'Cena\n(20-24)': 0
    }
    
    datosReales.visitas.forEach((visita: any) => {
      const fecha = new Date(visita.created_at)
      const hora = fecha.getHours()
      
      if (hora >= 8 && hora < 12) horarios['Desayuno\n(8-12)']++
      else if (hora >= 12 && hora < 17) horarios['Comida\n(12-17)']++
      else if (hora >= 17 && hora < 20) horarios['Tarde\n(17-20)']++
      else if (hora >= 20 && hora < 24) horarios['Cena\n(20-24)']++
    })
    
    return Object.entries(horarios).map(([horario, visitas]) => ({
      horario,
      visitas
    }))
  })()

  // Calificaciones hostess (requiere tabla de calificaciones)
  const calificacionesHostess = loading ? [] : []

  // Productos por género (requiere productos en tickets)
  const topProductosPorGenero = {
    masculino: [],
    femenino: []
  }

  // Clientes nuevos vs recurrentes (requiere análisis histórico)
  const clientesNuevosVsRecurrentes = loading ? [] : []

  const getNivelColor = (nivel: string) => {
    const colores = {
      diamante: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
      platino: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      oro: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      plata: "bg-slate-400/10 text-slate-400 border-slate-400/30",
      bronce: "bg-orange-700/10 text-orange-700 border-orange-700/30"
    }
    return colores[nivel as keyof typeof colores] || colores.bronce
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Reportes Personalizados</h1>
          <p className="text-slate-400 mt-1">Análisis detallado de clientes y comportamiento</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-gradient-to-r from-primary to-amber-600">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rachas" className="space-y-6">
        <TabsList className="glass border-slate-800">
          <TabsTrigger value="rachas" className="data-[state=active]:bg-primary/20">
            <Flame className="w-4 h-4 mr-2" />
            Rachas
          </TabsTrigger>
          <TabsTrigger value="genero" className="data-[state=active]:bg-primary/20">
            <Users className="w-4 h-4 mr-2" />
            Por Género
          </TabsTrigger>
          <TabsTrigger value="fidelizacion" className="data-[state=active]:bg-primary/20">
            <Award className="w-4 h-4 mr-2" />
            Fidelización
          </TabsTrigger>
          <TabsTrigger value="hostess" className="data-[state=active]:bg-primary/20">
            <Star className="w-4 h-4 mr-2" />
            Hostess
          </TabsTrigger>
          <TabsTrigger value="visitas" className="data-[state=active]:bg-primary/20">
            <Calendar className="w-4 h-4 mr-2" />
            Visitas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Rachas */}
        <TabsContent value="rachas" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Clientes con Rachas Activas */}
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Rachas Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientesConRachas.map((cliente: any, index: number) => (
                      <div key={index} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                              <Flame className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{cliente.nombre}</p>
                              <Badge className={`text-xs capitalize border ${getNivelColor(cliente.nivel)}`}>
                                {cliente.nivel}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">{cliente.racha}</p>
                            <p className="text-xs text-slate-500">visitas</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400 mt-2">
                          <span>Consumo Total</span>
                          <span className="text-emerald-500 font-semibold">${cliente.consumo.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rachas de Fines de Semana */}
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Rachas Fines de Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rachasFinesSemana.map((cliente, index) => (
                      <div key={index} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-200">{cliente.nombre}</p>
                            <p className="text-xs text-slate-500">
                              Última: {new Date(cliente.ultima_visita).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-500">{cliente.fines_consecutivos}</p>
                            <p className="text-xs text-slate-500">fines seguidos</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Por Género */}
        <TabsContent value="genero" className="space-y-6">
          {/* Métricas Comparativas */}
          <div className="grid gap-6 lg:grid-cols-2">
            {metricasGenero.map((metrica) => (
              <div key={metrica.genero} className="glass-hover rounded-2xl overflow-hidden">
                <Card className="bg-transparent border-0 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-slate-50">{metrica.genero}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass rounded-lg p-4">
                        <p className="text-xs text-slate-400">Clientes</p>
                        <p className="text-2xl font-bold text-slate-200">{metrica.clientes}</p>
                      </div>
                      <div className="glass rounded-lg p-4">
                        <p className="text-xs text-slate-400">Visitas</p>
                        <p className="text-2xl font-bold text-blue-500">{metrica.visitas}</p>
                      </div>
                      <div className="glass rounded-lg p-4">
                        <p className="text-xs text-slate-400">Consumo Total</p>
                        <p className="text-2xl font-bold text-emerald-500">${(metrica.consumo / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="glass rounded-lg p-4">
                        <p className="text-xs text-slate-400">Ticket Promedio</p>
                        <p className="text-2xl font-bold text-amber-500">${metrica.promedio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Top Productos por Género */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50">Top Productos - Masculino</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topProductosPorGenero.masculino.map((producto, index) => (
                      <div key={index} className="glass rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-200">{producto.producto}</span>
                          <span className="text-sm font-bold text-blue-500">{producto.cantidad}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${producto.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50">Top Productos - Femenino</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topProductosPorGenero.femenino.map((producto, index) => (
                      <div key={index} className="glass rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-200">{producto.producto}</span>
                          <span className="text-sm font-bold text-pink-500">{producto.cantidad}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${producto.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Fidelización */}
        <TabsContent value="fidelizacion" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Distribución por Niveles */}
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50">Distribución por Niveles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {distribucionNiveles.map((nivel, index) => (
                      <div key={index} className="glass rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: nivel.color }}
                            />
                            <span className="font-semibold text-slate-200">{nivel.nivel}</span>
                          </div>
                          <span className="text-xl font-bold text-slate-200">{nivel.cantidad}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${(nivel.cantidad / 247) * 100}%`,
                              backgroundColor: nivel.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nuevos vs Recurrentes */}
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50">Clientes Nuevos vs Recurrentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      nuevos: { label: "Nuevos", color: "#3b82f6" },
                      recurrentes: { label: "Recurrentes", color: "#10b981" }
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={clientesNuevosVsRecurrentes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                        <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="nuevos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="recurrentes" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Hostess */}
        <TabsContent value="hostess" className="space-y-6">
          <div className="glass-hover rounded-2xl overflow-hidden">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader>
                <CardTitle className="text-slate-50">Desempeño de Hostess</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calificacionesHostess.map((hostess, index) => (
                    <div key={index} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-200">{hostess.nombre}</h3>
                          <p className="text-sm text-slate-400">{hostess.mesas} mesas atendidas</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                            <span className="text-2xl font-bold text-slate-200">{hostess.general}</span>
                          </div>
                          <p className="text-xs text-slate-500">Calificación general</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Atención</p>
                          <p className="text-lg font-bold text-blue-500">{hostess.atencion}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Rapidez</p>
                          <p className="text-lg font-bold text-emerald-500">{hostess.rapidez}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Amabilidad</p>
                          <p className="text-lg font-bold text-purple-500">{hostess.amabilidad}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Visitas */}
        <TabsContent value="visitas" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Visitas por Día */}
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50">Visitas por Día de la Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      visitas: { label: "Visitas", color: "#f59e0b" }
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visitasPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                        <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="visitas" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Visitas por Horario */}
            <div className="glass-hover rounded-2xl overflow-hidden">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-slate-50">Visitas por Horario</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      visitas: { label: "Visitas", color: "#8b5cf6" }
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visitasPorHorario}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                        <XAxis dataKey="horario" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="visitas" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
