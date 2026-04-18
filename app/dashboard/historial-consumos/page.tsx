"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Receipt, Search, Calendar, Clock, DollarSign, 
  User, UtensilsCrossed, Filter, Download, TrendingUp
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Consumo {
  id: string
  cliente_nombre: string
  mesa_numero: number
  productos: string
  total: number
  fecha: string
  hora: string
  mesero: string
  metodo_pago: string
}

export default function HistorialConsumosPage() {
  const [consumos, setConsumos] = useState<Consumo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("hoy")
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("todos")

  useEffect(() => {
    cargarConsumos()
    const interval = setInterval(cargarConsumos, 10000)
    return () => clearInterval(interval)
  }, [])

  async function cargarConsumos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Cargar tickets/consumos históricos
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.warn('⚠️ Error cargando consumos:', error.message)
        setConsumos([])
      } else {
        const consumosFormateados = (data || []).map((ticket: any) => {
          // Formatear productos (solo de items)
          let productosTexto = 'Sin detalles'
          if (ticket.items) {
            if (typeof ticket.items === 'string') {
              productosTexto = ticket.items
            } else if (Array.isArray(ticket.items)) {
              productosTexto = ticket.items.map((item: any) => 
                typeof item === 'string' ? item : item.nombre || item.producto || 'Producto'
              ).join(', ')
            } else if (typeof ticket.items === 'object') {
              productosTexto = JSON.stringify(ticket.items)
            }
          }

          return {
            id: ticket.id,
            cliente_nombre: ticket.cliente_nombre || 'Cliente General',
            mesa_numero: ticket.mesa_numero || 0,
            productos: productosTexto,
            total: parseFloat(ticket.total) || 0,
            fecha: new Date(ticket.created_at).toLocaleDateString('es-MX'),
            hora: new Date(ticket.created_at).toLocaleTimeString('es-MX', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            mesero: ticket.mesero || 'Sin asignar',
            metodo_pago: ticket.metodo_pago || 'Efectivo'
          }
        })
        setConsumos(consumosFormateados)
      }
    } catch (error: any) {
      console.warn('⚠️ Error general:', error?.message || error)
    } finally {
      setLoading(false)
    }
  }

  // Filtros
  const consumosFiltrados = consumos.filter(consumo => {
    const matchBusqueda = consumo.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          consumo.mesa_numero.toString().includes(busqueda)
    
    const hoy = new Date().toLocaleDateString('es-MX')
    const matchFecha = filtroFecha === "todos" || 
                       (filtroFecha === "hoy" && consumo.fecha === hoy)
    
    const matchMetodo = filtroMetodoPago === "todos" || 
                        consumo.metodo_pago === filtroMetodoPago
    
    return matchBusqueda && matchFecha && matchMetodo
  })

  // Estadísticas
  const totalVentas = consumosFiltrados.reduce((sum, c) => sum + c.total, 0)
  const ticketPromedio = consumosFiltrados.length > 0 
    ? totalVentas / consumosFiltrados.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">
            Historial de Consumos
          </h1>
          <p className="text-slate-400 mt-1">
            Registro completo de todas las ventas y consumos
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Ventas</p>
                <p className="text-3xl font-bold text-emerald-500">
                  ${totalVentas.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tickets</p>
                <p className="text-3xl font-bold text-blue-500">
                  {consumosFiltrados.length}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ticket Promedio</p>
                <p className="text-3xl font-bold text-amber-500">
                  ${ticketPromedio.toFixed(0)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Clientes Únicos</p>
                <p className="text-3xl font-bold text-purple-500">
                  {new Set(consumosFiltrados.map(c => c.cliente_nombre)).size}
                </p>
              </div>
              <User className="w-10 h-10 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="glass-hover border-slate-700">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente o mesa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-700"
              />
            </div>

            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="todos">Todos los días</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroMetodoPago} onValueChange={setFiltroMetodoPago}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setBusqueda("")
                setFiltroFecha("hoy")
                setFiltroMetodoPago("todos")
              }}
              className="border-slate-700"
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Consumos */}
      <Card className="glass-hover border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-50">
            Consumos Registrados ({consumosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-slate-400 py-8">Cargando consumos...</p>
          ) : consumosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No hay consumos registrados</p>
              <p className="text-xs text-slate-500">
                Los consumos aparecerán cuando se generen tickets
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {consumosFiltrados.map((consumo) => (
                  <Card 
                    key={consumo.id}
                    className="glass border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-50">
                              {consumo.cliente_nombre}
                            </h3>
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                              Mesa {consumo.mesa_numero}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>{consumo.fecha}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{consumo.hora}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <User className="w-4 h-4" />
                              <span>{consumo.mesero}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <DollarSign className="w-4 h-4" />
                              <span>{consumo.metodo_pago}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <UtensilsCrossed className="w-4 h-4 text-slate-500 mt-0.5" />
                            <span className="text-slate-400">{consumo.productos}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-500">
                            ${consumo.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
