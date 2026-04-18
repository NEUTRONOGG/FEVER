"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, Lock, Eye, EyeOff, Sparkles, AlertCircle, UserCog, Zap, Fingerprint
} from "lucide-react"
import BiometricAuth from "@/components/BiometricAuth"

export default function RPLoginPage() {
  const router = useRouter()
  const [rps, setRps] = useState<any[]>([])
  const [rpSeleccionado, setRpSeleccionado] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [showBiometric, setShowBiometric] = useState(false)
  const [biometricMode, setBiometricMode] = useState<'register' | 'login'>('login')

  // Mouse tracking para liquid glass effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    cargarRPs()
    verificarSesion()
  }, [])

  async function cargarRPs() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { data, error } = await supabase
        .from('limites_cortesias_rp')
        .select('*')
        .eq('activo', true)
        .order('rp_nombre')
      
      if (error) throw error
      setRps(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function verificarSesion() {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return
    
    const sesion = localStorage.getItem('rp_sesion')
    if (sesion) {
      try {
        const { rpNombre, timestamp } = JSON.parse(sesion)
        const ahora = new Date().getTime()
        const tiempoTranscurrido = ahora - timestamp
        const tresHoras = 3 * 60 * 60 * 1000 // 3 horas en milisegundos

        if (tiempoTranscurrido < tresHoras) {
          // Sesión válida, redirigir
          localStorage.setItem("userName", rpNombre)
          localStorage.setItem("userRole", "rp")
          router.push("/dashboard/rp")
          return
        } else {
          // Sesión expirada
          localStorage.removeItem('rp_sesion')
        }
      } catch (error) {
        console.error('Error verificando sesión:', error)
        localStorage.removeItem('rp_sesion')
      }
    }
  }

  const handleLogin = async () => {
    if (!rpSeleccionado) {
      setError("Selecciona un RP")
      return
    }
    if (!password) {
      setError("Ingresa tu contraseña")
      return
    }

    try {
      // Verificar contraseña
      if (rpSeleccionado.password === password) {
        crearSesionYRedirigir()
      } else {
        setError("Contraseña incorrecta")
        setPassword("")
      }
    } catch (error) {
      console.error('Error:', error)
      setError("Error al iniciar sesión")
    }
  }

  const crearSesionYRedirigir = () => {
    // Crear sesión
    const sesion = {
      rpNombre: rpSeleccionado.rp_nombre,
      timestamp: new Date().getTime()
    }
    localStorage.setItem('rp_sesion', JSON.stringify(sesion))
    localStorage.setItem("userName", rpSeleccionado.rp_nombre)
    localStorage.setItem("userRole", "rp")

    // Redirigir
    router.push("/dashboard/rp")
  }

  const handleBiometricSuccess = () => {
    crearSesionYRedirigir()
  }

  const handleBiometricError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const toggleBiometric = (mode: 'register' | 'login') => {
    setBiometricMode(mode)
    setShowBiometric(!showBiometric)
    setError("")
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden"
    >
      {/* Animated Background Orbs - Dorado/Naranja */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-orange-600/20 to-amber-600/20 blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header con Glassmorphism Avanzado - Logo Extra Grande */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-56 h-56 rounded-3xl glass backdrop-blur-2xl bg-slate-900/40 border border-amber-500/20 mb-6 shadow-2xl shadow-amber-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 w-48 h-48 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/fever-logo.png"
                alt="FEVER Logo"
                width={192}
                height={192}
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 mb-3 animate-gradient">
            Panel RP
          </h1>
          <p className="text-slate-300 text-lg mb-6">Selecciona tu perfil e inicia sesión</p>
          
          {/* Botón Menú Staff - Estilo Sólido Dorado */}
          <div className="mt-6">
            <Button
              onClick={() => router.push('/dashboard/selector-rol')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 border-none"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Menú Staff
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <p className="text-center text-slate-400">Cargando RPs...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Selección de RP */}
            {!rpSeleccionado ? (
              <div>
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 mb-6 text-center">
                  ¿Quién eres?
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {rps.map((rp, index) => (
                    <div
                      key={rp.id}
                      onClick={() => {
                        setRpSeleccionado(rp)
                        setError("")
                      }}
                      className="group relative cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Glassmorphism Card - Dorado/Naranja */}
                      <div className="glass border border-amber-500/20 rounded-2xl p-6 backdrop-blur-2xl bg-gradient-to-br from-slate-900/40 via-amber-900/20 to-slate-900/40 hover:border-amber-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 relative overflow-hidden">
                        {/* Animated Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 via-amber-600/0 to-yellow-600/0 group-hover:from-orange-600/10 group-hover:via-amber-600/10 group-hover:to-yellow-600/10 transition-all duration-500 rounded-2xl" />
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        
                        <div className="text-center relative z-10">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 relative overflow-hidden shadow-lg shadow-amber-500/30">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Users className="w-10 h-10 text-white relative z-10" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-50 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-300 group-hover:via-amber-300 group-hover:to-yellow-300 transition-all duration-300">
                            {rp.rp_nombre}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 group-hover:text-amber-300 transition-colors duration-300">
                            <Sparkles className="w-4 h-4" />
                            <span>Relaciones Públicas</span>
                          </div>
                        </div>

                        {/* Bottom Glow */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Formulario de Contraseña con Glassmorphism Avanzado - Dorado */
              <div className="max-w-md mx-auto">
                <div className="glass border border-amber-500/30 rounded-3xl p-8 backdrop-blur-2xl bg-gradient-to-br from-slate-900/60 via-amber-900/30 to-slate-900/60 relative overflow-hidden shadow-2xl shadow-amber-500/10">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-amber-600/5 to-yellow-600/5 animate-pulse" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 flex items-center justify-center mx-auto mb-4 relative overflow-hidden group shadow-lg shadow-amber-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Users className="w-10 h-10 text-white relative z-10" />
                      </div>
                      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 mb-2">
                        {rpSeleccionado.rp_nombre}
                      </h3>
                      <p className="text-slate-400">
                        Ingresa tu contraseña
                      </p>
                    </div>

                    <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError("")
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-slate-100"
                        placeholder="••••••••"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="glass rounded-lg p-3 border border-red-500/30 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRpSeleccionado(null)
                        setPassword("")
                        setError("")
                        setShowBiometric(false)
                      }}
                      className="flex-1 border-slate-700"
                    >
                      Atrás
                    </Button>
                    <Button
                      onClick={handleLogin}
                      disabled={!password}
                      className="flex-1 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 hover:from-orange-700 hover:via-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
                    >
                      Iniciar Sesión
                    </Button>
                  </div>

                  {/* Separador con "O" */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-900/60 px-2 text-slate-400">O</span>
                    </div>
                  </div>

                  {/* Autenticación Biométrica */}
                  {!showBiometric ? (
                    <div className="space-y-3">
                      {/* Botón Face ID si está habilitado */}
                      {rpSeleccionado.biometric_enabled && (
                        <Button
                          onClick={() => toggleBiometric('login')}
                          variant="outline"
                          className="w-full border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200"
                        >
                          <Fingerprint className="w-4 h-4 mr-2" />
                          Iniciar con Face ID
                        </Button>
                      )}
                      
                      {/* Botón Registrar Face ID si no está habilitado */}
                      {!rpSeleccionado.biometric_enabled && (
                        <Button
                          onClick={() => toggleBiometric('register')}
                          variant="outline"
                          className="w-full border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200"
                        >
                          <Fingerprint className="w-4 h-4 mr-2" />
                          Registrar Face ID
                        </Button>
                      )}
                    </div>
                  ) : (
                    <BiometricAuth
                      rpId={rpSeleccionado.id}
                      rpNombre={rpSeleccionado.rp_nombre}
                      onSuccess={handleBiometricSuccess}
                      onError={handleBiometricError}
                      mode={biometricMode}
                    />
                  )}

                  <div className="glass rounded-lg p-4 border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">
                        Tu sesión permanecerá activa por <span className="text-amber-400 font-semibold">3 horas</span>. Después deberás ingresar tu contraseña nuevamente.
                      </p>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
