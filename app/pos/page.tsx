"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  ShoppingCart,
  DollarSign,
  LogOut,
  UserPlus,
  Trash2,
  Plus,
  Minus,
  Search,
  Receipt,
} from "lucide-react"
import type { Cliente, ItemPedido, Producto } from "@/lib/types"
import { getProductos, COLORES_CLIENTES, registrarVenta, actualizarMesa, liberarMesa } from "@/lib/data"
import { EncuestaSatisfaccion } from "@/components/encuesta-satisfaccion"

interface Mesa {
  id: number
  numero: string
  clientes: Cliente[]
  pedidos: ItemPedido[]
  mesero?: string
}

export default function POSPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [mesaActual, setMesaActual] = useState<Mesa | null>(null)
  const [dialogCliente, setDialogCliente] = useState(false)
  const [dialogProductos, setDialogProductos] = useState(false)
  const [dialogCuenta, setDialogCuenta] = useState(false)
  const [dialogEncuesta, setDialogEncuesta] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState("")
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [busquedaProducto, setBusquedaProducto] = useState("")

  // Productos disponibles (cargados desde el sistema centralizado)
  const [productos, setProductos] = useState<Producto[]>([])

  // Cargar productos al montar el componente
  useEffect(() => {
    setProductos(getProductos())
  }, [])

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (role !== "mesero") {
      router.push("/login")
      return
    }

    setUserName(name || "Mesero")
  }, [router])

  const handleSeleccionarMesa = (numeroMesa: string) => {
    // Buscar si la mesa ya tiene datos guardados
    const mesaGuardada = localStorage.getItem(`mesa_${numeroMesa}`)
    if (mesaGuardada) {
      setMesaActual(JSON.parse(mesaGuardada))
    } else {
      const nuevaMesa = {
        id: parseInt(numeroMesa),
        numero: numeroMesa,
        clientes: [],
        pedidos: [],
        mesero: userName,
      }
      setMesaActual(nuevaMesa)
      actualizarMesa(nuevaMesa)
    }
  }

  const handleAgregarCliente = () => {
    if (!nuevoCliente.trim() || !mesaActual) return

    const nuevoClienteObj: Cliente = {
      id: Date.now().toString(),
      nombre: nuevoCliente.trim(),
      color: COLORES_CLIENTES[mesaActual.clientes.length % COLORES_CLIENTES.length],
    }

    const mesaActualizada = {
      ...mesaActual,
      clientes: [...mesaActual.clientes, nuevoClienteObj],
    }

    setMesaActual(mesaActualizada)
    actualizarMesa(mesaActualizada)
    setNuevoCliente("")
    setDialogCliente(false)
  }

  const handleEliminarCliente = (clienteId: string) => {
    if (!mesaActual) return

    const mesaActualizada = {
      ...mesaActual,
      clientes: mesaActual.clientes.filter((c) => c.id !== clienteId),
      pedidos: mesaActual.pedidos.filter((p) => p.clienteId !== clienteId),
    }

    setMesaActual(mesaActualizada)
    actualizarMesa(mesaActualizada)
  }

  const handleAgregarProducto = (producto: Producto) => {
    if (!clienteSeleccionado || !mesaActual) return

    const itemExistente = mesaActual.pedidos.find(
      (p) => p.productoId === producto.id && p.clienteId === clienteSeleccionado.id,
    )

    let mesaActualizada: Mesa

    if (itemExistente) {
      mesaActualizada = {
        ...mesaActual,
        pedidos: mesaActual.pedidos.map((p) =>
          p.id === itemExistente.id ? { ...p, cantidad: p.cantidad + 1 } : p,
        ),
      }
    } else {
      const nuevoItem: ItemPedido = {
        id: Date.now().toString(),
        productoId: producto.id,
        producto: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        clienteId: clienteSeleccionado.id,
      }
      mesaActualizada = {
        ...mesaActual,
        pedidos: [...mesaActual.pedidos, nuevoItem],
      }
    }

    setMesaActual(mesaActualizada)
    actualizarMesa(mesaActualizada)
  }

  const handleCambiarCantidad = (itemId: string, delta: number) => {
    if (!mesaActual) return

    const mesaActualizada = {
      ...mesaActual,
      pedidos: mesaActual.pedidos
        .map((p) => {
          if (p.id === itemId) {
            const nuevaCantidad = p.cantidad + delta
            return nuevaCantidad > 0 ? { ...p, cantidad: nuevaCantidad } : null
          }
          return p
        })
        .filter((p) => p !== null) as ItemPedido[],
    }

    setMesaActual(mesaActualizada)
    actualizarMesa(mesaActualizada)
  }

  const calcularTotalCliente = (clienteId: string) => {
    if (!mesaActual) return 0
    return mesaActual.pedidos
      .filter((p) => p.clienteId === clienteId)
      .reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  }

  const calcularTotalMesa = () => {
    if (!mesaActual) return 0
    return mesaActual.pedidos.reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  }

  const handleCerrarMesa = async () => {
    if (!mesaActual) return

    // Registrar la venta en el sistema
    const venta = {
      id: Date.now().toString(),
      mesaId: mesaActual.id,
      mesaNumero: mesaActual.numero,
      mesero: userName,
      fecha: new Date().toISOString(),
      clientes: mesaActual.clientes.map((cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        total: calcularTotalCliente(cliente.id),
        items: mesaActual.pedidos.filter((p) => p.clienteId === cliente.id),
      })),
      total: calcularTotalMesa(),
      estado: "pagada" as const,
    }

    await registrarVenta(venta)

    // Liberar la mesa (localStorage + Supabase)
    await liberarMesa(mesaActual.numero)
    
    // Recargar productos para reflejar el inventario actualizado
    setProductos(getProductos())
    
    setDialogCuenta(false)
    
    // Abrir encuesta de satisfacción
    setDialogEncuesta(true)
  }

  const handleEncuestaCompletada = async (encuesta: any) => {
    // Guardar encuesta en Supabase
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('encuestas').insert({
        mesa_numero: encuesta.mesaNumero,
        mesero: encuesta.mesero,
        respuestas: encuesta.respuestas,
        promedio: encuesta.promedioGeneral,
        recompensa_otorgada: encuesta.recompensaOtorgada,
      })
      console.log('✅ Encuesta guardada')
    } catch (error) {
      console.log('Error guardando encuesta:', error)
    }
    
    // Cerrar todo y volver a selección de mesas
    setMesaActual(null)
    setDialogEncuesta(false)
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()),
  )

  const categorias = Array.from(new Set(productos.map((p) => p.categoria)))

  if (!mesaActual) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-50">POS - Sistema de Ventas</h1>
              <p className="text-slate-400 mt-1">Mesero: {userName}</p>
            </div>
            <Button
              onClick={() => {
                localStorage.clear()
                router.push("/login")
              }}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-50">Selecciona una Mesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleSeleccionarMesa(num.toString())}
                    className="h-24 text-2xl font-bold bg-slate-800 hover:bg-blue-500 border-2 border-slate-700 hover:border-blue-400"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setMesaActual(null)}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              ← Cambiar Mesa
            </Button>
            <div>
              <h2 className="text-xl font-bold text-slate-50">Mesa {mesaActual.numero}</h2>
              <p className="text-sm text-slate-400">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Total Mesa</p>
              <p className="text-2xl font-bold text-amber-500">${calcularTotalMesa().toFixed(2)}</p>
            </div>
            <Button
              onClick={() => setDialogCuenta(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
              disabled={mesaActual.pedidos.length === 0}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Ver Cuenta
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Panel de Clientes */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-50 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Clientes en la Mesa
                </CardTitle>
                <Button onClick={() => setDialogCliente(true)} size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mesaActual.clientes.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">No hay clientes registrados</p>
                  <p className="text-sm text-slate-500 mt-2">Agrega clientes para empezar a tomar pedidos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mesaActual.clientes.map((cliente) => {
                    const total = calcularTotalCliente(cliente.id)
                    const itemsCount = mesaActual.pedidos.filter((p) => p.clienteId === cliente.id).length

                    return (
                      <div
                        key={cliente.id}
                        className={`p-4 rounded-lg border-2 ${
                          clienteSeleccionado?.id === cliente.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 bg-slate-800"
                        } cursor-pointer hover:border-blue-400 transition-colors`}
                        onClick={() => {
                          setClienteSeleccionado(cliente)
                          setDialogProductos(true)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${cliente.color} flex items-center justify-center`}>
                              <span className="text-white font-bold text-lg">{cliente.nombre[0].toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-50">{cliente.nombre}</p>
                              <p className="text-sm text-slate-400">{itemsCount} productos</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-50">${total.toFixed(2)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEliminarCliente(cliente.id)
                              }}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Items del cliente */}
                        {itemsCount > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                            {mesaActual.pedidos
                              .filter((p) => p.clienteId === cliente.id)
                              .map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-300">
                                    {item.cantidad}x {item.producto}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">${(item.precio * item.cantidad).toFixed(2)}</span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCambiarCantidad(item.id, -1)
                                        }}
                                        className="h-6 w-6 p-0 border-slate-600"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCambiarCantidad(item.id, 1)
                                        }}
                                        className="h-6 w-6 p-0 border-slate-600"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de Resumen */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mesaActual.pedidos.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">No hay productos en el pedido</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {mesaActual.clientes.map((cliente) => {
                      const pedidosCliente = mesaActual.pedidos.filter((p) => p.clienteId === cliente.id)
                      if (pedidosCliente.length === 0) return null

                      return (
                        <div key={cliente.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${cliente.color}`} />
                            <span className="font-semibold text-slate-50">{cliente.nombre}</span>
                          </div>
                          <div className="ml-8 space-y-2">
                            {pedidosCliente.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">
                                  {item.cantidad}x {item.producto}
                                </span>
                                <span className="text-slate-400">${(item.precio * item.cantidad).toFixed(2)}</span>
                              </div>
                            ))}
                            <Separator className="bg-slate-700" />
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-300">Subtotal</span>
                              <span className="text-slate-50">${calcularTotalCliente(cliente.id).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <Separator className="bg-slate-600 my-4" />

                    <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-slate-50">Total Mesa</span>
                        <span className="text-2xl font-bold text-amber-500">${calcularTotalMesa().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Agregar Cliente */}
      <Dialog open={dialogCliente} onOpenChange={setDialogCliente}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Cliente</Label>
              <Input
                value={nuevoCliente}
                onChange={(e) => setNuevoCliente(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="bg-slate-800 border-slate-700 text-slate-100"
                onKeyPress={(e) => e.key === "Enter" && handleAgregarCliente()}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAgregarCliente} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Agregar
              </Button>
              <Button variant="outline" onClick={() => setDialogCliente(false)} className="border-slate-700">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Productos */}
      <Dialog open={dialogProductos} onOpenChange={setDialogProductos}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Agregar Productos
              {clienteSeleccionado && (
                <Badge className={`${clienteSeleccionado.color} text-white`}>{clienteSeleccionado.nombre}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                placeholder="Buscar productos..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <ScrollArea className="h-[500px]">
              {categorias.map((categoria) => {
                const productosCategoria = productosFiltrados.filter((p) => p.categoria === categoria)
                if (productosCategoria.length === 0) return null

                return (
                  <div key={categoria} className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-50 mb-3">{categoria}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {productosCategoria.map((producto) => (
                        <Button
                          key={producto.id}
                          onClick={() => handleAgregarProducto(producto)}
                          className="h-auto p-4 bg-slate-800 hover:bg-blue-500 border-2 border-slate-700 hover:border-blue-400 flex flex-col items-start"
                        >
                          <span className="font-semibold text-slate-50">{producto.nombre}</span>
                          <span className="text-lg font-bold text-amber-500">${producto.precio}</span>
                          <span className="text-xs text-slate-400">Stock: {producto.stock}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Cuenta */}
      <Dialog open={dialogCuenta} onOpenChange={setDialogCuenta}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cuenta - Mesa {mesaActual.numero}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {mesaActual.clientes.map((cliente) => {
                const pedidosCliente = mesaActual.pedidos.filter((p) => p.clienteId === cliente.id)
                if (pedidosCliente.length === 0) return null

                return (
                  <div key={cliente.id} className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full ${cliente.color}`} />
                      <span className="font-bold text-slate-50">{cliente.nombre}</span>
                    </div>
                    <div className="space-y-2 ml-10">
                      {pedidosCliente.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.cantidad}x {item.producto}
                          </span>
                          <span className="text-slate-400">${(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator className="bg-slate-600 my-2" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-200">Total {cliente.nombre}</span>
                        <span className="text-amber-500">${calcularTotalCliente(cliente.id).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-slate-50">TOTAL MESA</span>
                  <span className="text-3xl font-bold text-amber-500">${calcularTotalMesa().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleCerrarMesa} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
              Cerrar Mesa y Registrar Venta
            </Button>
            <Button variant="outline" onClick={() => setDialogCuenta(false)} className="border-slate-700">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Encuesta de Satisfacción */}
      {mesaActual && (
        <EncuestaSatisfaccion
          open={dialogEncuesta}
          onClose={() => {
            setDialogEncuesta(false)
            setMesaActual(null)
          }}
          mesaNumero={mesaActual.numero}
          mesero={userName}
          onComplete={handleEncuestaCompletada}
        />
      )}
    </div>
  )
}
