"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  KeyRound, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Users,
  RefreshCw,
  Search,
  X
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RP {
  id: number
  nombre: string
  telefono?: string
  abreviatura?: string
  abreviatura_asignada_por?: string
  fecha_abreviatura_asignada?: string
}

export default function AbreviaturasRPsPage() {
  const [rps, setRps] = useState<RP[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [abreviaturasEditadas, setAbreviaturasEditadas] = useState<Record<number, string>>({})

  useEffect(() => {
    cargarRPs()
  }, [])

  async function cargarRPs() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { data, error } = await supabase
        .from('rps')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      
      setRps(data || [])
      
      // Inicializar estado de edición
      const iniciales: Record<number, string> = {}
      data?.forEach((rp: RP) => {
        iniciales[rp.id] = rp.abreviatura || ''
      })
      setAbreviaturasEditadas(iniciales)
      
    } catch (error) {
      console.error('Error cargando RPs:', error)
      setMensaje({ tipo: 'error', texto: 'Error cargando RPs' })
    } finally {
      setLoading(false)
    }
  }

  async function guardarAbreviatura(rpId: number) {
    setGuardando(rpId)
    setMensaje(null)
    
    try {
      const { supabase } = await import('@/lib/supabase')
      
      const rp = rps.find(r => r.id === rpId)
      if (!rp) return
      
      const abreviatura = abreviaturasEditadas[rpId]?.toUpperCase().trim()
      
      // Validar que sean exactamente 2 letras
      if (abreviatura && !/^[A-Z]{2}$/.test(abreviatura)) {
        setMensaje({ 
          tipo: 'error', 
          texto: `La abreviatura para ${rp.nombre} debe ser exactamente 2 letras mayúsculas` 
        })
        return
      }
      
      // Verificar si ya existe
      if (abreviatura) {
        const { data: existente } = await supabase
          .from('rps')
          .select('nombre, abreviatura')
          .eq('abreviatura', abreviatura)
          .neq('id', rpId)
          .single()
        
        if (existente) {
          setMensaje({ 
            tipo: 'error', 
            texto: `La abreviatura "${abreviatura}" ya está asignada a ${existente.nombre}` 
          })
          return
        }
      }
      
      // Obtener nombre del usuario actual (asumiendo que está en localStorage)
      const asignadoPor = localStorage.getItem('userName') || 'Admin'
      
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('rps')
        .update({
          abreviatura: abreviatura || null,
          abreviatura_asignada_por: abreviatura ? asignadoPor : null,
          fecha_abreviatura_asignada: abreviatura ? new Date().toISOString() : null
        })
        .eq('id', rpId)
      
      if (error) throw error
      
      // Actualizar reservaciones existentes de este RP
      if (abreviatura) {
        await supabase
          .from('reservaciones')
          .update({ rp_abreviatura: abreviatura })
          .eq('rp_nombre', rp.nombre)
      }
      
      // Recargar datos
      await cargarRPs()
      
      setMensaje({ 
        tipo: 'success', 
        texto: abreviatura 
          ? `Abreviatura "${abreviatura}" asignada a ${rp.nombre}`
          : `Abreviatura eliminada de ${rp.nombre}`
      })
      
    } catch (error) {
      console.error('Error guardando:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar la abreviatura' })
    } finally {
      setGuardando(null)
    }
  }

  function handleAbreviaturaChange(rpId: number, valor: string) {
    // Solo permitir letras, máximo 2 caracteres
    const limpio = valor.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
    setAbreviaturasEditadas(prev => ({
      ...prev,
      [rpId]: limpio
    }))
  }

  const rpsFiltrados = rps.filter(rp => 
    rp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    rp.abreviatura?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stats = {
    total: rps.length,
    conAbreviatura: rps.filter(rp => rp.abreviatura).length,
    sinAbreviatura: rps.filter(rp => !rp.abreviatura).length
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">🔤 Abreviaturas de RPs</h1>
          <p className="text-slate-400 mt-1">
            Asigna abreviaturas de 2 letras a cada RP para identificar reservaciones
          </p>
        </div>
        <Button
          onClick={cargarRPs}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <Alert className={mensaje.tipo === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}>
          {mensaje.tipo === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <AlertDescription className={mensaje.tipo === 'success' ? 'text-emerald-400' : 'text-red-400'}>
            {mensaje.texto}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total RPs</p>
                <p className="text-2xl font-bold text-slate-50">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Con Abreviatura</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.conAbreviatura}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sin Asignar</p>
                <p className="text-2xl font-bold text-amber-500">{stats.sinAbreviatura}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Buscar RP por nombre o abreviatura..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
          </button>
        )}
      </div>

      {/* Tabla de RPs */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Gestión de Abreviaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-300">RP</TableHead>
                <TableHead className="text-slate-300 text-center">Abreviatura (2 letras)</TableHead>
                <TableHead className="text-slate-300">Asignada por</TableHead>
                <TableHead className="text-slate-300">Fecha</TableHead>
                <TableHead className="text-slate-300 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rpsFiltrados.map((rp) => (
                <TableRow key={rp.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {rp.abreviatura || rp.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{rp.nombre}</p>
                        <p className="text-sm text-slate-500">{rp.telefono || 'Sin teléfono'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        value={abreviaturasEditadas[rp.id] || ''}
                        onChange={(e) => handleAbreviaturaChange(rp.id, e.target.value)}
                        placeholder="AA"
                        maxLength={2}
                        className="w-20 text-center bg-slate-800 border-slate-700 text-slate-100 uppercase"
                      />
                      {rp.abreviatura && (
                        <Badge className="bg-emerald-500/20 text-emerald-500">
                          Actual: {rp.abreviatura}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-400 text-sm">
                      {rp.abreviatura_asignada_por || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-500 text-sm">
                      {rp.fecha_abreviatura_asignada 
                        ? new Date(rp.fecha_abreviatura_asignada).toLocaleDateString()
                        : '-'
                      }
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => guardarAbreviatura(rp.id)}
                      disabled={guardando === rp.id}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {guardando === rp.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      {guardando === rp.id ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {rpsFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {busqueda ? 'No se encontraron RPs con esa búsqueda' : 'No hay RPs registrados'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <AlertCircle className="w-4 h-4 text-blue-500" />
        <AlertDescription className="text-blue-400">
          <strong>Nota importante:</strong> Las abreviaturas se usan para identificar automáticamente 
          qué RP hizo cada reservación. Cuando Claude procesa un archivo de reservaciones, 
          busca estas abreviaturas (ej: &quot;Juan Pérez 5px (JP)&quot;) para asignar el RP correcto.
        </AlertDescription>
      </Alert>
    </div>
  )
}
