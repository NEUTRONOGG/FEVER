"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Search, UserPlus, Phone, Mail, Calendar, 
  TrendingUp, Award, Flame, Eye, QrCode, Gift, CalendarDays, ShoppingBag 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { obtenerClientes, crearCliente } from "@/lib/supabase-clientes"

export default function ClientesPage() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroNivel, setFiltroNivel] = useState("todos")
  const [ordenamiento, setOrdenamiento] = useState("visitas")
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogHistorial, setDialogHistorial] = useState(false)
  const [clienteHistorial, setClienteHistorial] = useState<any>(null)
  const [historialConsumos, setHistorialConsumos] = useState<any[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  
  // Estado del formulario
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    genero: "no_especifica",
    fecha_nacimiento: ""
  })

  useEffect(() => {
    cargarClientes()
    // Actualizar cada 5 segundos para ver cambios en tiempo real
    const interval = setInterval(cargarClientes, 5000)
    return () => clearInterval(interval)
  }, [])

  async function cargarClientes() {
    try {
      const data = await obtenerClientes()
      console.log('Clientes cargados:', data)
      setClientes(data || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cargarHistorialCliente(cliente: any) {
    setClienteHistorial(cliente)
    setDialogHistorial(true)
    setLoadingHistorial(true)
    
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setHistorialConsumos(tickets || [])
    } catch (error) {
      console.error('Error cargando historial:', error)
      setHistorialConsumos([])
    } finally {
      setLoadingHistorial(false)
    }
  }

  async function handleCrearCliente() {
    if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
      alert('Por favor completa al menos el nombre y teléfono')
      return
    }

    console.log('🔄 Creando cliente...', nuevoCliente)
    
    const cliente = await crearCliente({
      nombre: nuevoCliente.nombre,
      telefono: nuevoCliente.telefono,
      email: nuevoCliente.email || undefined,
      genero: nuevoCliente.genero as any,
      fecha_nacimiento: nuevoCliente.fecha_nacimiento || undefined,
      total_visitas: 0,
      visitas_consecutivas: 0,
      consumo_total: 0,
      consumo_promedio: 0,
      ticket_mas_alto: 0,
      calificacion_promedio: 0,
      puntos_rewards: 0,
      nivel_fidelidad: 'bronce',
      activo: true,
      primera_visita: new Date().toISOString()
    })

    if (cliente) {
      alert('✅ Cliente creado exitosamente')
      setDialogOpen(false)
      setNuevoCliente({
        nombre: "",
        telefono: "",
        email: "",
        genero: "no_especifica",
        fecha_nacimiento: ""
      })
      await cargarClientes()
    }
  }

  // Mock data de respaldo si no hay clientes
  const clientesMock = [
    {
      id: "1",
      nombre: "Carlos Méndez",
      telefono: "+52 555 123 4567",
      email: "carlos.mendez@email.com",
      genero: "masculino",
      total_visitas: 28,
      ultima_visita: "2025-10-09",
      consumo_total: 3450,
      consumo_promedio: 123,
      nivel_fidelidad: "platino",
      puntos_rewards: 850,
      visitas_consecutivas: 5,
      calificacion_promedio: 4.8
    },
    {
      id: "2",
      nombre: "Ana García",
      telefono: "+52 555 234 5678",
      email: "ana.garcia@email.com",
      genero: "femenino",
      total_visitas: 24,
      ultima_visita: "2025-10-08",
      consumo_total: 2980,
      consumo_promedio: 124,
      nivel_fidelidad: "oro",
      puntos_rewards: 620,
      visitas_consecutivas: 3,
      calificacion_promedio: 4.9
    },
    {
      id: "3",
      nombre: "Roberto Silva",
      telefono: "+52 555 345 6789",
      email: "roberto.silva@email.com",
      genero: "masculino",
      total_visitas: 22,
      ultima_visita: "2025-10-07",
      consumo_total: 2750,
      consumo_promedio: 125,
      nivel_fidelidad: "oro",
      puntos_rewards: 550,
      visitas_consecutivas: 7,
      calificacion_promedio: 4.7
    },
    {
      id: "4",
      nombre: "María López",
      telefono: "+52 555 456 7890",
      email: "maria.lopez@email.com",
      genero: "femenino",
      total_visitas: 19,
      ultima_visita: "2025-10-06",
      consumo_total: 2340,
      consumo_promedio: 123,
      nivel_fidelidad: "plata",
      puntos_rewards: 380,
      visitas_consecutivas: 2,
      calificacion_promedio: 4.6
    },
    {
      id: "5",
      nombre: "Jorge Ramírez",
      telefono: "+52 555 567 8901",
      email: "jorge.ramirez@email.com",
      genero: "masculino",
      total_visitas: 18,
      ultima_visita: "2025-10-05",
      consumo_total: 2180,
      consumo_promedio: 121,
      nivel_fidelidad: "plata",
      puntos_rewards: 360,
      visitas_consecutivas: 1,
      calificacion_promedio: 4.5
    },
    {
      id: "6",
      nombre: "Laura Martínez",
      telefono: "+52 555 678 9012",
      email: "laura.martinez@email.com",
      genero: "femenino",
      total_visitas: 15,
      ultima_visita: "2025-10-04",
      consumo_total: 1850,
      consumo_promedio: 123,
      nivel_fidelidad: "bronce",
      puntos_rewards: 280,
      visitas_consecutivas: 4,
      calificacion_promedio: 4.8
    }
  ]

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

  const clientesFiltrados = clientes.filter((cliente: any) => {
    const matchBusqueda = cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          cliente.telefono?.includes(busqueda) ||
                          cliente.email?.toLowerCase().includes(busqueda.toLowerCase())
    const matchNivel = filtroNivel === "todos" || cliente.nivel_fidelidad === filtroNivel
    return matchBusqueda && matchNivel
  }).sort((a, b) => {
    switch(ordenamiento) {
      case "calificacion":
        return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0)
      case "ticket":
        return (b.consumo_promedio || 0) - (a.consumo_promedio || 0)
      case "consumo_total":
        return (b.consumo_total || 0) - (a.consumo_total || 0)
      case "visitas":
        // Ordenar por fecha de última visita (más reciente primero)
        const fechaA = a.ultima_visita_real || a.ultima_visita || a.created_at
        const fechaB = b.ultima_visita_real || b.ultima_visita || b.created_at
        return new Date(fechaB).getTime() - new Date(fechaA).getTime()
      case "racha":
        return (b.visitas_consecutivas || 0) - (a.visitas_consecutivas || 0)
      default:
        return a.nombre?.localeCompare(b.nombre)
    }
  })

  const stats = [
    {
      label: "Total Clientes",
      value: clientes.length.toString(),
      icon: Users,
      color: "blue"
    },
    {
      label: "Clientes Activos",
      value: clientes.filter(c => {
        const diasDesdeVisita = Math.floor((new Date().getTime() - new Date(c.ultima_visita).getTime()) / (1000 * 60 * 60 * 24))
        return diasDesdeVisita <= 30
      }).length.toString(),
      icon: Award,
      color: "emerald"
    },
    {
      label: "Con Rachas",
      value: clientes.filter(c => c.visitas_consecutivas >= 3).length.toString(),
      icon: Flame,
      color: "orange"
    },
    {
      label: "Consumo Promedio",
      value: `$${Math.round(clientes.reduce((acc, c) => acc + c.consumo_promedio, 0) / clientes.length)}`,
      icon: TrendingUp,
      color: "amber"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Gestión de Clientes</h1>
          <p className="text-slate-400 mt-1">Administra y fideliza a tus clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-50">Registrar Nuevo Cliente</DialogTitle>
              <DialogDescription className="text-slate-400">
                Ingresa los datos del cliente para crear su perfil
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre" className="text-slate-300">Nombre Completo</Label>
                <Input 
                  id="nombre" 
                  placeholder="Ej: Juan Pérez" 
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono" className="text-slate-300">Teléfono</Label>
                <Input 
                  id="telefono" 
                  placeholder="+52 555 123 4567" 
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-300">Email (opcional)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="cliente@email.com" 
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="genero" className="text-slate-300">Género</Label>
                <Select value={nuevoCliente.genero} onValueChange={(value) => setNuevoCliente({...nuevoCliente, genero: value})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="no_especifica">Prefiero no especificar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha_nacimiento" className="text-slate-300">Fecha de Nacimiento (opcional)</Label>
                <Input 
                  id="fecha_nacimiento" 
                  type="date" 
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  value={nuevoCliente.fecha_nacimiento}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, fecha_nacimiento: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-primary to-amber-600" onClick={handleCrearCliente}>
                Crear Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
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

      {/* Filtros y Búsqueda */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
              <Select value={filtroNivel} onValueChange={setFiltroNivel}>
                <SelectTrigger className="w-full md:w-[200px] bg-slate-800/50 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Nivel de fidelidad" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  <SelectItem value="diamante">Diamante</SelectItem>
                  <SelectItem value="platino">Platino</SelectItem>
                  <SelectItem value="oro">Oro</SelectItem>
                  <SelectItem value="plata">Plata</SelectItem>
                  <SelectItem value="bronce">Bronce</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ordenamiento} onValueChange={setOrdenamiento}>
                <SelectTrigger className="w-full md:w-[200px] bg-slate-800/50 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="nombre">🔤 Nombre</SelectItem>
                  <SelectItem value="calificacion">⭐ Calificación</SelectItem>
                  <SelectItem value="ticket">💵 Ticket Promedio</SelectItem>
                  <SelectItem value="consumo_total">💰 Consumo Total</SelectItem>
                  <SelectItem value="visitas">👥 Visitas</SelectItem>
                  <SelectItem value="racha">🔥 Racha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes - Vista Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => (
          <div key={cliente.id} className="glass rounded-2xl p-5 hover:bg-slate-800/50 transition-all border border-slate-700/50 hover:border-amber-500/30">
            {/* Header con Avatar y Nombre */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {cliente.nombre?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-100 truncate">{cliente.nombre}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={`text-xs capitalize border ${getNivelColor(cliente.nivel_fidelidad)}`}>
                    {cliente.nivel_fidelidad}
                  </Badge>
                  {cliente.visitas_consecutivas >= 3 && (
                    <Badge className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/30">
                      <Flame className="w-3 h-3 mr-1" />
                      {cliente.visitas_consecutivas}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-amber-500" />
                <span className="text-slate-300">{cliente.telefono || 'Sin teléfono'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-amber-500" />
                <span className="text-slate-300 truncate">{cliente.email || 'Sin email'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-slate-300">
                  {cliente.ultima_visita_real 
                    ? `Última visita: ${new Date(cliente.ultima_visita_real).toLocaleDateString('es-MX')}`
                    : 'Sin visitas registradas'
                  }
                </span>
              </div>
            </div>

            {/* Estadísticas en Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Total Visitas</p>
                <p className="text-xl font-bold text-slate-200">{cliente.total_visitas || 0}</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Consumo Total</p>
                <p className="text-xl font-bold text-emerald-500">${cliente.consumo_total?.toLocaleString() || '0'}</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Ticket Promedio</p>
                <p className="text-xl font-bold text-amber-500">${cliente.consumo_promedio || 0}</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Calificación</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold text-purple-500">{cliente.calificacion_promedio?.toFixed(1) || '0.0'}</span>
                  <span className="text-xs text-amber-500">★</span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-emerald-700 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => cargarHistorialCliente(cliente)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Historial
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-700/50">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-slate-50 text-xl">Perfil de Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {/* Perfil Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">
                          {cliente.nombre?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-50">{cliente.nombre}</h2>
                        <Badge className={`mt-1 capitalize border ${getNivelColor(cliente.nivel_fidelidad)}`}>
                          {cliente.nivel_fidelidad}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400">Visitas</p>
                        <p className="text-2xl font-bold text-slate-200">{cliente.total_visitas}</p>
                      </div>
                      <div className="glass rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400">Consumo Total</p>
                        <p className="text-2xl font-bold text-emerald-500">${cliente.consumo_total?.toLocaleString()}</p>
                      </div>
                      <div className="glass rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400">Ticket Promedio</p>
                        <p className="text-2xl font-bold text-amber-500">${cliente.consumo_promedio}</p>
                      </div>
                      <div className="glass rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400">Puntos</p>
                        <p className="text-2xl font-bold text-purple-500">{cliente.puntos_rewards}</p>
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="glass rounded-lg p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-slate-300 mb-2">Información de Contacto</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="w-4 h-4 text-amber-500" />
                        {cliente.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="w-4 h-4 text-amber-500" />
                        {cliente.email || 'No registrado'}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">Rewards</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Puntos disponibles</span>
                        <span className="text-lg font-bold text-purple-500">{cliente.puntos_rewards} pts</span>
                      </div>
                      <Button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600">
                        <Gift className="w-4 h-4 mr-2" />
                        Otorgar Reward
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog Historial de Consumos */}
      <Dialog open={dialogHistorial} onOpenChange={setDialogHistorial}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              Historial de Consumos - {clienteHistorial?.nombre}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Últimos 50 consumos registrados
            </DialogDescription>
          </DialogHeader>

          {loadingHistorial ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-slate-400 mt-4">Cargando historial...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estadísticas Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-xs text-slate-400">Total Gastado</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    ${historialConsumos.reduce((sum, t) => sum + (t.total || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 border border-amber-500/30">
                  <p className="text-xs text-slate-400">Ticket Promedio</p>
                  <p className="text-2xl font-bold text-amber-500">
                    ${historialConsumos.length > 0 ? Math.round(historialConsumos.reduce((sum, t) => sum + (t.total || 0), 0) / historialConsumos.length).toLocaleString() : '0'}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 border border-purple-500/30">
                  <p className="text-xs text-slate-400">Total Visitas</p>
                  <p className="text-2xl font-bold text-purple-500">{historialConsumos.length}</p>
                </div>
              </div>

              {/* Lista de Consumos */}
              {historialConsumos.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">No hay consumos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300">Historial de Tickets</h3>
                  {historialConsumos.map((ticket, index) => (
                    <div key={ticket.id || index} className="glass rounded-lg p-4 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            Ticket #{ticket.id || index + 1}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(ticket.created_at).toLocaleDateString('es-MX', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-lg font-bold">
                          ${ticket.total?.toLocaleString() || '0'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        {ticket.mesa_numero && (
                          <div>
                            <p className="text-slate-500">Mesa</p>
                            <p className="text-slate-300 font-semibold">#{ticket.mesa_numero}</p>
                          </div>
                        )}
                        {ticket.rp_nombre && (
                          <div>
                            <p className="text-slate-500">RP</p>
                            <p className="text-slate-300 font-semibold">{ticket.rp_nombre}</p>
                          </div>
                        )}
                        {ticket.metodo_pago && (
                          <div>
                            <p className="text-slate-500">Pago</p>
                            <p className="text-slate-300 font-semibold capitalize">{ticket.metodo_pago}</p>
                          </div>
                        )}
                      </div>

                      {ticket.items && ticket.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-2">Items consumidos:</p>
                          <div className="space-y-1">
                            {ticket.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-slate-400">{item.cantidad}x {item.nombre}</span>
                                <span className="text-slate-300">${item.precio?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Botón Cerrar */}
              <Button
                onClick={() => setDialogHistorial(false)}
                className="w-full bg-slate-800 hover:bg-slate-700"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
