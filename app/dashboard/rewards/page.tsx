"use client"

import { useState, useEffect } from "react"
import { 
  obtenerClientesConPuntos,
  obtenerRewardsActivos,
  actualizarPuntosCliente,
  crearReward
} from "@/lib/supabase-clientes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Gift, Percent, Star, TrendingUp, 
  Plus, Search, Calendar, Award, Sparkles
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RewardsPage() {
  const [busqueda, setBusqueda] = useState("")
  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [tipoReward, setTipoReward] = useState("")
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const [nuevoReward, setNuevoReward] = useState({
    descripcion: "",
    valor: 0,
    puntos: 0,
    fecha_expiracion: ""
  })

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 60000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    try {
      const clientesConPuntos = await obtenerClientesConPuntos()
      setClientes(clientesConPuntos)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuscarCliente = async () => {
    if (!busquedaCliente.trim()) {
      setClientesEncontrados([])
      return
    }
    
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.%${busquedaCliente}%,telefono.ilike.%${busquedaCliente}%`)
        .eq('activo', true)
        .limit(5)
      
      if (error) throw error
      setClientesEncontrados(data || [])
    } catch (error) {
      console.error('Error:', error)
      setClientesEncontrados([])
    }
  }

  const handleCrearReward = async () => {
    if (!clienteSeleccionado) {
      alert('❌ Selecciona un cliente')
      return
    }
    if (!tipoReward) {
      alert('❌ Selecciona un tipo de reward')
      return
    }
    if (!nuevoReward.descripcion.trim()) {
      alert('❌ Agrega una descripción')
      return
    }

    try {
      await crearReward({
        cliente_id: clienteSeleccionado.id,
        tipo: tipoReward as any,
        descripcion: nuevoReward.descripcion,
        valor_descuento: nuevoReward.valor,
        puntos: nuevoReward.puntos,
        fecha_expiracion: nuevoReward.fecha_expiracion || undefined,
        activo: true,
        usado: false
      })

      alert(`✅ Reward creado para ${clienteSeleccionado.nombre}`)
      setDialogOpen(false)
      setClienteSeleccionado(null)
      setBusquedaCliente("")
      setClientesEncontrados([])
      setTipoReward("")
      setNuevoReward({
        descripcion: "",
        valor: 0,
        puntos: 0,
        fecha_expiracion: ""
      })
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al crear reward')
    }
  }

  // Convertir clientes a formato de rewards
  const rewardsActivos = clientes.map(cliente => ({
    id: cliente.id,
    cliente: cliente.nombre,
    tipo: "puntos",
    descripcion: `${cliente.puntos_rewards} puntos acumulados`,
    valor: cliente.puntos_rewards,
    puntos: cliente.puntos_rewards,
    fecha_expiracion: "N/A",
    usado: false,
    nivel: cliente.nivel_fidelidad
  }))

  const rewardsActivosMock = [
    {
      id: "1",
      cliente: "Carlos Méndez",
      tipo: "racha",
      descripcion: "10 visitas consecutivas completadas",
      valor: 200,
      puntos: 200,
      fecha_expiracion: "2025-11-09",
      usado: false
    },
    {
      id: "2",
      cliente: "Ana García",
      tipo: "cumpleaños",
      descripcion: "Descuento especial de cumpleaños",
      valor: 20,
      puntos: 0,
      fecha_expiracion: "2025-10-15",
      usado: false
    },
    {
      id: "3",
      cliente: "Roberto Silva",
      tipo: "producto_gratis",
      descripcion: "Bebida de cortesía",
      valor: 15,
      puntos: 0,
      fecha_expiracion: "2025-10-20",
      usado: false
    },
    {
      id: "4",
      cliente: "María López",
      tipo: "descuento",
      descripcion: "15% de descuento en próxima visita",
      valor: 15,
      puntos: 0,
      fecha_expiracion: "2025-10-25",
      usado: false
    }
  ]

  const rewardsUsados = [
    {
      id: "5",
      cliente: "Jorge Ramírez",
      tipo: "puntos",
      descripcion: "100 puntos canjeados",
      valor: 10,
      fecha_uso: "2025-10-08"
    },
    {
      id: "6",
      cliente: "Laura Martínez",
      tipo: "upgrade",
      descripcion: "Mesa preferencial",
      valor: 0,
      fecha_uso: "2025-10-07"
    }
  ]

  const estadisticas = [
    {
      label: "Clientes con Puntos",
      value: loading ? "..." : rewardsActivos.length.toString(),
      icon: Gift,
      color: "purple"
    },
    {
      label: "Canjeados Hoy",
      value: "8",
      icon: Star,
      color: "amber"
    },
    {
      label: "Valor Total",
      value: `$${rewardsActivos.reduce((acc, r) => acc + r.valor, 0)}`,
      icon: TrendingUp,
      color: "emerald"
    },
    {
      label: "Próximos a Vencer",
      value: "3",
      icon: Calendar,
      color: "red"
    }
  ]

  const tiposReward = [
    { tipo: "puntos", label: "Puntos", icon: Star, color: "text-purple-500" },
    { tipo: "descuento", label: "Descuento", icon: Percent, color: "text-emerald-500" },
    { tipo: "producto_gratis", label: "Producto Gratis", icon: Gift, color: "text-blue-500" },
    { tipo: "upgrade", label: "Upgrade", icon: Sparkles, color: "text-amber-500" },
    { tipo: "cumpleaños", label: "Cumpleaños", icon: Award, color: "text-pink-500" },
    { tipo: "racha", label: "Racha", icon: TrendingUp, color: "text-orange-500" }
  ]

  const getTipoInfo = (tipo: string) => {
    return tiposReward.find(t => t.tipo === tipo) || tiposReward[0]
  }

  const getDiasRestantes = (fecha: string) => {
    const dias = Math.floor((new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (dias < 0) return "Vencido"
    if (dias === 0) return "Hoy"
    if (dias === 1) return "Mañana"
    return `${dias} días`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Sistema de Rewards</h1>
          <p className="text-slate-400 mt-1">Gestiona recompensas y fidelización de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-50">Crear Nuevo Reward</DialogTitle>
              <DialogDescription className="text-slate-400">
                Asigna una recompensa especial a un cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-slate-300">Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar cliente..." 
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarCliente()}
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100" 
                  />
                </div>
                {clientesEncontrados.length > 0 && (
                  <div className="glass rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                    {clientesEncontrados.map((cliente) => (
                      <div
                        key={cliente.id}
                        onClick={() => {
                          setClienteSeleccionado(cliente)
                          setClientesEncontrados([])
                          setBusquedaCliente(cliente.nombre)
                        }}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <p className="text-slate-200 font-semibold">{cliente.nombre}</p>
                        <p className="text-xs text-slate-400">{cliente.telefono} • {cliente.nivel_fidelidad}</p>
                      </div>
                    ))}
                  </div>
                )}
                {clienteSeleccionado && (
                  <div className="glass rounded-lg p-3 border border-emerald-500/30">
                    <p className="text-sm text-emerald-500 font-semibold">{clienteSeleccionado.nombre}</p>
                    <p className="text-xs text-slate-400">{clienteSeleccionado.telefono} • {clienteSeleccionado.puntos_rewards} puntos</p>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Tipo de Reward</Label>
                <Select value={tipoReward} onValueChange={setTipoReward}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {tiposReward.map((tipo) => (
                      <SelectItem key={tipo.tipo} value={tipo.tipo}>
                        <div className="flex items-center gap-2">
                          <tipo.icon className={`w-4 h-4 ${tipo.color}`} />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Descripción</Label>
                <Input 
                  placeholder="Ej: Descuento especial por fidelidad" 
                  value={nuevoReward.descripcion}
                  onChange={(e) => setNuevoReward({...nuevoReward, descripcion: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-slate-100" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Valor ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={nuevoReward.valor}
                    onChange={(e) => setNuevoReward({...nuevoReward, valor: parseFloat(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700 text-slate-100" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Puntos</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={nuevoReward.puntos}
                    onChange={(e) => setNuevoReward({...nuevoReward, puntos: parseInt(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700 text-slate-100" 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Fecha de Expiración</Label>
                <Input 
                  type="date" 
                  value={nuevoReward.fecha_expiracion}
                  onChange={(e) => setNuevoReward({...nuevoReward, fecha_expiracion: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-slate-100" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCrearReward}
                disabled={!clienteSeleccionado || !tipoReward || !nuevoReward.descripcion}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Crear Reward
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        {estadisticas.map((stat) => (
          <div key={stat.label} className="glass-hover rounded-2xl overflow-hidden">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center backdrop-blur-sm`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-50">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Tipos de Rewards */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50">Tipos de Rewards Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {tiposReward.map((tipo) => (
                <div key={tipo.tipo} className="glass rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors">
                  <div className={`w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-2`}>
                    <tipo.icon className={`w-6 h-6 ${tipo.color}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-200">{tipo.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Activos */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center justify-between">
              <span>Rewards Activos ({rewardsActivos.length})</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 w-64 bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewardsActivos.map((reward) => {
                const tipoInfo = getTipoInfo(reward.tipo)
                const diasRestantes = getDiasRestantes(reward.fecha_expiracion)
                
                return (
                  <div key={reward.id} className="glass rounded-xl p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0`}>
                          <tipoInfo.icon className={`w-6 h-6 ${tipoInfo.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-200">{reward.cliente}</h3>
                            <Badge className="text-xs capitalize">
                              {tipoInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{reward.descripcion}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {reward.valor > 0 && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Valor: ${reward.valor}
                              </span>
                            )}
                            {reward.puntos > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {reward.puntos} puntos
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${
                              diasRestantes === "Hoy" || diasRestantes === "Mañana" 
                                ? "text-red-500 font-semibold" 
                                : ""
                            }`}>
                              <Calendar className="w-3 h-3" />
                              Vence: {diasRestantes}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-emerald-600 to-green-600"
                        >
                          Canjear
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-slate-700 text-slate-300"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Usados Recientemente */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50">Rewards Canjeados Recientemente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewardsUsados.map((reward) => {
                const tipoInfo = getTipoInfo(reward.tipo)
                
                return (
                  <div key={reward.id} className="glass rounded-xl p-4 opacity-75">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center`}>
                        <tipoInfo.icon className={`w-5 h-5 ${tipoInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-300">{reward.cliente}</h3>
                          <Badge variant="outline" className="text-xs">
                            Usado
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{reward.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(reward.fecha_uso).toLocaleDateString('es-MX')}
                        </p>
                        {reward.valor > 0 && (
                          <p className="text-sm font-semibold text-emerald-500">
                            ${reward.valor}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Rewards Automáticos */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50">Rewards Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">Cumpleaños</h3>
                    <p className="text-sm text-slate-400">20% de descuento en día de cumpleaños</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                    Activo
                  </Badge>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">Racha de 5 Visitas</h3>
                    <p className="text-sm text-slate-400">100 puntos + bebida gratis</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                    Activo
                  </Badge>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">Racha de 10 Visitas</h3>
                    <p className="text-sm text-slate-400">200 puntos + 20% descuento</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                    Activo
                  </Badge>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">Nivel Platino</h3>
                    <p className="text-sm text-slate-400">15% descuento permanente</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                    Activo
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
