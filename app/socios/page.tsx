'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, User, UserCog, Sparkles } from 'lucide-react'

export default function SociosLogin() {
  const router = useRouter()

  const socios = [
    { nombre: 'Ashton', ruta: '/socios/ashton', color: 'from-yellow-400 via-yellow-500 to-amber-500' },
    { nombre: 'Agus', ruta: '/socios/agus', color: 'from-purple-500 via-purple-600 to-pink-500' },
    { nombre: 'Canales', ruta: '/socios/canales', color: 'from-pink-500 via-rose-500 to-pink-600' },
    { nombre: 'Ricardo', ruta: '/socios/ricardo', color: 'from-purple-600 via-violet-600 to-purple-700' },
    { nombre: 'Sofia', ruta: '/socios/sofia', color: 'from-rose-400 via-pink-500 to-rose-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo FEVER y Botón Staff */}
        <div className="text-center mb-6 md:mb-8 relative">
          {/* Logo FEVER */}
          <div className="flex justify-center mb-4 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 rounded-3xl border border-amber-500/20 shadow-2xl">
                <Image
                  src="/fever-logo.png"
                  alt="FEVER Logo"
                  width={180}
                  height={60}
                  className="w-32 md:w-44 h-auto"
                  priority
                />
              </div>
            </div>
          </div>
          
          {/* Botón Menú Staff */}
          <div className="absolute top-0 right-0 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '200ms' }}>
            <Button
              onClick={() => router.push('/dashboard/selector-rol')}
              variant="outline"
              className="border-slate-700/50 text-slate-300 hover:text-white hover:border-amber-500/50 hover:bg-slate-800/50 transition-all backdrop-blur-xl"
            >
              <UserCog className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Menú Staff</span>
              <span className="md:hidden">Staff</span>
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
          <div className="inline-block mb-3 md:mb-4">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-500 animate-pulse" />
              <p className="text-xs md:text-sm tracking-[0.3em] text-amber-500/80 uppercase font-semibold">THE GOLDEN AGE</p>
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-500 animate-pulse" style={{ animationDelay: '500ms' }} />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2 animate-pulse">
            Selecciona tu acceso
          </h2>
          <p className="text-sm md:text-base text-slate-400">Acceso premium exclusivo para socios</p>
        </div>

        {/* Grid de Socios - Primera fila 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {socios.slice(0, 3).map((socio, index) => (
            <Card
              key={socio.nombre}
              onClick={() => router.push(socio.ruta)}
              className="glass border border-slate-700/30 cursor-pointer hover:border-amber-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 group overflow-hidden rounded-2xl md:rounded-3xl relative animate-in fade-in zoom-in-95 duration-700"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
                <div className="text-center">
                  {/* Icono */}
                  <div className="relative mb-4">
                    <div className={`absolute inset-0 bg-gradient-to-br ${socio.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse`} />
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br ${socio.color} flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-500`}>
                      <Crown className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Nombre */}
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent mb-2">
                    {socio.nombre}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-6">
                    Acceso premium exclusivo
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-1.5 md:space-y-2 text-left mb-4 md:mb-6">
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Cortesías premium $1500</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Estadísticas del negocio</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Ventas en tiempo real</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Historial de cortesías</span>
                    </div>
                  </div>
                  
                  {/* Botón */}
                  <Button
                    className={`w-full bg-gradient-to-r ${socio.color} hover:opacity-90 hover:scale-105 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Acceder como Socio</span>
                    <span className="md:hidden">Acceder</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Segunda fila - 2 columnas centradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          {socios.slice(3, 5).map((socio, index) => (
            <Card
              key={socio.nombre}
              onClick={() => router.push(socio.ruta)}
              className="glass border border-slate-700/30 cursor-pointer hover:border-amber-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 group overflow-hidden rounded-2xl md:rounded-3xl relative animate-in fade-in zoom-in-95 duration-700"
              style={{ animationDelay: `${700 + index * 100}ms` }}
            >
              <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
                <div className="text-center">
                  {/* Icono */}
                  <div className="relative mb-4">
                    <div className={`absolute inset-0 bg-gradient-to-br ${socio.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse`} />
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br ${socio.color} flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-500`}>
                      <Crown className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Nombre */}
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent mb-2">
                    {socio.nombre}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-6">
                    Acceso premium exclusivo
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-1.5 md:space-y-2 text-left mb-4 md:mb-6">
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Cortesías premium $1500</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Estadísticas del negocio</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Ventas en tiempo real</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                      <span>Historial de cortesías</span>
                    </div>
                  </div>
                  
                  {/* Botón */}
                  <Button
                    className={`w-full bg-gradient-to-r ${socio.color} hover:opacity-90 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 text-white font-semibold shadow-lg transition-all duration-300 text-sm md:text-base`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Acceder como Socio</span>
                    <span className="md:hidden">Acceder</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 md:mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '900ms' }}>
          <p className="text-xs md:text-sm text-slate-500">
            Cada socio tiene su propio acceso con contraseña individual
          </p>
        </div>
      </div>
    </div>
  )
}
