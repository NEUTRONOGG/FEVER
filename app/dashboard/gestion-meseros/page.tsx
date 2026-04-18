"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { 
  UserPlus, Edit, Trash2, Users, Phone, Mail, 
  CheckCircle, XCircle, UtensilsCrossed 
} from "lucide-react"

interface Mesero {
  id: number
  nombre: string
  apellido: string
  telefono: string | null
  email: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export default function GestionMeserosPage() {
  const [meseros, setMeseros] = useState<Mesero[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogAgregar, setDialogAgregar] = useState(false)
  const [dialogEditar, setDialogEditar] = useState(false)
  const [meseroEditando, setMeseroEditando] = useState<Mesero | null>(null)
  
  // Form states
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    cargarMeseros()
  }, [])

  async function cargarMeseros() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('meseros')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setMeseros(data || [])
    } catch (error) {
      console.error('Error cargando meseros:', error)
      alert('Error al cargar meseros')
    } finally {
      setLoading(false)
    }
  }

  const limpiarFormulario = () => {
    setNombre("")
    setApellido("")
    setTelefono("")
    setEmail("")
  }

  const handleAgregarMesero = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      alert('Nombre y apellido son requeridos')
      return
    }

    try {
      const { error } = await supabase
        .from('meseros')
        .insert({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          activo: true
        })

      if (error) throw error

      alert('✅ Mesero agregado exitosamente')
      setDialogAgregar(false)
      limpiarFormulario()
      cargarMeseros()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al agregar mesero')
    }
  }

  const abrirDialogEditar = (mesero: Mesero) => {
    setMeseroEditando(mesero)
    setNombre(mesero.nombre)
    setApellido(mesero.apellido)
    setTelefono(mesero.telefono || "")
    setEmail(mesero.email || "")
    setDialogEditar(true)
  }

  const handleEditarMesero = async () => {
    if (!meseroEditando || !nombre.trim() || !apellido.trim()) {
      alert('Nombre y apellido son requeridos')
      return
    }

    try {
      const { error } = await supabase
        .from('meseros')
        .update({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim() || null,
          email: email.trim() || null
        })
        .eq('id', meseroEditando.id)

      if (error) throw error

      alert('✅ Mesero actualizado exitosamente')
      setDialogEditar(false)
      setMeseroEditando(null)
      limpiarFormulario()
      cargarMeseros()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al actualizar mesero')
    }
  }

  const handleToggleActivo = async (mesero: Mesero) => {
    try {
      const { error } = await supabase
        .from('meseros')
        .update({ activo: !mesero.activo })
        .eq('id', mesero.id)

      if (error) throw error

      alert(`✅ Mesero ${!mesero.activo ? 'activado' : 'desactivado'}`)
      cargarMeseros()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al cambiar estado')
    }
  }

  const handleEliminarMesero = async (mesero: Mesero) => {
    if (!confirm(`¿Eliminar a ${mesero.nombre} ${mesero.apellido}?`)) return

    try {
      // Verificar si tiene mesas asignadas
      const { data: mesas } = await supabase
        .from('mesas')
        .select('id')
        .eq('mesero_id', mesero.id)
        .eq('estado', 'ocupada')

      if (mesas && mesas.length > 0) {
        alert('❌ No se puede eliminar. El mesero tiene mesas activas asignadas.')
        return
      }

      const { error } = await supabase
        .from('meseros')
        .delete()
        .eq('id', mesero.id)

      if (error) throw error

      alert('✅ Mesero eliminado')
      cargarMeseros()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al eliminar mesero')
    }
  }

  const meseroActivos = meseros.filter(m => m.activo)
  const meseroInactivos = meseros.filter(m => !m.activo)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Gestión de Meseros</h1>
          <p className="text-slate-400 mt-1">Administra el personal de servicio</p>
        </div>
        <Button
          onClick={() => {
            limpiarFormulario()
            setDialogAgregar(true)
          }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar Mesero
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Meseros</p>
                <p className="text-3xl font-bold text-orange-500">{meseros.length}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Activos</p>
                <p className="text-3xl font-bold text-emerald-500">{meseroActivos.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Inactivos</p>
                <p className="text-3xl font-bold text-slate-500">{meseroInactivos.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Meseros */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-slate-50">Meseros Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Cargando...</p>
            </div>
          ) : meseros.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No hay meseros registrados</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {meseros.map((mesero) => (
                <div
                  key={mesero.id}
                  className={`glass rounded-xl p-4 border ${
                    mesero.activo ? 'border-orange-500/30' : 'border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-50">
                        {mesero.nombre} {mesero.apellido}
                      </h3>
                      <Badge 
                        className={mesero.activo 
                          ? "bg-emerald-500/20 text-emerald-500" 
                          : "bg-slate-500/20 text-slate-500"
                        }
                      >
                        {mesero.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="space-y-2 mb-4">
                    {mesero.telefono && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span>{mesero.telefono}</span>
                      </div>
                    )}
                    {mesero.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{mesero.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirDialogEditar(mesero)}
                      className="flex-1 border-slate-700 text-slate-300 hover:text-white"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActivo(mesero)}
                      className={`border-slate-700 ${
                        mesero.activo 
                          ? 'text-slate-400 hover:text-slate-300' 
                          : 'text-emerald-500 hover:text-emerald-400'
                      }`}
                    >
                      {mesero.activo ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEliminarMesero(mesero)}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Agregar Mesero */}
      <Dialog open={dialogAgregar} onOpenChange={setDialogAgregar}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-orange-500" />
              Agregar Nuevo Mesero
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nombre *</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan"
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Apellido *</Label>
                <Input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Pérez"
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Teléfono</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="555-0101"
                className="bg-slate-800/50 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mesero@fever.com"
                className="bg-slate-800/50 border-slate-700"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogAgregar(false)
                  limpiarFormulario()
                }}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAgregarMesero}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Mesero */}
      <Dialog open={dialogEditar} onOpenChange={setDialogEditar}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Edit className="w-6 h-6 text-orange-500" />
              Editar Mesero
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nombre *</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Apellido *</Label>
                <Input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Teléfono</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogEditar(false)
                  setMeseroEditando(null)
                  limpiarFormulario()
                }}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditarMesero}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
