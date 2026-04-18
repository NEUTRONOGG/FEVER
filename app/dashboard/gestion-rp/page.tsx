"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  Users, Gift, Edit, Plus, Save, X,
  Wine, Droplet, Award, Sparkles, AlertCircle
} from "lucide-react"

export default function GestionRPPage() {
  const [rps, setRps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogNuevoRP, setDialogNuevoRP] = useState(false)
  const [dialogEditarRP, setDialogEditarRP] = useState(false)
  const [rpSeleccionado, setRpSeleccionado] = useState<any>(null)
  
  const [nuevoRP, setNuevoRP] = useState({
    nombre: "",
    shots: 5,
    descuento_botella: 1,
    perlas_negras: 3,
    shots_bienvenida: 10
  })

  useEffect(() => {
    cargarRPs()
  }, [])

  async function cargarRPs() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('limites_cortesias_rp')
        .select('*')
        .order('rp_nombre')
      
      if (error) throw error
      setRps(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCrearRP = async () => {
    if (!nuevoRP.nombre.trim()) {
      alert('❌ El nombre del RP es requerido')
      return
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('limites_cortesias_rp')
        .insert([{
          rp_nombre: nuevoRP.nombre,
          shots_disponibles: nuevoRP.shots,
          shots_usados: 0,
          descuento_botella_disponible: nuevoRP.descuento_botella,
          descuento_botella_usado: 0,
          perlas_negras_disponibles: nuevoRP.perlas_negras,
          perlas_negras_usadas: 0,
          shots_bienvenida_disponibles: nuevoRP.shots_bienvenida,
          shots_bienvenida_usados: 0,
          activo: true
        }])
      
      if (error) throw error
      
      alert(`✅ RP "${nuevoRP.nombre}" creado exitosamente`)
      setDialogNuevoRP(false)
      setNuevoRP({
        nombre: "",
        shots: 5,
        descuento_botella: 1,
        perlas_negras: 3,
        shots_bienvenida: 10
      })
      cargarRPs()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al crear RP')
    }
  }

  const handleActualizarLimites = async () => {
    if (!rpSeleccionado) return

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('limites_cortesias_rp')
        .update({
          shots_disponibles: rpSeleccionado.shots_disponibles,
          descuento_botella_disponible: rpSeleccionado.descuento_botella_disponible,
          perlas_negras_disponibles: rpSeleccionado.perlas_negras_disponibles,
          shots_bienvenida_disponibles: rpSeleccionado.shots_bienvenida_disponibles
        })
        .eq('id', rpSeleccionado.id)
      
      if (error) throw error
      
      alert(`✅ Límites de "${rpSeleccionado.rp_nombre}" actualizados`)
      setDialogEditarRP(false)
      setRpSeleccionado(null)
      cargarRPs()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al actualizar límites')
    }
  }

  const handleReiniciarContadores = async (rp: any) => {
    if (!confirm(`¿Reiniciar contadores de ${rp.rp_nombre}?`)) return

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('limites_cortesias_rp')
        .update({
          shots_usados: 0,
          descuento_botella_usado: 0,
          perlas_negras_usadas: 0,
          shots_bienvenida_usados: 0
        })
        .eq('id', rp.id)
      
      if (error) throw error
      
      alert(`✅ Contadores de "${rp.rp_nombre}" reiniciados`)
      cargarRPs()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al reiniciar contadores')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Gestión de RPs</h1>
          <p className="text-slate-400 mt-1">Administra límites de cortesías para cada RP</p>
        </div>
        <Button
          onClick={() => setDialogNuevoRP(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo RP
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total RPs</p>
                <p className="text-3xl font-bold text-purple-500">{rps.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">RPs Activos</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {rps.filter(r => r.activo).length}
                </p>
              </div>
              <Gift className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cortesías Totales</p>
                <p className="text-3xl font-bold text-amber-500">
                  {rps.reduce((sum, r) => sum + r.shots_usados + r.descuento_botella_usado + r.perlas_negras_usadas + r.shots_bienvenida_usados, 0)}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Disponibles</p>
                <p className="text-3xl font-bold text-blue-500">
                  {rps.reduce((sum, r) => sum + (r.shots_disponibles - r.shots_usados), 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de RPs */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-slate-50">RPs y sus Límites</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400 text-center py-8">Cargando...</p>
          ) : rps.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No hay RPs configurados</p>
              <Button
                onClick={() => setDialogNuevoRP(true)}
                variant="outline"
                className="mt-4 border-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer RP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rps.map((rp) => (
                <div key={rp.id} className="glass rounded-xl p-6 border border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-50 mb-1">{rp.rp_nombre}</h3>
                      <Badge className={rp.activo ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-500/20 text-slate-500"}>
                        {rp.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRpSeleccionado(rp)
                          setDialogEditarRP(true)
                        }}
                        className="border-slate-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Límites
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReiniciarContadores(rp)}
                        className="border-slate-700"
                      >
                        Reiniciar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Shots */}
                    <div className="glass rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className="w-5 h-5 text-blue-500" />
                        <p className="text-sm text-slate-400">Shots</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-500">
                        {rp.shots_disponibles - rp.shots_usados}/{rp.shots_disponibles}
                      </p>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${((rp.shots_disponibles - rp.shots_usados) / rp.shots_disponibles * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Descuento Botella */}
                    <div className="glass rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wine className="w-5 h-5 text-purple-500" />
                        <p className="text-sm text-slate-400">Descuento 10%</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-500">
                        {rp.descuento_botella_disponible - rp.descuento_botella_usado}/{rp.descuento_botella_disponible}
                      </p>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${((rp.descuento_botella_disponible - rp.descuento_botella_usado) / rp.descuento_botella_disponible * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Perlas Negras */}
                    <div className="glass rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <p className="text-sm text-slate-400">Perlas Negras</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-500">
                        {rp.perlas_negras_disponibles - rp.perlas_negras_usadas}/{rp.perlas_negras_disponibles}
                      </p>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${((rp.perlas_negras_disponibles - rp.perlas_negras_usadas) / rp.perlas_negras_disponibles * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Shot Bienvenida */}
                    <div className="glass rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-pink-500" />
                        <p className="text-sm text-slate-400">Bienvenida</p>
                      </div>
                      <p className="text-2xl font-bold text-pink-500">
                        {rp.shots_bienvenida_disponibles - rp.shots_bienvenida_usados}/{rp.shots_bienvenida_disponibles}
                      </p>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${((rp.shots_bienvenida_disponibles - rp.shots_bienvenida_usados) / rp.shots_bienvenida_disponibles * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nuevo RP */}
      <Dialog open={dialogNuevoRP} onOpenChange={setDialogNuevoRP}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-500" />
              Crear Nuevo RP
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configura los límites de cortesías para el nuevo RP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nombre del RP *</Label>
              <Input
                value={nuevoRP.nombre}
                onChange={(e) => setNuevoRP({...nuevoRP, nombre: e.target.value})}
                className="bg-slate-800/50 border-slate-700"
                placeholder="Carlos RP"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  Shots
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={nuevoRP.shots}
                  onChange={(e) => setNuevoRP({...nuevoRP, shots: parseInt(e.target.value) || 0})}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Wine className="w-4 h-4 text-purple-500" />
                  Descuento Botella
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={nuevoRP.descuento_botella}
                  onChange={(e) => setNuevoRP({...nuevoRP, descuento_botella: parseInt(e.target.value) || 0})}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Perlas Negras
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={nuevoRP.perlas_negras}
                  onChange={(e) => setNuevoRP({...nuevoRP, perlas_negras: parseInt(e.target.value) || 0})}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  Shot Bienvenida
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={nuevoRP.shots_bienvenida}
                  onChange={(e) => setNuevoRP({...nuevoRP, shots_bienvenida: parseInt(e.target.value) || 0})}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
            </div>

            <div className="glass rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-400">
                  <p className="font-semibold text-slate-300 mb-1">Nota:</p>
                  <p>Estos límites se aplicarán por período. Puedes reiniciar los contadores manualmente cuando sea necesario.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogNuevoRP(false)}
                className="flex-1 border-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleCrearRP}
                disabled={!nuevoRP.nombre.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Crear RP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Límites */}
      <Dialog open={dialogEditarRP} onOpenChange={setDialogEditarRP}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Edit className="w-6 h-6 text-purple-500" />
              Editar Límites - {rpSeleccionado?.rp_nombre}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Ajusta los límites de cortesías disponibles
            </DialogDescription>
          </DialogHeader>

          {rpSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    Shots Disponibles
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={rpSeleccionado.shots_disponibles}
                    onChange={(e) => setRpSeleccionado({
                      ...rpSeleccionado,
                      shots_disponibles: parseInt(e.target.value) || 0
                    })}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <p className="text-xs text-slate-500">
                    Usados: {rpSeleccionado.shots_usados}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Wine className="w-4 h-4 text-purple-500" />
                    Descuentos Disponibles
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={rpSeleccionado.descuento_botella_disponible}
                    onChange={(e) => setRpSeleccionado({
                      ...rpSeleccionado,
                      descuento_botella_disponible: parseInt(e.target.value) || 0
                    })}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <p className="text-xs text-slate-500">
                    Usados: {rpSeleccionado.descuento_botella_usado}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Perlas Disponibles
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={rpSeleccionado.perlas_negras_disponibles}
                    onChange={(e) => setRpSeleccionado({
                      ...rpSeleccionado,
                      perlas_negras_disponibles: parseInt(e.target.value) || 0
                    })}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <p className="text-xs text-slate-500">
                    Usadas: {rpSeleccionado.perlas_negras_usadas}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    Bienvenida Disponibles
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={rpSeleccionado.shots_bienvenida_disponibles}
                    onChange={(e) => setRpSeleccionado({
                      ...rpSeleccionado,
                      shots_bienvenida_disponibles: parseInt(e.target.value) || 0
                    })}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <p className="text-xs text-slate-500">
                    Usados: {rpSeleccionado.shots_bienvenida_usados}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogEditarRP(false)}
                  className="flex-1 border-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleActualizarLimites}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
