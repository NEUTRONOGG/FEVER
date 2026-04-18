"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  UtensilsCrossed, Search, ArrowLeft, Wine, Coffee, 
  IceCream, Pizza, Soup, ChefHat
} from "lucide-react"

export default function MenuStaffPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('categoria')
        .order('nombre')
      
      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorias = [
    { id: "todas", nombre: "Todas", icon: ChefHat, color: "text-slate-400" },
    { id: "bebidas", nombre: "Bebidas", icon: Wine, color: "text-purple-500" },
    { id: "cocteles", nombre: "Cócteles", icon: Coffee, color: "text-pink-500" },
    { id: "comida", nombre: "Comida", icon: Pizza, color: "text-amber-500" },
    { id: "postres", nombre: "Postres", icon: IceCream, color: "text-rose-500" },
    { id: "entradas", nombre: "Entradas", icon: Soup, color: "text-emerald-500" },
  ]

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchCategoria = categoriaSeleccionada === "todas" || 
                          p.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
    return matchBusqueda && matchCategoria
  })

  const productosAgrupados = productosFiltrados.reduce((acc: any, producto: any) => {
    const cat = producto.categoria || "Otros"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(producto)
    return acc
  }, {})

  const getCategoriaIcon = (categoria: string) => {
    const cat = categorias.find(c => c.nombre.toLowerCase() === categoria.toLowerCase())
    return cat ? cat.icon : ChefHat
  }

  const getCategoriaColor = (categoria: string) => {
    const cat = categorias.find(c => c.nombre.toLowerCase() === categoria.toLowerCase())
    return cat ? cat.color : "text-slate-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
                <UtensilsCrossed className="w-8 h-8 text-emerald-500" />
                Menú Staff
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Catálogo completo de productos
              </p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <Card className="glass-hover border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros de Categoría */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categorias.map((cat) => {
            const Icon = cat.icon
            const isSelected = categoriaSeleccionada === cat.id
            return (
              <Button
                key={cat.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => setCategoriaSeleccionada(cat.id)}
                className={`flex-shrink-0 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                    : 'border-slate-700 hover:border-emerald-500'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : cat.color}`} />
                {cat.nombre}
              </Button>
            )
          })}
        </div>

        {/* Productos */}
        {loading ? (
          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <p className="text-center text-slate-400">Cargando productos...</p>
            </CardContent>
          </Card>
        ) : productosFiltrados.length === 0 ? (
          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <p className="text-center text-slate-400">No se encontraron productos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.keys(productosAgrupados).sort().map((categoria) => {
              const Icon = getCategoriaIcon(categoria)
              const color = getCategoriaColor(categoria)
              
              return (
                <Card key={categoria} className="glass-hover border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-slate-50">{categoria}</span>
                      <Badge variant="outline" className="ml-auto border-slate-600">
                        {productosAgrupados[categoria].length} productos
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {productosAgrupados[categoria].map((producto: any) => (
                        <div
                          key={producto.id}
                          className="glass rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-100 flex-1">
                              {producto.nombre}
                            </h3>
                            <span className="text-lg font-bold text-emerald-500 ml-2">
                              ${producto.precio.toFixed(2)}
                            </span>
                          </div>
                          {producto.descripcion && (
                            <p className="text-xs text-slate-400 mb-2">
                              {producto.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs border-slate-600"
                            >
                              {producto.categoria}
                            </Badge>
                            {producto.stock !== undefined && (
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  producto.stock > 10 
                                    ? 'border-emerald-600 text-emerald-500' 
                                    : producto.stock > 0
                                    ? 'border-amber-600 text-amber-500'
                                    : 'border-red-600 text-red-500'
                                }`}
                              >
                                Stock: {producto.stock}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Footer Info */}
        <Card className="glass-hover border-slate-700 mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-slate-400">
              <p>Total de productos: <span className="text-emerald-500 font-semibold">{productosFiltrados.length}</span></p>
              <p className="mt-2 text-xs">Este menú es solo para consulta del staff</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
