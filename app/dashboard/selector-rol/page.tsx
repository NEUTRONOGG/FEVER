"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SelectorSucursal } from "@/components/selector-sucursal"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Users, UtensilsCrossed, Shield, Sparkles,
  ArrowRight, Lock, ChefHat, Crown, ConciergeBell, HandPlatter, KeyRound
} from "lucide-react"
import { CuerdaVip, Emblema, TituloEmblema } from "@/components/iconos-fever"

export default function SelectorRolPage() {
  const router = useRouter()
  const [userName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("userName") || "Usuario"
    }
    return "Usuario"
  })
  
  const [dialogAdmin, setDialogAdmin] = useState(false)
  const [passwordAdmin, setPasswordAdmin] = useState("")
  const [errorPassword, setErrorPassword] = useState("")
  
  // Diálogos de contraseña para cada rol
  const [dialogPassword, setDialogPassword] = useState(false)
  const [rolSeleccionado, setRolSeleccionado] = useState<typeof roles[0] | null>(null)
  const [passwordRol, setPasswordRol] = useState("")
  const [errorPasswordRol, setErrorPasswordRol] = useState("")
  
  // Estados para selección de mesero
  const [dialogSeleccionMesero, setDialogSeleccionMesero] = useState(false)
  const [meseros, setMeseros] = useState<any[]>([])
  const [meseroSeleccionado, setMeseroSeleccionado] = useState<any | null>(null)
  
  // Contraseñas por rol
  const passwords = {
    hostess: "H0ST3SS2025",
    mesero: "M3S3R02025",
    cadena: "C4D3N42025"
  }
  
  // Cargar meseros al montar el componente
  useEffect(() => {
    cargarMeseros()
  }, [])
  
  async function cargarMeseros() {
    try {
      const { data, error } = await supabase
        .from('meseros')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      setMeseros(data || [])
    } catch (error) {
      console.error('Error cargando meseros:', error)
    }
  }

  const roles = [
    { 
      id: "rp", 
      nombre: "Relaciones Públicas", 
      descripcion: "Gestión de clientes VIP y experiencia premium.", 
      icon: Crown, 
      etiqueta: "VIP",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      hoverBorder: "hover:border-purple-500",
      ruta: "/dashboard/rp-login", 
      functions: ["Ver mesas atendidas", "Autorizar cortesías limitadas", "Ver historial de cortesías", "Gestión de clientes VIP"],
      bloqueado: false
    },
    { 
      id: "hostess", 
      nombre: "Hostess", 
      descripcion: "Primer contacto con cliente. Registro y asignación de mesas.", 
      icon: ConciergeBell, 
      etiqueta: "Recepción",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
      hoverBorder: "hover:border-pink-500",
      ruta: "/dashboard/hostess", 
      functions: ["Registrar nuevos clientes", "Asignar mesas disponibles", "Gestionar fila de espera", "Calificar servicio al finalizar"],
      bloqueado: false
    },
    { 
      id: "cadena", 
      nombre: "Cadena", 
      descripcion: "Control de acceso y seguridad del establecimiento.", 
      icon: CuerdaVip, 
      etiqueta: "Acceso",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      hoverBorder: "hover:border-orange-500",
      ruta: "/dashboard/cadena", 
      functions: ["Conteo de personas", "Flujo de entrada/salida", "Botón de emergencia", "Reportes de seguridad"],
      bloqueado: false
    },
    { 
      id: "mesero", 
      nombre: "Mesero", 
      descripcion: "Tomar órdenes y gestionar servicio de mesas.", 
      icon: HandPlatter, 
      etiqueta: "Servicio",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      hoverBorder: "hover:border-blue-500",
      ruta: "/dashboard/mesero", 
      functions: ["Ver mesas asignadas", "Tomar órdenes (POS)", "Agregar productos", "Cerrar cuentas"],
      bloqueado: false
    }
  ]

  const handleSeleccionarRol = (rol: typeof roles[0]) => {
    // Si está bloqueado, no hacer nada
    if (rol.bloqueado) {
      return
    }
    
    // Si es RP, va directo a su login
    if (rol.id === 'rp') {
      localStorage.setItem("rolActual", rol.id)
      router.push(rol.ruta)
      return
    }
    
    // Para Hostess, pedir contraseña
    if (rol.id === 'hostess') {
      setRolSeleccionado(rol)
      setDialogPassword(true)
      return
    }
    
    // Otros roles sin contraseña
    localStorage.setItem("rolActual", rol.id)
    router.push(rol.ruta)
  }
  
  const handleAccesoRol = () => {
    if (!rolSeleccionado) return
    
    const passwordCorrecta = passwords[rolSeleccionado.id as keyof typeof passwords]
    
    if (passwordRol === passwordCorrecta) {
      setDialogPassword(false)
      setPasswordRol("")
      setErrorPasswordRol("")
      
      // Si es mesero, mostrar selector de mesero
      if (rolSeleccionado.id === 'mesero') {
        setDialogSeleccionMesero(true)
      } else {
        // Para otros roles, continuar normalmente
        localStorage.setItem("rolActual", rolSeleccionado.id)
        localStorage.setItem("userName", rolSeleccionado.nombre)
        router.push(rolSeleccionado.ruta)
      }
    } else {
      setErrorPasswordRol("❌ Contraseña incorrecta")
      setPasswordRol("")
    }
  }
  
  const handleSeleccionarMesero = (mesero: any) => {
    setMeseroSeleccionado(mesero)
  }
  
  const handleConfirmarMesero = () => {
    if (!meseroSeleccionado || !rolSeleccionado) return
    
    localStorage.setItem("rolActual", "mesero")
    localStorage.setItem("userName", `${meseroSeleccionado.nombre} ${meseroSeleccionado.apellido}`)
    localStorage.setItem("meseroId", meseroSeleccionado.id.toString())
    localStorage.setItem("meseroNombre", `${meseroSeleccionado.nombre} ${meseroSeleccionado.apellido}`)
    
    setDialogSeleccionMesero(false)
    setMeseroSeleccionado(null)
    router.push(rolSeleccionado.ruta)
  }

  const handleAccesoAdmin = () => {
    if (passwordAdmin === "4DM1N2025!") {
      setDialogAdmin(false)
      setPasswordAdmin("")
      setErrorPassword("")
      router.push("/dashboard")
    } else {
      setErrorPassword("❌ Contraseña incorrecta")
      setPasswordAdmin("")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      {/* Fondo con gradiente naranja sutil */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header con logo */}
        <div className="text-center mb-16">
          {/* Logo FEVER */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/fever-logo.png"
              alt="FEVER Logo"
              width={200}
              height={113}
              className="opacity-90"
            />
          </div>

          {/* Sucursal de este dispositivo */}
          <div className="mb-6 flex justify-center">
            <SelectorSucursal />
          </div>

          {/* Título principal */}
          <div className="space-y-2">
            <h2 className="text-sm font-light text-slate-400 tracking-[0.3em] uppercase">
              THE GOLDEN AGE
            </h2>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Selecciona tu perfil para continuar
            </h1>
          </div>

          {/* Bienvenida */}
          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
            <p className="text-slate-300 text-sm">
              Bienvenido, <span className="text-orange-400 font-semibold">{userName}</span>
            </p>
          </div>
        </div>

        {/* Grid de Roles */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {roles.map((rol) => (
            <div
              key={rol.id}
              onClick={() => handleSeleccionarRol(rol)}
              className="relative group cursor-pointer"
            >
              <div className={`
                relative h-full overflow-hidden rounded-3xl border p-7
                border-amber-500/15 bg-[linear-gradient(160deg,rgba(28,20,9,0.92),rgba(9,7,4,0.96))]
                shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]
                transition-all duration-500 ease-out
                ${rol.bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-[0_30px_70px_-30px_rgba(245,196,81,0.35)]'}
              `}>
                {/* Brillo dorado en hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/0 blur-3xl transition-colors duration-500 group-hover:bg-amber-400/15" />

                <div className="relative z-10 flex h-full flex-col">
                  {/* Emblema y título unidos */}
                  <TituloEmblema
                    icono={rol.icon}
                    etiqueta={rol.etiqueta}
                    titulo={rol.nombre}
                    apagado={rol.bloqueado}
                    claseTitulo="text-xl"
                    descripcion={rol.descripcion}
                  />

                  {/* Funciones */}
                  <ul className="mt-5 space-y-2.5">
                    {rol.functions.map((func: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-xs text-slate-400 transition-colors group-hover:text-slate-300"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-amber-300/80" />
                        <span className="leading-relaxed">{func}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Entrar */}
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-amber-300">
                      {rol.bloqueado ? 'Bloqueado' : 'Entrar'}
                    </span>
                    <span className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 ${rol.bloqueado ? 'border-slate-700 text-slate-500' : 'border-amber-400/40 text-amber-300 group-hover:translate-x-1 group-hover:border-amber-300 group-hover:bg-amber-400 group-hover:text-black'}`}>
                      {rol.bloqueado ? <Lock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acceso Admin - ACTIVO */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          
          <button
            onClick={() => setDialogAdmin(true)}
            className="group flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-[linear-gradient(160deg,rgba(28,20,9,0.9),rgba(9,7,4,0.95))] py-3 pl-3 pr-6 text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/50"
          >
            <Emblema icono={KeyRound} tamano="md" />
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-300/80">Gerencia</span>
              <span className="block font-bold text-white">Acceso Administrador</span>
            </span>
            <ArrowRight className="ml-2 h-4 w-4 text-amber-300 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Info adicional */}
          <p className="text-xs text-slate-500 text-center max-w-md">
            Si necesitas cambiar de rol durante tu turno, puedes regresar a esta pantalla en cualquier momento
          </p>
        </div>
      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      {/* Dialog Contraseña para Roles (Hostess, Mesero, Cadena) */}
      <Dialog open={dialogPassword} onOpenChange={setDialogPassword}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-3">
              {rolSeleccionado && (
                <>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rolSeleccionado.color} flex items-center justify-center`}>
                    <rolSeleccionado.icon className="w-6 h-6 text-white" />
                  </div>
                  Acceso {rolSeleccionado.nombre}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Campo de contraseña */}
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Contraseña de {rolSeleccionado?.nombre}</Label>
              <Input
                type="password"
                value={passwordRol}
                onChange={(e) => {
                  setPasswordRol(e.target.value)
                  setErrorPasswordRol("")
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAccesoRol()
                  }
                }}
                placeholder="••••••••"
                className="bg-slate-800/80 border-slate-700/50 text-slate-100 h-12 rounded-xl focus:border-orange-500/50 transition-colors"
                autoFocus
              />
              {errorPasswordRol && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                  <span>❌</span>
                  <span>{errorPasswordRol}</span>
                </div>
              )}
            </div>

            {/* Aviso de seguridad */}
            <div className="glass rounded-xl p-4 border border-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-slate-400 text-sm">
                  Ingresa la contraseña asignada para acceder al panel de {rolSeleccionado?.nombre}
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogPassword(false)
                  setPasswordRol("")
                  setErrorPasswordRol("")
                  setRolSeleccionado(null)
                }}
                className="flex-1 border-slate-700 hover:border-slate-600 h-12 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAccesoRol}
                className={`flex-1 bg-gradient-to-r ${rolSeleccionado?.color} h-12 rounded-xl shadow-lg transition-all`}
              >
                <Lock className="w-4 h-4 mr-2" />
                Acceder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Contraseña Admin mejorado */}
      <Dialog open={dialogAdmin} onOpenChange={setDialogAdmin}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              Acceso Administrador
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Campo de contraseña */}
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Contraseña de Administrador</Label>
              <Input
                type="password"
                value={passwordAdmin}
                onChange={(e) => {
                  setPasswordAdmin(e.target.value)
                  setErrorPassword("")
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAccesoAdmin()
                  }
                }}
                placeholder="••••••••"
                className="bg-slate-800/80 border-slate-700/50 text-slate-100 h-12 rounded-xl focus:border-orange-500/50 transition-colors"
                autoFocus
              />
              {errorPassword && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                  <span>❌</span>
                  <span>{errorPassword}</span>
                </div>
              )}
            </div>

            {/* Aviso de seguridad */}
            <div className="glass rounded-xl p-4 border border-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-slate-400 text-sm">
                  Este acceso está restringido únicamente para personal autorizado con privilegios administrativos
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogAdmin(false)
                  setPasswordAdmin("")
                  setErrorPassword("")
                }}
                className="flex-1 border-slate-700 hover:border-slate-600 h-12 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAccesoAdmin}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 h-12 rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all"
              >
                <Lock className="w-4 h-4 mr-2" />
                Acceder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Selección de Mesero */}
      <Dialog open={dialogSeleccionMesero} onOpenChange={setDialogSeleccionMesero}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 backdrop-blur-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              Selecciona tu Perfil de Mesero
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {meseros.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No hay meseros disponibles</p>
                <p className="text-slate-500 text-sm mt-2">Contacta al administrador</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {meseros.map((mesero) => (
                  <div
                    key={mesero.id}
                    onClick={() => handleSeleccionarMesero(mesero)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      meseroSeleccionado?.id === mesero.id
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500'
                        : 'glass border-slate-700 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        meseroSeleccionado?.id === mesero.id
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {mesero.nombre.charAt(0)}{mesero.apellido.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">
                          {mesero.nombre} {mesero.apellido}
                        </p>
                        {mesero.telefono && (
                          <p className="text-xs text-slate-400">{mesero.telefono}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogSeleccionMesero(false)
                  setMeseroSeleccionado(null)
                }}
                className="flex-1 border-slate-700 hover:border-slate-600 h-12 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmarMesero}
                disabled={!meseroSeleccionado}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-12 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
