'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Crown, TrendingUp, Users, ShoppingCart, DollarSign, Gift, LogOut, AlertCircle, CheckCircle, Sparkles, Calendar, Clock, Utensils } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Socio {
  id: number
  nombre: string
  telefono: string
  limite_cortesias: number
  cortesias_usadas_hoy: number
}

interface Stats {
  ventas_hoy: number
  ventas_mes: number
  tickets_hoy: number
  clientes_hoy: number
  mesas_ocupadas: number
  total_mesas: number
  ticket_promedio_hoy: number
  cortesias_hoy: number
  reservaciones_hoy: number
  fevercoins_circulacion: number
}

interface Mesa {
  id: number
  numero: number
  estado: string
}

interface Cliente {
  id: string
  nombre: string
  telefono: string
}

interface Cortesia {
  id: number
  tipo_cortesia: string
  monto: number
  fecha_autorizacion: string
  canjeado: boolean
  mesa_numero: number
  cliente_nombre: string
}

export default function SociosDashboard() {
  const router = useRouter()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cortesias, setCortesias] = useState<Cortesia[]>([])
  
  // Dialog cortesía
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tipoCortesia, setTipoCortesia] = useState('')
  const [mesaId, setMesaId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [monto, setMonto] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [mensajeTipo, setMensajeTipo] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const socioData = sessionStorage.getItem('socio')
    if (!socioData) {
      router.push('/socios')
      return
    }
    
    const socioObj = JSON.parse(socioData)
    setSocio(socioObj)
    cargarDatos(socioObj.id)
    
    const interval = setInterval(() => cargarDatos(socioObj.id), 10000)
    return () => clearInterval(interval)
  }, [router])

  const cargarDatos = async (socioId: number) => {
    try {
      // Stats generales
      const { data: statsData } = await supabase
        .from('vista_stats_socios')
        .select('*')
        .single()
      
      if (statsData) setStats(statsData)

      // Actualizar cortesías usadas del socio
      const { data: socioData } = await supabase
        .from('socios')
        .select('cortesias_usadas_hoy, limite_cortesias')
        .eq('id', socioId)
        .single()
      
      if (socioData && socio) {
        setSocio({...socio, ...socioData})
      }

      // Mesas ocupadas
      const { data: mesasData } = await supabase
        .from('mesas')
        .select('*')
        .eq('estado', 'ocupada')
        .order('numero')
      
      if (mesasData) setMesas(mesasData)

      // Clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre')
      
      if (clientesData) setClientes(clientesData)

      // Cortesías del día
      const { data: cortesiasData } = await supabase
        .from('cortesias_socios')
        .select(`
          *,
          mesas(numero),
          clientes(nombre)
        `)
        .eq('socio_id', socioId)
        .gte('fecha_autorizacion', new Date().toISOString().split('T')[0])
        .order('fecha_autorizacion', { ascending: false })
      
      if (cortesiasData) {
        const cortesiasFormateadas = cortesiasData.map(c => ({
          id: c.id,
          tipo_cortesia: c.tipo_cortesia,
          monto: c.monto,
          fecha_autorizacion: c.fecha_autorizacion,
          canjeado: c.canjeado,
          mesa_numero: c.mesas?.numero || 0,
          cliente_nombre: c.clientes?.nombre || 'Sin cliente'
        }))
        setCortesias(cortesiasFormateadas)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const autorizarCortesia = async () => {
    if (!socio || !tipoCortesia || !mesaId || !clienteId || monto <= 0) {
      setMensaje('Por favor completa todos los campos')
      setMensajeTipo('error')
      return
    }

    const disponible = socio.limite_cortesias - socio.cortesias_usadas_hoy

    if (monto > disponible) {
      setMensaje(`Monto excede el límite disponible ($${disponible.toFixed(2)})`)
      setMensajeTipo('error')
      return
    }

    setLoading(true)
    setMensaje('')

    try {
      const { data, error } = await supabase.rpc('autorizar_cortesia_socio', {
        p_socio_id: socio.id,
        p_tipo_cortesia: tipoCortesia,
        p_mesa_id: parseInt(mesaId),
        p_cliente_id: clienteId,
        p_cantidad: cantidad,
        p_monto: monto
      })

      if (error) throw error

      if (data.success) {
        setMensaje('✅ Cortesía autorizada exitosamente')
        setMensajeTipo('success')
        
        // Limpiar formulario
        setTipoCortesia('')
        setMesaId('')
        setClienteId('')
        setCantidad(1)
        setMonto(0)
        
        // Recargar datos
        await cargarDatos(socio.id)
        
        setTimeout(() => {
          setDialogOpen(false)
          setMensaje('')
        }, 2000)
      } else {
        setMensaje(data.message)
        setMensajeTipo('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setMensaje('Error al autorizar cortesía')
      setMensajeTipo('error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('socio')
    router.push('/socios')
  }

  if (!socio || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  const disponible = socio.limite_cortesias - socio.cortesias_usadas_hoy
  const porcentajeUsado = (socio.cortesias_usadas_hoy / socio.limite_cortesias) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {socio.nombre}
              </h1>
              <p className="text-purple-200 text-sm">Panel de Socio Premium</p>
            </div>
          </div>
          <div className="flex gap-3">
            {(socio.nombre === 'Socio Principal' || socio.telefono === '5550000001') && (
              <Button
                onClick={() => router.push('/dashboard/socios/ashton')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
              >
                <Utensils className="w-4 h-4 mr-2" />
                Ashton - Pedidos
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-purple-400/30 text-purple-100 hover:bg-purple-800/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Cortesías Disponibles */}
        <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Cortesías Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-purple-300 text-sm">Límite Diario</p>
                <p className="text-2xl font-bold text-white">${socio.limite_cortesias.toFixed(2)}</p>
              </div>
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-purple-300 text-sm">Usado Hoy</p>
                <p className="text-2xl font-bold text-red-400">${socio.cortesias_usadas_hoy.toFixed(2)}</p>
              </div>
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-purple-300 text-sm">Disponible</p>
                <p className="text-2xl font-bold text-green-400">${disponible.toFixed(2)}</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">Uso del día</span>
                <span className="text-purple-200">{porcentajeUsado.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-purple-950/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    porcentajeUsado > 80 ? 'bg-red-500' :
                    porcentajeUsado > 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                />
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Autorizar Cortesía
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-purple-950 to-pink-950 border-purple-500/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Nueva Cortesía Premium</DialogTitle>
                  <DialogDescription className="text-purple-200">
                    Disponible: ${disponible.toFixed(2)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-purple-100">Tipo de Cortesía</Label>
                    <Select value={tipoCortesia} onValueChange={setTipoCortesia}>
                      <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-950 border-purple-500/30">
                        <SelectItem value="Botella Premium">🍾 Botella Premium</SelectItem>
                        <SelectItem value="Descuento Especial">💰 Descuento Especial</SelectItem>
                        <SelectItem value="Shots Premium">🥃 Shots Premium</SelectItem>
                        <SelectItem value="Entrada VIP">🎫 Entrada VIP</SelectItem>
                        <SelectItem value="Mesa VIP">👑 Mesa VIP</SelectItem>
                        <SelectItem value="Otro">🎁 Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-100">Mesa</Label>
                    <Select value={mesaId} onValueChange={setMesaId}>
                      <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Selecciona mesa..." />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-950 border-purple-500/30">
                        {mesas.map(mesa => (
                          <SelectItem key={mesa.id} value={mesa.id.toString()}>
                            Mesa {mesa.numero}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-100">Cliente</Label>
                    <Select value={clienteId} onValueChange={setClienteId}>
                      <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Selecciona cliente..." />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-950 border-purple-500/30">
                        {clientes.map(cliente => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nombre} - {cliente.telefono}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-100">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="bg-purple-950/50 border-purple-500/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-100">Monto ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={monto}
                        onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                        className="bg-purple-950/50 border-purple-500/30 text-white"
                      />
                    </div>
                  </div>

                  {mensaje && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      mensajeTipo === 'success' 
                        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                        : 'bg-red-500/10 border border-red-500/30 text-red-300'
                    }`}>
                      {mensajeTipo === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="text-sm">{mensaje}</span>
                    </div>
                  )}

                  <Button
                    onClick={autorizarCortesia}
                    disabled={loading || !tipoCortesia || !mesaId || !clienteId || monto <= 0}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    {loading ? 'Autorizando...' : 'Autorizar Cortesía'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Estadísticas del Negocio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-500/30 bg-black/40 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Ventas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                ${stats.ventas_hoy.toLocaleString()}
              </p>
              <p className="text-xs text-green-200 mt-1">
                Ticket promedio: ${stats.ticket_promedio_hoy.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-black/40 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Ventas del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                ${stats.ventas_mes.toLocaleString()}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                {stats.tickets_hoy} tickets hoy
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {stats.clientes_hoy}
              </p>
              <p className="text-xs text-purple-200 mt-1">
                {stats.reservaciones_hoy} reservaciones
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-black/40 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Mesas Ocupadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {stats.mesas_ocupadas}/{stats.total_mesas}
              </p>
              <p className="text-xs text-orange-200 mt-1">
                {((stats.mesas_ocupadas / stats.total_mesas) * 100).toFixed(0)}% ocupación
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Cortesías */}
        <Card className="border-purple-500/30 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Historial de Cortesías del Día
            </CardTitle>
            <CardDescription className="text-purple-200">
              Total autorizado hoy: ${socio.cortesias_usadas_hoy.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cortesias.length === 0 ? (
              <div className="text-center py-8 text-purple-300">
                No hay cortesías autorizadas hoy
              </div>
            ) : (
              <div className="space-y-3">
                {cortesias.map(cortesia => (
                  <div
                    key={cortesia.id}
                    className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{cortesia.tipo_cortesia}</p>
                        <p className="text-sm text-purple-300">
                          Mesa {cortesia.mesa_numero} • {cortesia.cliente_nombre}
                        </p>
                        <p className="text-xs text-purple-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(cortesia.fecha_autorizacion).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xl font-bold text-yellow-400">
                          ${cortesia.monto.toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          cortesia.canjeado
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {cortesia.canjeado ? '✓ Canjeado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
