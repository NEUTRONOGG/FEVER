"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  Shield, AlertTriangle, Users, TrendingUp,
  UserPlus, UserMinus, Clock, Bell,
  AlertCircle, CheckCircle2, Activity, LayoutGrid, QrCode
} from "lucide-react"
import QRScanner from "@/components/QRScanner"

interface RegistroFlujo {
  id: string
  tipo: 'entrada' | 'salida'
  cantidad: number
  hora: string
  nota?: string
}

interface Alerta {
  id: string
  tipo: 'emergencia' | 'pelea_interna' | 'pelea_externa' | 'fiscalizacion' | 'capacidad' | 'info'
  mensaje: string
  hora: string
  resuelta: boolean
  reportado_por?: string
}

export default function CadenaPage() {
  const [personasDentro, setPersonasDentro] = useState(0)
  const [capacidadMaxima] = useState(200)
  const [registrosFlujo, setRegistrosFlujo] = useState<RegistroFlujo[]>([])
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [dialogEntrada, setDialogEntrada] = useState(false)
  const [dialogSalida, setDialogSalida] = useState(false)
  const [dialogEmergencia, setDialogEmergencia] = useState(false)
  const [mostrarQRScanner, setMostrarQRScanner] = useState(false)
  const [cantidadEntrada, setCantidadEntrada] = useState(0)
  const [cantidadSalida, setCantidadSalida] = useState(0)
  const [notaEmergencia, setNotaEmergencia] = useState("")
  const [tipoEmergencia, setTipoEmergencia] = useState<'emergencia' | 'pelea_interna' | 'pelea_externa' | 'fiscalizacion'>('fiscalizacion')

  const [cadenaName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("userName") || "Cadena"
    }
    return "Cadena"
  })

  useEffect(() => {
    // Cargar datos del localStorage
    const personas = localStorage.getItem("personasDentro")
    if (personas) setPersonasDentro(parseInt(personas))

    const registros = localStorage.getItem("registrosFlujo")
    if (registros) setRegistrosFlujo(JSON.parse(registros))

    const alertasGuardadas = localStorage.getItem("alertas")
    if (alertasGuardadas) setAlertas(JSON.parse(alertasGuardadas))
  }, [])

  const guardarDatos = (personas: number, registros: RegistroFlujo[], alertasNuevas: Alerta[]) => {
    localStorage.setItem("personasDentro", personas.toString())
    localStorage.setItem("registrosFlujo", JSON.stringify(registros))
    localStorage.setItem("alertas", JSON.stringify(alertasNuevas))
  }

  const handleRegistrarEntrada = () => {
    const nuevasPersonas = personasDentro + cantidadEntrada
    const nuevoRegistro: RegistroFlujo = {
      id: Date.now().toString(),
      tipo: 'entrada',
      cantidad: cantidadEntrada,
      hora: new Date().toLocaleTimeString('es-MX')
    }

    const nuevosRegistros = [nuevoRegistro, ...registrosFlujo].slice(0, 50)
    setPersonasDentro(nuevasPersonas)
    setRegistrosFlujo(nuevosRegistros)

    // Verificar capacidad
    if (nuevasPersonas >= capacidadMaxima * 0.9) {
      const nuevaAlerta: Alerta = {
        id: Date.now().toString(),
        tipo: 'capacidad',
        mensaje: `⚠️ Capacidad al ${Math.round((nuevasPersonas / capacidadMaxima) * 100)}%`,
        hora: new Date().toLocaleTimeString('es-MX'),
        resuelta: false
      }
      const nuevasAlertas = [nuevaAlerta, ...alertas]
      setAlertas(nuevasAlertas)
      guardarDatos(nuevasPersonas, nuevosRegistros, nuevasAlertas)
    } else {
      guardarDatos(nuevasPersonas, nuevosRegistros, alertas)
    }

    setDialogEntrada(false)
    setCantidadEntrada(1)
  }

  const handleRegistrarSalida = () => {
    const nuevasPersonas = Math.max(0, personasDentro - cantidadSalida)
    const nuevoRegistro: RegistroFlujo = {
      id: Date.now().toString(),
      tipo: 'salida',
      cantidad: cantidadSalida,
      hora: new Date().toLocaleTimeString('es-MX')
    }

    const nuevosRegistros = [nuevoRegistro, ...registrosFlujo].slice(0, 50)
    setPersonasDentro(nuevasPersonas)
    setRegistrosFlujo(nuevosRegistros)
    guardarDatos(nuevasPersonas, nuevosRegistros, alertas)

    setDialogSalida(false)
    setCantidadSalida(1)
  }

  const handleQRScan = async (qrData: string) => {
    try {
      setMostrarQRScanner(false)
      
      // El QR contiene el teléfono del cliente
      const { supabase } = await import('@/lib/supabase')
      const { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('telefono', qrData)
        .single()

      if (cliente) {
        // Registrar entrada automática
        const nuevasPersonas = personasDentro + 1
        const nuevoRegistro: RegistroFlujo = {
          id: Date.now().toString(),
          tipo: 'entrada',
          cantidad: 1,
          hora: new Date().toLocaleTimeString('es-MX'),
          nota: `Cliente: ${cliente.nombre}`
        }

        const nuevosRegistros = [nuevoRegistro, ...registrosFlujo].slice(0, 50)
        setPersonasDentro(nuevasPersonas)
        setRegistrosFlujo(nuevosRegistros)
        guardarDatos(nuevasPersonas, nuevosRegistros, alertas)

        alert(`✅ Entrada registrada: ${cliente.nombre}`)
      } else {
        alert('Cliente no encontrado')
      }
    } catch (error) {
      console.error('Error al escanear QR:', error)
      alert('Error al procesar el QR')
    }
  }

  const handleEmergencia = async () => {
    const mensajesPorTipo = {
      'pelea_interna': '🚨 PELEA INTERNA REPORTADA',
      'pelea_externa': '🚨 PELEA EXTERNA REPORTADA',
      'fiscalizacion': '👮 FISCALIZACIÓN EN CURSO',
      'emergencia': '🚨 EMERGENCIA GENERAL'
    }

    const nuevaAlerta: Alerta = {
      id: Date.now().toString(),
      tipo: tipoEmergencia,
      mensaje: notaEmergencia || mensajesPorTipo[tipoEmergencia],
      hora: new Date().toLocaleTimeString('es-MX'),
      resuelta: false,
      reportado_por: cadenaName
    }

    const nuevasAlertas = [nuevaAlerta, ...alertas]
    setAlertas(nuevasAlertas)
    guardarDatos(personasDentro, registrosFlujo, nuevasAlertas)

    // Guardar en Supabase para notificación en tiempo real
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('emergencias').insert({
        tipo: tipoEmergencia,
        mensaje: nuevaAlerta.mensaje,
        reportado_por: cadenaName,
        ubicacion: 'Entrada Principal',
        activa: true
      })
    } catch (error) {
      console.error('Error guardando emergencia:', error)
    }

    setDialogEmergencia(false)
    setNotaEmergencia("")
    
    // Notificación sonora
    alert(`🚨 ${mensajesPorTipo[tipoEmergencia]} - Todo el equipo ha sido notificado`)
  }

  const handleResolverAlerta = (id: string) => {
    const nuevasAlertas = alertas.map(a => 
      a.id === id ? { ...a, resuelta: true } : a
    )
    setAlertas(nuevasAlertas)
    guardarDatos(personasDentro, registrosFlujo, nuevasAlertas)
  }

  const porcentajeCapacidad = (personasDentro / capacidadMaxima) * 100
  const alertasActivas = alertas.filter(a => !a.resuelta)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Panel Cadena</h1>
          <p className="text-slate-400 mt-1">Control de Acceso y Seguridad - {cadenaName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.location.href = '/dashboard/selector-rol'}
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Menú Staff
          </Button>
          <NotificacionesEmergencia />
          {alertasActivas.length > 0 && (
            <Badge className="bg-red-500/20 text-red-500 text-lg px-4 py-2 animate-pulse">
              <Bell className="w-4 h-4 mr-2" />
              {alertasActivas.length} Alerta{alertasActivas.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Personas Dentro</p>
                <p className="text-4xl font-bold text-blue-500">{personasDentro}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Capacidad</p>
                <p className="text-4xl font-bold text-amber-500">{porcentajeCapacidad.toFixed(0)}%</p>
              </div>
              <Activity className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Disponible</p>
                <p className="text-4xl font-bold text-emerald-500">{capacidadMaxima - personasDentro}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Alertas Activas</p>
                <p className="text-4xl font-bold text-red-500">{alertasActivas.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Capacidad */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Capacidad del Local</span>
              <span className="text-sm font-semibold text-slate-200">
                {personasDentro} / {capacidadMaxima}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-6 rounded-full transition-all duration-500 ${
                  porcentajeCapacidad >= 90 ? 'bg-red-500' :
                  porcentajeCapacidad >= 75 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(porcentajeCapacidad, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button
          onClick={() => setMostrarQRScanner(true)}
          className="h-24 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <div className="flex flex-col items-center gap-2">
            <QrCode className="w-8 h-8" />
            <span className="text-lg font-semibold">Escanear QR</span>
          </div>
        </Button>

        <Button
          onClick={() => setDialogEntrada(true)}
          className="h-24 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
        >
          <div className="flex flex-col items-center gap-2">
            <UserPlus className="w-8 h-8" />
            <span className="text-lg font-semibold">Registrar Entrada</span>
          </div>
        </Button>

        <Button
          onClick={() => setDialogSalida(true)}
          className="h-24 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <div className="flex flex-col items-center gap-2">
            <UserMinus className="w-8 h-8" />
            <span className="text-lg font-semibold">Registrar Salida</span>
          </div>
        </Button>

        <Button
          onClick={() => setDialogEmergencia(true)}
          className="h-24 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
        >
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-lg font-semibold">Botón de Emergencia</span>
          </div>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alertas */}
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas y Emergencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {alertas.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-400">No hay alertas</p>
                </div>
              ) : (
                alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-xl border-2 ${
                      alerta.resuelta
                        ? 'glass border-slate-700'
                        : alerta.tipo === 'emergencia' || alerta.tipo === 'pelea_interna' || alerta.tipo === 'pelea_externa'
                        ? 'bg-red-500/10 border-red-500'
                        : 'bg-amber-500/10 border-amber-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {alerta.tipo === 'emergencia' || alerta.tipo === 'pelea_interna' || alerta.tipo === 'pelea_externa' ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : alerta.tipo === 'fiscalizacion' ? (
                            <Shield className="w-5 h-5 text-amber-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                          <Badge className={
                            alerta.resuelta
                              ? 'bg-slate-700 text-slate-300'
                              : alerta.tipo === 'emergencia' || alerta.tipo === 'pelea_interna' || alerta.tipo === 'pelea_externa'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-amber-500/20 text-amber-500'
                          }>
                            {alerta.tipo.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-400">{alerta.hora}</span>
                        </div>
                        <p className={`font-semibold ${
                          alerta.resuelta ? 'text-slate-400' : 'text-slate-200'
                        }`}>
                          {alerta.mensaje}
                        </p>
                      </div>
                      {!alerta.resuelta && (
                        <Button
                          size="sm"
                          onClick={() => handleResolverAlerta(alerta.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Registro de Flujo */}
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Registro de Flujo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {registrosFlujo.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">No hay registros</p>
                </div>
              ) : (
                registrosFlujo.map((registro) => (
                  <div
                    key={registro.id}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {registro.tipo === 'entrada' ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <UserMinus className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-200">
                          {registro.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </p>
                        <p className="text-sm text-slate-400">{registro.hora}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-50">{registro.cantidad}</p>
                      <p className="text-xs text-slate-400">persona{registro.cantidad > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Entrada */}
      <Dialog open={dialogEntrada} onOpenChange={setDialogEntrada}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-emerald-500" />
              Registrar Entrada
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Cantidad de Personas</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setCantidadEntrada(Math.max(0, cantidadEntrada - 1))}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-2xl px-6"
                >
                  -
                </Button>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cantidadEntrada === 0 ? '' : cantidadEntrada}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, '')
                    if (input === '') {
                      setCantidadEntrada(0)
                    } else {
                      const val = parseInt(input)
                      setCantidadEntrada(Math.min(capacidadMaxima - personasDentro, Math.max(1, val)))
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="bg-slate-800/50 border-slate-700 text-3xl text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setCantidadEntrada(Math.min(capacidadMaxima - personasDentro, cantidadEntrada === 0 ? 1 : cantidadEntrada + 1))}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-2xl px-6"
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Capacidad disponible: {capacidadMaxima - personasDentro} personas
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogEntrada(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegistrarEntrada}
                disabled={cantidadEntrada === 0}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Salida */}
      <Dialog open={dialogSalida} onOpenChange={setDialogSalida}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <UserMinus className="w-6 h-6 text-blue-500" />
              Registrar Salida
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Cantidad de Personas</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setCantidadSalida(Math.max(0, cantidadSalida - 1))}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-2xl px-6"
                >
                  -
                </Button>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cantidadSalida === 0 ? '' : cantidadSalida}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, '')
                    if (input === '') {
                      setCantidadSalida(0)
                    } else {
                      const val = parseInt(input)
                      setCantidadSalida(Math.min(personasDentro, Math.max(1, val)))
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="bg-slate-800/50 border-slate-700 text-3xl text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setCantidadSalida(Math.min(personasDentro, cantidadSalida === 0 ? 1 : cantidadSalida + 1))}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-2xl px-6"
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Personas adentro: {personasDentro}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogSalida(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegistrarSalida}
                disabled={cantidadSalida === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Emergencia */}
      <Dialog open={dialogEmergencia} onOpenChange={setDialogEmergencia}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Reportar Emergencia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Tipo de Emergencia</Label>
              <div className="space-y-3">
                {/* Fiscalización - Opción principal más grande */}
                <Button
                  variant={tipoEmergencia === 'fiscalizacion' ? 'default' : 'outline'}
                  onClick={() => setTipoEmergencia('fiscalizacion')}
                  className={`w-full h-20 text-xl font-bold ${tipoEmergencia === 'fiscalizacion' ? 'bg-amber-600 hover:bg-amber-700' : 'border-slate-700 hover:bg-amber-600/10'}`}
                >
                  👮 FISCALIZACIÓN
                </Button>
                
                {/* Otras opciones en grid */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={tipoEmergencia === 'pelea_interna' ? 'default' : 'outline'}
                    onClick={() => setTipoEmergencia('pelea_interna')}
                    className={tipoEmergencia === 'pelea_interna' ? 'bg-red-600' : 'border-slate-700'}
                  >
                    🥊 Pelea Interna
                  </Button>
                  <Button
                    variant={tipoEmergencia === 'pelea_externa' ? 'default' : 'outline'}
                    onClick={() => setTipoEmergencia('pelea_externa')}
                    className={tipoEmergencia === 'pelea_externa' ? 'bg-red-600' : 'border-slate-700'}
                  >
                    🚨 Pelea Externa
                  </Button>
                  <Button
                    variant={tipoEmergencia === 'emergencia' ? 'default' : 'outline'}
                    onClick={() => setTipoEmergencia('emergencia')}
                    className={tipoEmergencia === 'emergencia' ? 'bg-red-600' : 'border-slate-700'}
                  >
                    ⚠️ Emergencia
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Detalles (Opcional)</Label>
              <Textarea
                value={notaEmergencia}
                onChange={(e) => setNotaEmergencia(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
                placeholder="Describe la situación..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogEmergencia(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEmergencia}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 animate-pulse"
              >
                🚨 ACTIVAR EMERGENCIA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner */}
      {mostrarQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setMostrarQRScanner(false)}
        />
      )}
    </div>
  )
}
