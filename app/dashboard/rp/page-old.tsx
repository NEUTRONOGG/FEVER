"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Sparkles, Users, Gift, CheckCircle2,
  Wine, Droplet, Award, AlertCircle, History
} from "lucide-react"
import { 
  obtenerMesasRP, 
  obtenerLimitesRP,
  autorizarCortesia,
  obtenerCortesiasRP
} from "@/lib/supabase-clientes"

export default function RPPage() {
  const [mesas, setMesas] = useState<any[]>([])
  const [limites, setLimites] = useState<any>(null)
  const [cortesias, setCortesias] = useState<any[]>([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState<any | null>(null)
  const [dialogCortesia, setDialogCortesia] = useState(false)
  const [dialogHistorial, setDialogHistorial] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [rpNombre] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("userName") || "RP"
    }
    return "RP"
  })

  const [cortesiaForm, setCortesiaForm] = useState({
    tipo: "shots",
    cantidad: 1,
    notas: ""
  })

  const [rpName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("userName") || "RP"
    }
    return "RP"
  })

  useEffect(() => {
    cargarMesas()
    const interval = setInterval(cargarMesas, 5000)
    return () => clearInterval(interval)
  }, [])

  async function cargarMesas() {
    const mesasData = await obtenerMesas()
    const mesasOcupadas = mesasData.filter(m => m.estado === 'ocupada' && m.cliente_nombre)
    setMesas(mesasOcupadas)
  }

  const handleRegistrarCliente = async () => {
    try {
      const edad = parseInt(nuevoCliente.edad) || 0
      await crearCliente({
        nombre: nuevoCliente.nombre,
        apellido: nuevoCliente.apellido,
        telefono: nuevoCliente.telefono,
        email: nuevoCliente.email,
        genero: nuevoCliente.genero as any,
        fecha_nacimiento: edad > 0 ? new Date(new Date().getFullYear() - edad, 0, 1).toISOString() : undefined,
        notas: `Cliente potencial registrado por RP ${rpName}. ${nuevoCliente.notas}`
      })

      alert('✅ Cliente potencial registrado en el CRM')
      setDialogCliente(false)
      setNuevoCliente({
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        edad: "",
        genero: "",
        notas: ""
      })
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al registrar cliente')
    }
  }

  const handleOtorgarBeneficio = async () => {
    if (!mesaSeleccionada) return

    try {
      await crearReward({
        cliente_id: mesaSeleccionada.cliente_id,
        tipo: beneficio.tipo === 'shots' ? 'producto_gratis' : 'descuento',
        descripcion: beneficio.descripcion || `${beneficio.cantidad} ${beneficio.tipo} cortesía de RP`,
        puntos: 0,
        valor_descuento: beneficio.tipo === 'descuento' ? parseFloat(beneficio.cantidad.toString()) : 0,
        activo: true,
        usado: false
      })

      alert(`✅ Beneficio otorgado a ${mesaSeleccionada.cliente_nombre}`)
      setDialogBeneficio(false)
      setBeneficio({
        tipo: "shots",
        descripcion: "",
        cantidad: 1
      })
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al otorgar beneficio')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Panel Relaciones Públicas</h1>
          <p className="text-slate-400 mt-1">Bienvenido, {rpName}</p>
        </div>
        <Button
          onClick={() => setDialogCliente(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Registrar Cliente Potencial
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mesas Activas</p>
                <p className="text-3xl font-bold text-purple-500">{mesas.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Consumo Total</p>
                <p className="text-3xl font-bold text-emerald-500">
                  ${mesas.reduce((sum, m) => sum + (m.total_actual || 0), 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ticket Promedio</p>
                <p className="text-3xl font-bold text-amber-500">
                  ${mesas.length > 0 ? (mesas.reduce((sum, m) => sum + (m.total_actual || 0), 0) / mesas.length).toFixed(0) : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Clientes VIP</p>
                <p className="text-3xl font-bold text-pink-500">
                  {mesas.filter(m => (m.total_actual || 0) > 500).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesas */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-slate-50">Mesas en Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mesas.map((mesa) => (
              <div
                key={mesa.id}
                onClick={() => setMesaSeleccionada(mesa)}
                className="glass rounded-xl p-4 cursor-pointer hover:bg-purple-500/10 border border-slate-700 hover:border-purple-500 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className="bg-purple-500/20 text-purple-500 mb-2">
                      Mesa {mesa.numero}
                    </Badge>
                    <p className="font-semibold text-slate-200">{mesa.cliente_nombre}</p>
                    <p className="text-xs text-slate-400">
                      {mesa.numero_personas} personas • {mesa.hostess}
                    </p>
                  </div>
                  {(mesa.total_actual || 0) > 500 && (
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  )}
                </div>

                <Separator className="my-3 bg-slate-700" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Consumo:</span>
                    <span className="text-lg font-bold text-emerald-500">
                      ${(mesa.total_actual || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Items:</span>
                    <span className="text-sm font-semibold text-slate-300">
                      {(mesa.pedidos_data || []).length}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMesaSeleccionada(mesa)
                    setDialogBeneficio(true)
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                  size="sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Otorgar Beneficio
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Registrar Cliente */}
      <Dialog open={dialogCliente} onOpenChange={setDialogCliente}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-purple-500" />
              Registrar Cliente Potencial
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nombre *</Label>
                <Input
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Juan"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Apellido</Label>
                <Input
                  value={nuevoCliente.apellido}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, apellido: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={nuevoCliente.telefono}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                    className="pl-10 bg-slate-800/50 border-slate-700"
                    placeholder="+52 555 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    value={nuevoCliente.email}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                    className="pl-10 bg-slate-800/50 border-slate-700"
                    placeholder="juan@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Edad</Label>
                <Input
                  type="number"
                  value={nuevoCliente.edad}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, edad: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="28"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Género</Label>
                <Select
                  value={nuevoCliente.genero}
                  onValueChange={(value) => setNuevoCliente({...nuevoCliente, genero: value})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-slate-300">Notas / Intereses</Label>
                <Textarea
                  value={nuevoCliente.notas}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, notas: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Cliente interesado en eventos VIP, prefiere whisky..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogCliente(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegistrarCliente}
                disabled={!nuevoCliente.nombre || !nuevoCliente.telefono}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrar en CRM
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Otorgar Beneficio */}
      <Dialog open={dialogBeneficio} onOpenChange={setDialogBeneficio}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-500" />
              Otorgar Beneficio
            </DialogTitle>
          </DialogHeader>

          {mesaSeleccionada && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-slate-400">Mesa</p>
                <p className="text-lg font-semibold text-slate-50">Mesa {mesaSeleccionada.numero}</p>
                <p className="text-sm text-slate-400 mt-1">{mesaSeleccionada.cliente_nombre}</p>
                <p className="text-sm text-emerald-500 mt-1">
                  Consumo: ${(mesaSeleccionada.total_actual || 0).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Beneficio</Label>
                <Select
                  value={beneficio.tipo}
                  onValueChange={(value) => setBeneficio({...beneficio, tipo: value})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="shots">Shots Cortesía</SelectItem>
                    <SelectItem value="bebida">Bebida Gratis</SelectItem>
                    <SelectItem value="descuento">Descuento %</SelectItem>
                    <SelectItem value="botella">Botella Cortesía</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">
                  {beneficio.tipo === 'descuento' ? 'Porcentaje' : 'Cantidad'}
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={beneficio.cantidad}
                  onChange={(e) => setBeneficio({...beneficio, cantidad: parseInt(e.target.value) || 1})}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Descripción (Opcional)</Label>
                <Textarea
                  value={beneficio.descripcion}
                  onChange={(e) => setBeneficio({...beneficio, descripcion: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Cortesía por..."
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogBeneficio(false)}
                  className="flex-1 border-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleOtorgarBeneficio}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Otorgar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
