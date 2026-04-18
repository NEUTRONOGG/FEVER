"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Plus, Minus, Trash2, ShoppingCart, DollarSign,
  Users, Search, Receipt, Check
} from "lucide-react"
import { obtenerMesas, actualizarPedidosMesa, crearTicket } from "@/lib/supabase-clientes"
import { getProductos } from "@/lib/data"

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria: string
}

interface ItemPedido {
  id: number
  producto: string
  precio: number
  cantidad: number
}

export default function POSPage() {
  const [mesas, setMesas] = useState<any[]>([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState<any | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos")
  const [busqueda, setBusqueda] = useState("")
  const [pedido, setPedido] = useState<ItemPedido[]>([])
  const [dialogConfirmar, setDialogConfirmar] = useState(false)

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 10000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    const [mesasData, productosData] = await Promise.all([
      obtenerMesas(),
      getProductos()
    ])
    
    // Solo mesas ocupadas con clientes
    const mesasOcupadas = mesasData.filter(m => m.estado === 'ocupada' && m.cliente_nombre)
    setMesas(mesasOcupadas)
    setProductos(productosData)
  }

  const categorias = ["Todos", ...Array.from(new Set(productos.map(p => p.categoria)))]

  const productosFiltrados = productos.filter(p => {
    const matchCategoria = categoriaFiltro === "Todos" || p.categoria === categoriaFiltro
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  const agregarAlPedido = (producto: Producto) => {
    const itemExistente = pedido.find(item => item.id === producto.id)
    
    if (itemExistente) {
      setPedido(pedido.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setPedido([...pedido, {
        id: producto.id,
        producto: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }])
    }
  }

  const actualizarCantidad = (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      setPedido(pedido.filter(item => item.id !== id))
    } else {
      setPedido(pedido.map(item =>
        item.id === id ? { ...item, cantidad } : item
      ))
    }
  }

  const eliminarItem = (id: number) => {
    setPedido(pedido.filter(item => item.id !== id))
  }

  const calcularTotal = () => {
    return pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  }

  const handleEnviarPedido = async () => {
    if (!mesaSeleccionada || pedido.length === 0) return

    try {
      // Obtener pedidos actuales de la mesa
      const pedidosActuales = mesaSeleccionada.pedidos_data || []
      const nuevosPedidos = [...pedidosActuales, ...pedido]
      const nuevoTotal = (mesaSeleccionada.total_actual || 0) + calcularTotal()

      // Actualizar mesa en Supabase
      await actualizarPedidosMesa(mesaSeleccionada.id, nuevosPedidos, nuevoTotal)

      // Limpiar pedido
      setPedido([])
      
      // Recargar datos
      await cargarDatos()
      
      // Notificar
      alert(`Pedido enviado a ${mesaSeleccionada.numero} - ${mesaSeleccionada.cliente_nombre}`)
    } catch (error) {
      console.error('Error al enviar pedido:', error)
      alert('Error al enviar el pedido')
    }
  }

  const handleCerrarCuenta = async () => {
    if (!mesaSeleccionada) return

    try {
      // Crear ticket en Supabase
      await crearTicket({
        cliente_id: mesaSeleccionada.cliente_id,
        visita_id: undefined, // Se puede vincular con la visita
        mesa_numero: parseInt(mesaSeleccionada.numero),
        productos: mesaSeleccionada.pedidos_data || [],
        subtotal: mesaSeleccionada.total_actual || 0,
        descuento: 0,
        propina: 0,
        total: mesaSeleccionada.total_actual || 0,
        metodo_pago: 'efectivo',
        mesero: mesaSeleccionada.mesero || 'N/A',
        hostess: mesaSeleccionada.hostess || 'N/A'
      })

      setDialogConfirmar(false)
      alert(`Cuenta cerrada: $${(mesaSeleccionada.total_actual || 0).toFixed(2)}`)
      
      // Aquí deberías liberar la mesa también
      await cargarDatos()
    } catch (error) {
      console.error('Error al cerrar cuenta:', error)
      alert('Error al cerrar la cuenta')
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="px-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50 glow-amber">Punto de Venta (POS)</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Registra pedidos y consumos por cliente</p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Panel Izquierdo - Mesas */}
        <div className="md:col-span-1">
          <Card className="glass-hover border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50">Mesas Ocupadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] md:h-[500px] lg:h-[600px]">
                <div className="space-y-3">
                  {mesas.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-700 mx-auto mb-3 md:mb-4" />
                      <p className="text-sm md:text-base text-slate-400">No hay mesas ocupadas</p>
                    </div>
                  ) : (
                    mesas.map((mesa) => (
                      <div
                        key={mesa.id}
                        onClick={() => setMesaSeleccionada(mesa)}
                        className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                          mesaSeleccionada?.id === mesa.id
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500'
                            : 'glass hover:bg-slate-800/50 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <Badge className="bg-blue-500/20 text-blue-500 mb-1 md:mb-2 text-xs">
                              Mesa {mesa.numero}
                            </Badge>
                            <p className="font-semibold text-slate-200 text-sm md:text-base truncate">{mesa.cliente_nombre}</p>
                            <p className="text-xs text-slate-400">
                              {mesa.numero_personas} personas
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-base md:text-lg font-bold text-emerald-500">
                              ${(mesa.total_actual || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(mesa.pedidos_data || []).length} items
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Panel Central - Productos */}
        <div className="md:col-span-1">
          <Card className="glass-hover border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50">Productos</CardTitle>
              <div className="space-y-2 md:space-y-3 mt-3 md:mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 h-10 md:h-auto text-sm md:text-base"
                  />
                </div>
                <div className="flex gap-1.5 md:gap-2 flex-wrap">
                  {categorias.map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={categoriaFiltro === cat ? "default" : "outline"}
                      onClick={() => setCategoriaFiltro(cat)}
                      className={`text-xs md:text-sm h-8 md:h-9 px-2 md:px-3 ${categoriaFiltro === cat ? "bg-amber-500" : "border-slate-700"}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] md:h-[400px] lg:h-[500px]">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      onClick={() => mesaSeleccionada && agregarAlPedido(producto)}
                      className={`p-2 md:p-3 lg:p-4 rounded-xl text-center cursor-pointer transition-all active:scale-95 ${
                        mesaSeleccionada
                          ? 'glass hover:bg-slate-800/50 border border-slate-700 hover:border-amber-500'
                          : 'glass opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <p className="font-semibold text-slate-200 mb-1 text-xs md:text-sm line-clamp-2">{producto.nombre}</p>
                      <p className="text-base md:text-lg font-bold text-emerald-500">${producto.precio}</p>
                      <Badge className="text-[10px] md:text-xs mt-1 md:mt-2" variant="outline">
                        {producto.categoria}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Panel Derecho - Pedido Actual */}
        <div className="md:col-span-2 lg:col-span-1">
          <Card className="glass-hover border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                Pedido Actual
              </CardTitle>
              {mesaSeleccionada && (
                <div className="mt-2">
                  <Badge className="bg-blue-500/20 text-blue-500 text-xs">
                    Mesa {mesaSeleccionada.numero}
                  </Badge>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 truncate">{mesaSeleccionada.cliente_nombre}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] md:h-[350px] lg:h-[400px] mb-3 md:mb-4">
                {pedido.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-slate-700 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-slate-400">Selecciona productos</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {pedido.map((item) => (
                      <div key={item.id} className="glass rounded-xl p-2 md:p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-200 text-sm md:text-base truncate">{item.producto}</p>
                            <p className="text-xs md:text-sm text-slate-400">${item.precio} c/u</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => eliminarItem(item.id)}
                            className="text-red-500 hover:text-red-400 h-8 w-8 p-0 ml-1"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              className="h-8 w-8 md:h-9 md:w-9 p-0 border-slate-700"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-slate-200 font-semibold w-8 text-center text-sm md:text-base">
                              {item.cantidad}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                              className="h-8 w-8 md:h-9 md:w-9 p-0 border-slate-700"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-base md:text-lg font-bold text-emerald-500">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <Separator className="my-3 md:my-4 bg-slate-700" />

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between text-base md:text-lg">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-bold text-slate-50 text-lg md:text-xl">${calcularTotal().toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleEnviarPedido}
                  disabled={!mesaSeleccionada || pedido.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-11 md:h-12 text-sm md:text-base"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Enviar Pedido
                </Button>

                {mesaSeleccionada && mesaSeleccionada.total_actual > 0 && (
                  <Button
                    onClick={() => setDialogConfirmar(true)}
                    variant="outline"
                    className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/10 h-11 md:h-12 text-sm md:text-base"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Cerrar Cuenta (${(mesaSeleccionada.total_actual || 0).toFixed(2)})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Confirmar Cierre */}
      <Dialog open={dialogConfirmar} onOpenChange={setDialogConfirmar}>
        <DialogContent className="bg-slate-900 border-slate-800 w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl text-slate-50">Cerrar Cuenta</DialogTitle>
          </DialogHeader>
          {mesaSeleccionada && (
            <div className="space-y-3 md:space-y-4">
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs md:text-sm text-slate-400">Mesa</p>
                <p className="text-base md:text-lg font-semibold text-slate-50">Mesa {mesaSeleccionada.numero}</p>
              </div>
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs md:text-sm text-slate-400">Cliente</p>
                <p className="text-base md:text-lg font-semibold text-slate-50">{mesaSeleccionada.cliente_nombre}</p>
              </div>
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs md:text-sm text-slate-400">Total a Pagar</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-500">
                  ${(mesaSeleccionada.total_actual || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2 md:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogConfirmar(false)}
                  className="flex-1 border-slate-700 h-11 md:h-12 text-sm md:text-base"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCerrarCuenta}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 h-11 md:h-12 text-sm md:text-base"
                >
                  Confirmar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
