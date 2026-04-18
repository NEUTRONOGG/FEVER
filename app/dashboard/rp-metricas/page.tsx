"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, Users, DollarSign, Calendar, 
  Award, Target, CheckCircle2, XCircle 
} from "lucide-react"

export default function RPMetricasPage() {
  const [metricas, setMetricas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarMetricas()
    const interval = setInterval(cargarMetricas, 30000)
    return () => clearInterval(interval)
  }, [])

  async function cargarMetricas() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Obtener métricas de RPs desde las vistas
      const { data: metricasRPs, error } = await supabase
        .from('vista_metricas_rps')
        .select('*')
        .order('consumo_total', { ascending: false })
      
      if (error) throw error
      
      // Obtener conversión de reservas
      const { data: conversion } = await supabase
        .from('vista_conversion_rps')
        .select('*')
      
      // Combinar datos
      const metricasCombinadas = metricasRPs?.map(rp => {
        const conv = conversion?.find(c => c.rp_nombre === rp.rp_nombre)
        return { ...rp, ...conv }
      })
      
      setMetricas(metricasCombinadas || [])
    } catch (error) {
      console.error('Error cargando métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 glow-amber">Métricas de RPs</h1>
        <p className="text-slate-400 mt-1">Desempeño y estadísticas de los RPs</p>
      </div>

      {/* Stats Generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">RPs Activos</p>
                <p className="text-2xl font-bold text-slate-50">{metricas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Consumo Total</p>
                <p className="text-2xl font-bold text-slate-50">
                  ${metricas.reduce((sum, m) => sum + (m.consumo_total || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Mesas Totales</p>
                <p className="text-2xl font-bold text-slate-50">
                  {metricas.reduce((sum, m) => sum + (m.total_mesas || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Conversión Promedio</p>
                <p className="text-2xl font-bold text-slate-50">
                  {metricas.length > 0 ? Math.round(metricas.reduce((sum, m) => sum + (m.tasa_conversion || 0), 0) / metricas.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de RPs */}
      <Card className="glass border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-50">Ranking de RPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metricas.map((rp, index) => (
              <div key={rp.rp_nombre} className="glass rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-amber-500/20 text-amber-500' :
                      index === 1 ? 'bg-slate-400/20 text-slate-400' :
                      index === 2 ? 'bg-orange-700/20 text-orange-700' :
                      'bg-slate-700/20 text-slate-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">{rp.rp_nombre}</h3>
                      <p className="text-xs text-slate-500">
                        {rp.total_tickets || 0} tickets generados
                      </p>
                    </div>
                  </div>
                  {index < 3 && (
                    <Award className={`w-8 h-8 ${
                      index === 0 ? 'text-amber-500' :
                      index === 1 ? 'text-slate-400' :
                      'text-orange-700'
                    }`} />
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Mesas</p>
                    <p className="text-lg font-semibold text-purple-500">{rp.total_mesas || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Consumo Total</p>
                    <p className="text-lg font-semibold text-emerald-500">
                      ${(rp.consumo_total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ticket Promedio</p>
                    <p className="text-lg font-semibold text-amber-500">
                      ${Math.round(rp.ticket_promedio || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Reservas</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-300">{rp.asistencias || 0}</span>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-slate-300">{rp.cancelaciones || 0}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Conversión</p>
                    <Badge className={`${
                      (rp.tasa_conversion || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                      (rp.tasa_conversion || 0) >= 60 ? 'bg-amber-500/20 text-amber-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {Math.round(rp.tasa_conversion || 0)}%
                    </Badge>
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
