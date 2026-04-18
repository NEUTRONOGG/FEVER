'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, ShoppingCart, Plus, Minus, Search, LogOut, CheckCircle, AlertCircle, Utensils } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
  disponible: boolean
  descripcion?: string
}

interface ItemPedido {
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
}

export default function RPPedidosPage() {
  const router = useRouter()
  const [rpNombre, setRpNombre] = useState('')
  const [miMesa, setMiMesa] = useState<any>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedido, setPedido] = useState<ItemPedido[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [mensajeTipo, setMensajeTipo] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const rpData = localStorage.getItem('rpNombre')
    if (!rpData) {
      router.push('/dashboard/rp-login')
      return
    }

    setRpNombre(rpData)
    cargarDatos(rpData)
  }, [router])

  const cargarDatos = async (rp: string) => {
    try {
      // Buscar la mesa del RP
      const { data: mesasData } = await supabase
        .from('mesas_clientes')
        .select('*, mesas(numero)')
        .eq('rp_nombre', rp)
        .eq('estado', 'ocupada')
        .single()

      if (mesasData) {
        setMiMesa(mesasData)
      }

      // Cargar productos
      const { data: productosData } = await supabase
        .from('productos')
        .select('*')
        .eq('disponible', true)
        .order('categoria, nombre')

      if (productosData) setProductos(productosData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleAgregarProducto = (producto: Producto) => {
    const itemExistente = pedido.find(item => item.producto_id === producto.id)
    
    if (itemExistente) {
      setPedido(pedido.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setPedido([...pedido, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }])
    }
  }

  const handleCambiarCantidad = (productoId: string, delta: number) => {
    setPedido(pedido.map(item => {
      if (item.producto_id === productoId) {
        const nuevaCantidad = item.cantidad + delta
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item
      }
      return item
    }).filter(item => item.cantidad > 0))
  }

  const handleRegistrarPedido = async () => {
    if (!miMesa || pedido.length === 0) {
      setMensaje('No hay productos en el pedido')
      setMensajeTipo('error')
      setTimeout(() => setMensaje(''), 3000)
      return
    }

    setLoading(true)
    setMensaje('')

    try {
      const subtotal = pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)

      // Crear ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          mesa_numero: miMesa.mesas.numero,
          productos: pedido,
          subtotal: subtotal,
          total: subtotal,
          mesero: rpNombre,
          hostess: miMesa.hostess || 'N/A'
        })

      if (ticketError) throw ticketError

      setMensaje('✅ Pedido registrado exitosamente')
      setMensajeTipo('success')
      setPedido([])
      
      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setMensaje('Error al registrar pedido')
      setMensajeTipo('error')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = () => {
    return pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const categorias = Array.from(new Set(productos.map(p => p.categoria)))

  const handleLogout = () => {
    router.push('/dashboard/rp')
  }

  if (!miMesa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur-xl max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No tienes mesa asignada
            </h2>
            <p className="text-purple-200 mb-6">
              Necesitas tener una mesa ocupada para registrar pedidos
            </p>
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Registrar Pedido - {rpNombre}
              </h1>
              <p className="text-purple-200 text-sm">
                Mesa {miMesa.mesas.numero} • Cliente: {miMesa.cliente_nombre || 'N/A'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-purple-400/30 text-purple-100 hover:bg-purple-800/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            mensajeTipo === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {mensajeTipo === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{mensaje}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Panel de Productos */}
          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Menú Disponible
              </CardTitle>
              <CardDescription className="text-purple-200">
                Selecciona los productos para tu mesa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Buscar productos..."
                  className="pl-10 bg-purple-950/50 border-purple-500/30 text-white"
                />
              </div>

              <ScrollArea className="h-[500px]">
                {categorias.map(categoria => {
                  const productosCategoria = productosFiltrados.filter(p => p.categoria === categoria)
                  if (productosCategoria.length === 0) return null

                  return (
                    <div key={categoria} className="mb-6">
                      <h3 className="text-lg font-semibold text-purple-200 mb-3">
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </h3>
                      <div className="space-y-2">
                        {productosCategoria.map(producto => (
                          <Button
                            key={producto.id}
                            onClick={() => handleAgregarProducto(producto)}
                            className="w-full justify-between bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 h-auto py-3"
                          >
                            <div className="text-left">
                              <p className="font-semibold">{producto.nombre}</p>
                              {producto.descripcion && (
                                <p className="text-xs text-purple-300 mt-1">{producto.descripcion}</p>
                              )}
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">
                              ${producto.precio}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Panel de Pedido */}
          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Tu Pedido
              </CardTitle>
              <CardDescription className="text-purple-200">
                {pedido.length} producto{pedido.length !== 1 ? 's' : ''} agregado{pedido.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pedido.length === 0 ? (
                <div className="text-center py-12 text-purple-300">
                  <Utensils className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No hay productos en el pedido</p>
                  <p className="text-sm text-purple-400 mt-2">
                    Selecciona productos del menú
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {pedido.map(item => (
                        <div
                          key={item.producto_id}
                          className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-semibold text-white">{item.nombre}</span>
                            <span className="text-emerald-400 font-bold">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-300">
                              ${item.precio} c/u
                            </span>
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCambiarCantidad(item.producto_id, -1)}
                                className="h-8 w-8 p-0 border-purple-500/30"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-bold text-white">
                                {item.cantidad}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCambiarCantidad(item.producto_id, 1)}
                                className="h-8 w-8 p-0 border-purple-500/30"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">TOTAL</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        ${calcularTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleRegistrarPedido}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold h-12"
                  >
                    {loading ? 'Registrando...' : 'Registrar Pedido'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
