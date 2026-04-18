"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
  Plus,
  Edit,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Movimiento {
  id: number
  productoId: number
  tipo: "entrada" | "salida"
  cantidad: number
  motivo: string
  fecha: string
  usuario: string
}

export default function InventarioPage() {
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos")
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null)
  const [dialogMovimiento, setDialogMovimiento] = useState(false)
  const [dialogEditar, setDialogEditar] = useState(false)
  const [dialogHistorial, setDialogHistorial] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">("entrada")
  const [cantidadMovimiento, setCantidadMovimiento] = useState("")
  const [motivoMovimiento, setMotivoMovimiento] = useState("")

  const [productos, setProductos] = useState<any[]>([])
  
  useEffect(() => {
    cargarProductos()
    const handleStockActualizado = () => { cargarProductos() }
    window.addEventListener('stock-actualizado', handleStockActualizado)
    window.addEventListener('venta-registrada', handleStockActualizado)
    return () => {
      window.removeEventListener('stock-actualizado', handleStockActualizado)
      window.removeEventListener('venta-registrada', handleStockActualizado)
    }
  }, [])
  
  async function cargarProductos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('categoria, nombre')
      if (!error && data) {
        // Normalize to expected shape
        const normalized = data.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: p.precio_venta ?? p.precio ?? 0,
          precioVenta: p.precio_venta ?? p.precio ?? 0,
          precioCompra: p.precio_compra ?? 0,
          stock: p.stock ?? 0,
          stockMinimo: p.stock_minimo ?? p.stockMinimo ?? 5,
          unidad: p.unidad ?? 'unidades',
          proveedor: p.proveedor ?? '-',
        }))
        setProductos(normalized)
      }
    } catch (e) {
      console.error('Error cargando productos:', e)
    }
  }

  const movimientos: Movimiento[] = [
    {
      id: 1,
      productoId: 1,
      tipo: "salida",
      cantidad: 16,
      motivo: "Venta del día",
      fecha: "2025-02-10 18:30",
      usuario: "Carlos",
    },
    {
      id: 2,
      productoId: 1,
      tipo: "entrada",
      cantidad: 24,
      motivo: "Compra a proveedor",
      fecha: "2025-02-09 10:00",
      usuario: "Gerente",
    },
    {
      id: 3,
      productoId: 3,
      tipo: "salida",
      cantidad: 2,
      motivo: "Preparación de bebidas",
      fecha: "2025-02-10 16:00",
      usuario: "Ana",
    },
  ]

  const categorias = ["Todos", ...Array.from(new Set(productos.map((p) => p.categoria)))]

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria = categoriaFiltro === "Todos" || p.categoria === categoriaFiltro
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  const productosConAlerta = productos.filter((p) => p.stock <= p.stockMinimo)
  const valorTotalInventario = productos.reduce((acc, p) => acc + p.stock * p.precioCompra, 0)

  const getEstadoStock = (producto: any) => {
    const porcentaje = (producto.stock / producto.stockMinimo) * 100
    if (porcentaje <= 50) return { color: "text-red-500", bg: "bg-red-500/10", label: "Crítico" }
    if (porcentaje <= 100) return { color: "text-amber-500", bg: "bg-amber-500/10", label: "Bajo" }
    return { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Normal" }
  }

  const handleAbrirMovimiento = (producto: any) => {
    setProductoSeleccionado(producto)
    setDialogMovimiento(true)
  }

  const handleAbrirEditar = (producto: any) => {
    setProductoSeleccionado(producto)
    setDialogEditar(true)
  }

  const handleAbrirHistorial = (producto: any) => {
    setProductoSeleccionado(producto)
    setDialogHistorial(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Gestión de Inventario</h1>
        <p className="text-slate-400 mt-1">Control de stock y movimientos de productos</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Productos</p>
                <p className="text-2xl font-bold text-slate-50">{productos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Alertas de Stock</p>
                <p className="text-2xl font-bold text-slate-50">{productosConAlerta.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Valor Inventario</p>
                <p className="text-2xl font-bold text-slate-50">${valorTotalInventario.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Movimientos Hoy</p>
                <p className="text-2xl font-bold text-slate-50">23</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <History className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {productosConAlerta.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {productosConAlerta.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800"
                >
                  <div>
                    <p className="font-medium text-slate-200">{producto.nombre}</p>
                    <p className="text-sm text-slate-400">
                      Stock actual: {producto.stock} {producto.unidad} (Mínimo: {producto.stockMinimo})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAbrirMovimiento(producto)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    Reabastecer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-800 text-slate-100">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-slate-100">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de Productos */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800">
                <tr className="text-left">
                  <th className="p-4 text-sm font-semibold text-slate-400">Producto</th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Categoría</th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Stock</th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Estado</th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Proveedor</th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => {
                  const estado = getEstadoStock(producto)
                  return (
                    <tr key={producto.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-slate-200">{producto.nombre}</p>
                          <p className="text-xs text-slate-500">
                            ${producto.precioCompra} / ${producto.precioVenta}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-slate-800 text-slate-300">{producto.categoria}</Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-200 font-semibold">
                          {producto.stock} {producto.unidad}
                        </p>
                        <p className="text-xs text-slate-500">Mín: {producto.stockMinimo}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={`${estado.bg} ${estado.color}`}>{estado.label}</Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-300">{producto.proveedor}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAbrirMovimiento(producto)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAbrirHistorial(producto)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAbrirEditar(producto)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Movimiento */}
      <Dialog open={dialogMovimiento} onOpenChange={setDialogMovimiento}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50">
          {productoSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Registrar Movimiento</DialogTitle>
                <p className="text-slate-400">{productoSeleccionado.nombre}</p>
              </DialogHeader>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                if (!productoSeleccionado || !cantidadMovimiento) return
                try {
                  const { supabase } = await import('@/lib/supabase')
                  const cantidad = parseInt(cantidadMovimiento)
                  const nuevoStock = tipoMovimiento === 'entrada'
                    ? (productoSeleccionado.stock + cantidad)
                    : Math.max(0, productoSeleccionado.stock - cantidad)
                  await supabase.from('productos').update({ stock: nuevoStock }).eq('id', productoSeleccionado.id)
                  await cargarProductos()
                } catch (err) { console.error(err) }
                setDialogMovimiento(false)
                setCantidadMovimiento('')
                setMotivoMovimiento('')
                setTipoMovimiento('entrada')
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Tipo de Movimiento</Label>
                    <Select value={tipoMovimiento} onValueChange={(value: "entrada" | "salida") => setTipoMovimiento(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="entrada" className="text-slate-100">
                          <div className="flex items-center gap-2">
                            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                            Entrada
                          </div>
                        </SelectItem>
                        <SelectItem value="salida" className="text-slate-100">
                          <div className="flex items-center gap-2">
                            <ArrowDownCircle className="w-4 h-4 text-red-500" />
                            Salida
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Cantidad</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={cantidadMovimiento}
                      onChange={(e) => setCantidadMovimiento(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Motivo</Label>
                  <Input
                    placeholder="Ej: Compra a proveedor"
                    value={motivoMovimiento}
                    onChange={(e) => setMotivoMovimiento(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900">
                    Registrar Movimiento
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogMovimiento(false)
                      setCantidadMovimiento("")
                      setMotivoMovimiento("")
                      setTipoMovimiento("entrada")
                    }}
                    className="border-slate-700 text-slate-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Historial */}
      <Dialog open={dialogHistorial} onOpenChange={setDialogHistorial}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-2xl max-h-[90vh] overflow-y-auto">
          {productoSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Historial de Movimientos</DialogTitle>
                <p className="text-slate-400">{productoSeleccionado.nombre}</p>
              </DialogHeader>

              <div className="space-y-3">
                {movimientos
                  .filter((m) => m.productoId === productoSeleccionado.id)
                  .map((mov) => (
                    <div
                      key={mov.id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-slate-800 border border-slate-700"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          mov.tipo === "entrada" ? "bg-emerald-500/10" : "bg-red-500/10"
                        }`}
                      >
                        {mov.tipo === "entrada" ? (
                          <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-200 capitalize">{mov.tipo}</p>
                            <p className="text-sm text-slate-400">{mov.motivo}</p>
                          </div>
                          <span
                            className={`font-semibold ${mov.tipo === "entrada" ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {mov.tipo === "entrada" ? "+" : "-"}
                            {mov.cantidad}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{mov.fecha}</span>
                          <span>•</span>
                          <span>{mov.usuario}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
