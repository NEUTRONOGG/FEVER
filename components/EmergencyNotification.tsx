"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Emergencia {
  id: string
  tipo: 'emergencia' | 'pelea_interna' | 'pelea_externa' | 'fiscalizacion'
  mensaje: string
  reportado_por: string
  ubicacion: string
  activa: boolean
  created_at: string
}

export default function EmergencyNotification() {
  const [emergencia, setEmergencia] = useState<Emergencia | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let channel: any = null

    const setupRealtimeSubscription = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        
        // Suscribirse a cambios en la tabla emergencias
        channel = supabase
          .channel('emergencias-channel')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'emergencias',
              filter: 'activa=eq.true'
            },
            (payload: any) => {
              console.log('🚨 Nueva emergencia recibida:', payload.new)
              setEmergencia(payload.new)
              setVisible(true)
              
              // Reproducir sonido de alerta
              try {
                const audio = new Audio('/sounds/alert.mp3')
                audio.play().catch(e => console.log('No se pudo reproducir el sonido'))
              } catch (e) {
                console.log('Error con el audio')
              }
            }
          )
          .subscribe()

        console.log('✅ Suscripción a emergencias activada')
      } catch (error) {
        console.error('Error configurando suscripción:', error)
      }
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  const handleCerrar = async () => {
    if (emergencia) {
      try {
        const { supabase } = await import('@/lib/supabase')
        // Marcar como vista por el usuario
        await supabase
          .from('emergencias')
          .update({ activa: false })
          .eq('id', emergencia.id)
      } catch (error) {
        console.error('Error actualizando emergencia:', error)
      }
    }
    setVisible(false)
  }

  if (!visible || !emergencia) return null

  const getEmergencyConfig = () => {
    switch (emergencia.tipo) {
      case 'pelea_interna':
        return {
          color: 'bg-red-600',
          borderColor: 'border-red-500',
          icon: <AlertTriangle className="w-12 h-12 text-white" />,
          titulo: '🥊 PELEA INTERNA'
        }
      case 'pelea_externa':
        return {
          color: 'bg-red-700',
          borderColor: 'border-red-600',
          icon: <AlertTriangle className="w-12 h-12 text-white" />,
          titulo: '🚨 PELEA EXTERNA'
        }
      case 'fiscalizacion':
        return {
          color: 'bg-amber-600',
          borderColor: 'border-amber-500',
          icon: <Shield className="w-12 h-12 text-white" />,
          titulo: '👮 FISCALIZACIÓN'
        }
      default:
        return {
          color: 'bg-red-600',
          borderColor: 'border-red-500',
          icon: <AlertTriangle className="w-12 h-12 text-white" />,
          titulo: '⚠️ EMERGENCIA'
        }
    }
  }

  const config = getEmergencyConfig()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative w-full max-w-2xl mx-4 ${config.color} rounded-3xl border-4 ${config.borderColor} shadow-2xl animate-in zoom-in duration-500`}>
        {/* Botón cerrar */}
        <Button
          onClick={handleCerrar}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Contenido */}
        <div className="p-8 text-center space-y-6">
          {/* Icono animado */}
          <div className="flex justify-center animate-pulse">
            {config.icon}
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider animate-pulse">
            {config.titulo}
          </h1>

          {/* Mensaje */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              {emergencia.mensaje}
            </p>
            <div className="space-y-2 text-white/90">
              <p className="text-lg">
                📍 <span className="font-semibold">Ubicación:</span> {emergencia.ubicacion}
              </p>
              <p className="text-lg">
                👤 <span className="font-semibold">Reportado por:</span> {emergencia.reportado_por}
              </p>
              <p className="text-sm opacity-75">
                🕐 {new Date(emergencia.created_at).toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Botón de acción */}
          <Button
            onClick={handleCerrar}
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xl px-12 py-6 rounded-2xl shadow-xl"
          >
            ENTERADO
          </Button>

          {/* Instrucciones */}
          <p className="text-white/80 text-sm">
            {emergencia.tipo === 'fiscalizacion' 
              ? '⚠️ Mantén la calma y sigue los protocolos establecidos'
              : '🚨 Dirígete al punto de encuentro o mantente alerta'}
          </p>
        </div>

        {/* Efecto de pulso en el borde */}
        <div className="absolute inset-0 rounded-3xl border-4 border-white/50 animate-ping opacity-75" />
      </div>
    </div>
  )
}
