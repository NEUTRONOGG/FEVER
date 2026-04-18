"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, Shield, Flame, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Alerta {
  id: string
  tipo: 'emergencia' | 'pelea_interna' | 'pelea_externa' | 'fiscalizacion' | 'capacidad' | 'info'
  mensaje: string
  hora: string
  resuelta: boolean
  reportado_por?: string
  leida?: boolean
}

export default function NotificacionesEmergencia() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [permisoNotificaciones, setPermisoNotificaciones] = useState<NotificationPermission>('default')
  const [alertasNoLeidas, setAlertasNoLeidas] = useState(0)

  useEffect(() => {
    // Verificar permiso de notificaciones
    if ('Notification' in window) {
      setPermisoNotificaciones(Notification.permission)
    }

    // Cargar alertas del localStorage
    cargarAlertas()

    // Actualizar cada 3 segundos
    const interval = setInterval(cargarAlertas, 3000)
    return () => clearInterval(interval)
  }, [])

  const cargarAlertas = () => {
    const alertasGuardadas = localStorage.getItem("alertas")
    if (alertasGuardadas) {
      const alertas: Alerta[] = JSON.parse(alertasGuardadas)
      setAlertas(alertas)
      
      // Contar alertas no leídas y no resueltas
      const noLeidas = alertas.filter(a => !a.leida && !a.resuelta).length
      setAlertasNoLeidas(noLeidas)
      
      // Enviar notificación si hay alertas nuevas no leídas
      alertas.forEach(alerta => {
        if (!alerta.leida && !alerta.resuelta && permisoNotificaciones === 'granted') {
          enviarNotificacion(alerta)
          // Marcar como leída después de notificar
          marcarComoLeida(alerta.id)
        }
      })
    }
  }

  const solicitarPermisoNotificaciones = async () => {
    if ('Notification' in window) {
      const permiso = await Notification.requestPermission()
      setPermisoNotificaciones(permiso)
      
      if (permiso === 'granted') {
        // Enviar notificación de prueba
        new Notification('🔔 Notificaciones Activadas', {
          body: 'Recibirás alertas de emergencias en tiempo real',
          icon: '/placeholder-logo.png',
          badge: '/placeholder-logo.png',
          tag: 'test-notification'
        })
      }
    }
  }

  const enviarNotificacion = (alerta: Alerta) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const iconos = {
        emergencia: '🚨',
        pelea_interna: '⚠️',
        pelea_externa: '🥊',
        fiscalizacion: '👮',
        capacidad: '📊',
        info: 'ℹ️'
      }

      const titulo = `${iconos[alerta.tipo]} ${alerta.tipo.toUpperCase().replace('_', ' ')}`
      
      const notification = new Notification(titulo, {
        body: `${alerta.mensaje}\n${alerta.hora}${alerta.reportado_por ? ` - ${alerta.reportado_por}` : ''}`,
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.png',
        tag: alerta.id,
        requireInteraction: true, // Mantener hasta que el usuario la cierre
      })

      // Al hacer clic en la notificación, abrir el dialog
      notification.onclick = () => {
        window.focus()
        setDialogAbierto(true)
        notification.close()
      }
    }
  }

  const marcarComoLeida = (alertaId: string) => {
    const alertasGuardadas = localStorage.getItem("alertas")
    if (alertasGuardadas) {
      const alertas: Alerta[] = JSON.parse(alertasGuardadas)
      const alertasActualizadas = alertas.map(a => 
        a.id === alertaId ? { ...a, leida: true } : a
      )
      localStorage.setItem("alertas", JSON.stringify(alertasActualizadas))
      setAlertas(alertasActualizadas)
    }
  }

  const marcarTodasComoLeidas = () => {
    const alertasGuardadas = localStorage.getItem("alertas")
    if (alertasGuardadas) {
      const alertas: Alerta[] = JSON.parse(alertasGuardadas)
      const alertasActualizadas = alertas.map(a => ({ ...a, leida: true }))
      localStorage.setItem("alertas", JSON.stringify(alertasActualizadas))
      setAlertas(alertasActualizadas)
      setAlertasNoLeidas(0)
    }
  }

  const resolverAlerta = (alertaId: string) => {
    const alertasGuardadas = localStorage.getItem("alertas")
    if (alertasGuardadas) {
      const alertas: Alerta[] = JSON.parse(alertasGuardadas)
      const alertasActualizadas = alertas.map(a => 
        a.id === alertaId ? { ...a, resuelta: true, leida: true } : a
      )
      localStorage.setItem("alertas", JSON.stringify(alertasActualizadas))
      setAlertas(alertasActualizadas)
      cargarAlertas()
    }
  }

  const getIconoTipo = (tipo: string) => {
    switch(tipo) {
      case 'emergencia': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'pelea_interna': return <Flame className="w-5 h-5 text-orange-500" />
      case 'pelea_externa': return <Flame className="w-5 h-5 text-red-600" />
      case 'fiscalizacion': return <Shield className="w-5 h-5 text-blue-500" />
      case 'capacidad': return <FileText className="w-5 h-5 text-amber-500" />
      default: return <AlertTriangle className="w-5 h-5 text-slate-500" />
    }
  }

  const getColorTipo = (tipo: string) => {
    switch(tipo) {
      case 'emergencia': return 'border-red-500/50 bg-red-500/10'
      case 'pelea_interna': return 'border-orange-500/50 bg-orange-500/10'
      case 'pelea_externa': return 'border-red-600/50 bg-red-600/10'
      case 'fiscalizacion': return 'border-blue-500/50 bg-blue-500/10'
      case 'capacidad': return 'border-amber-500/50 bg-amber-500/10'
      default: return 'border-slate-500/50 bg-slate-500/10'
    }
  }

  const alertasActivas = alertas.filter(a => !a.resuelta)

  return (
    <>
      {/* Botón de Campana */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDialogAbierto(true)}
          className={`relative border-slate-700 ${alertasNoLeidas > 0 ? 'animate-pulse' : ''}`}
        >
          <Bell className={`w-5 h-5 ${alertasNoLeidas > 0 ? 'text-red-500' : 'text-slate-400'}`} />
          {alertasNoLeidas > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5">
              {alertasNoLeidas}
            </Badge>
          )}
        </Button>
      </div>

      {/* Dialog de Alertas */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-500" />
              Alertas y Emergencias
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Solicitar Permisos */}
            {permisoNotificaciones !== 'granted' && (
              <div className="glass rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Bell className="w-6 h-6 text-amber-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-slate-50 font-semibold mb-1">
                      Activa las Notificaciones
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Recibe alertas instantáneas de emergencias en tu dispositivo, incluso cuando no estés viendo la página.
                    </p>
                    <Button
                      onClick={solicitarPermisoNotificaciones}
                      className="bg-gradient-to-r from-amber-600 to-orange-600"
                    >
                      🔔 Activar Notificaciones
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Botón Marcar Todas como Leídas */}
            {alertasNoLeidas > 0 && (
              <Button
                onClick={marcarTodasComoLeidas}
                variant="outline"
                className="w-full border-slate-700"
              >
                Marcar todas como leídas
              </Button>
            )}

            {/* Lista de Alertas */}
            {alertasActivas.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No hay alertas activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertasActivas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`glass rounded-xl p-4 border ${getColorTipo(alerta.tipo)} ${!alerta.leida ? 'ring-2 ring-amber-500/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {getIconoTipo(alerta.tipo)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-800 text-slate-300 text-xs">
                            {alerta.tipo.toUpperCase().replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">{alerta.hora}</span>
                          {!alerta.leida && (
                            <Badge className="bg-amber-500 text-white text-xs">
                              NUEVO
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-200 font-medium mb-1">
                          {alerta.mensaje}
                        </p>
                        {alerta.reportado_por && (
                          <p className="text-xs text-slate-400">
                            Reportado por: {alerta.reportado_por}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => resolverAlerta(alerta.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
