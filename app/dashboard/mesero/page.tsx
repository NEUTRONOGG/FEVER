"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import {
  Plus, Minus, Trash2, ShoppingCart, Check,
  Users, Search, UtensilsCrossed, DollarSign, Receipt, LayoutGrid, QrCode, X
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { obtenerMesas, actualizarPedidosMesa, crearTicket } from "@/lib/supabase-clientes"
import { getProductos, liberarMesa } from "@/lib/data"

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

export default function MeseroPage() {
  const [mesas, setMesas] = useState<any[]>([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState<any | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos")
  const [busqueda, setBusqueda] = useState("")
  const [pedido, setPedido] = useState<ItemPedido[]>([])
  const [dialogCerrarCuenta, setDialogCerrarCuenta] = useState(false)
  const [mesaCerrar, setMesaCerrar] = useState<any | null>(null)
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [propina, setPropina] = useState(0)
  const [mantenerMesa, setMantenerMesa] = useState(false)
  const [mostrarQRScanner, setMostrarQRScanner] = useState(false)
  const [qrData, setQrData] = useState("")

  const [meseroNombre] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("meseroNombre") || localStorage.getItem("userName") || "Mesero"
    }
    return "Mesero"
  })
  
  const [meseroId] = useState(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem("meseroId")
      return id ? parseInt(id) : null
    }
    return null
  })

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 5000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    const [mesasData, productosData] = await Promise.all([
      obtenerMesas(),
      getProductos()
    ])
    
    // Filtrar solo mesas ocupadas y asignadas a este mesero
    let mesasFiltradas = mesasData.filter(m => m.estado === 'ocupada' && m.cliente_nombre)
    
    // Si hay meseroId, filtrar solo las mesas asignadas a este mesero
    if (meseroId) {
      mesasFiltradas = mesasFiltradas.filter(m => m.mesero_id === meseroId)
    }
    
    setMesas(mesasFiltradas)
    setProductos(productosData)
  }

  async function handleQRScan(data: string) {
    try {
      // El QR debe contener el número de mesa: "MESA-5"
      const mesaNumero = data.replace('MESA-', '')
      
      const { supabase } = await import('@/lib/supabase')
      
      // Buscar la mesa
      const { data: mesaData, error } = await supabase
        .from('mesas')
        .select('*')
        .eq('numero', mesaNumero)
        .single()
      
      if (error || !mesaData) {
        alert('❌ Mesa no encontrada')
        return
      }

      if (mesaData.estado !== 'ocupada') {
        alert('⚠️ Esta mesa no está ocupada')
        return
      }

      // Asignar mesa al mesero si no tiene mesero asignado
      if (!mesaData.mesero_id && meseroId) {
        const { error: updateError } = await supabase
          .from('mesas')
          .update({ mesero_id: meseroId })
          .eq('numero', mesaNumero)
        
        if (updateError) {
          console.error('Error asignando mesero:', updateError)
        }
      }

      // Seleccionar la mesa
      setMesaSeleccionada(mesaData)
      setMostrarQRScanner(false)
      alert(`✅ Mesa ${mesaNumero} - ${mesaData.cliente_nombre}`)
      await cargarDatos()
    } catch (error) {
      console.error('Error escaneando QR:', error)
      alert('❌ Error al escanear el QR')
    }
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
      const pedidosActuales = mesaSeleccionada.pedidos_data || []
      const nuevosPedidos = [...pedidosActuales, ...pedido]
      const nuevoTotal = (mesaSeleccionada.total_actual || 0) + calcularTotal()

      await actualizarPedidosMesa(mesaSeleccionada.id, nuevosPedidos, nuevoTotal)

      setPedido([])
      await cargarDatos()
      
      alert(`✅ Pedido enviado a Mesa ${mesaSeleccionada.numero}`)
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al enviar el pedido')
    }
  }

  const abrirDialogCerrarCuenta = (mesa: any) => {
    setMesaCerrar(mesa)
    setPropina(0)
    setMetodoPago("efectivo")
    setMantenerMesa(false)
    setDialogCerrarCuenta(true)
  }

  const handleCerrarCuenta = async () => {
    if (!mesaCerrar) return

    try {
      const subtotal = mesaCerrar.total_actual || 0
      const totalConPropina = subtotal + propina
      
      // Formatear productos para el ticket
      let productosTexto = 'Consumo registrado'
      if (mesaCerrar.pedidos_data && Array.isArray(mesaCerrar.pedidos_data) && mesaCerrar.pedidos_data.length > 0) {
        productosTexto = mesaCerrar.pedidos_data
          .map((p: any) => `${p.producto || p.nombre || 'Producto'} x${p.cantidad || 1}`)
          .join(', ')
      }

      // 1. BUSCAR O CREAR CLIENTE
      const { supabase } = await import('@/lib/supabase')
      let clienteId = mesaCerrar.cliente_id
      let clienteNombre = mesaCerrar.cliente_nombre || 'Cliente'
      
      // Si no hay cliente_id, buscar por nombre
      if (!clienteId && clienteNombre !== 'Cliente') {
        const { data: clienteExistente } = await supabase
          .from('clientes')
          .select('id')
          .eq('nombre', clienteNombre)
          .single()
        
        if (clienteExistente) {
          clienteId = clienteExistente.id
        } else {
          // Crear cliente nuevo
          const { data: nuevoCliente } = await supabase
            .from('clientes')
            .insert({
              nombre: clienteNombre,
              telefono: mesaCerrar.telefono || null,
              total_visitas: 1,
              consumo_total: totalConPropina,
              primera_visita: new Date().toISOString(),
              nivel_fidelidad: 'bronce',
              activo: true
            })
            .select()
            .single()
          
          if (nuevoCliente) {
            clienteId = nuevoCliente.id
          }
        }
      }
      
      console.log('📝 Creando ticket para cliente:', { clienteId, clienteNombre })

      // 2. CREAR TICKET EN HISTORIAL DE CONSUMOS
      const { data: ticketData, error: errorTicket } = await supabase
        .from('tickets')
        .insert({
          cliente_id: clienteId,
          cliente_nombre: clienteNombre,
          mesa_numero: parseInt(mesaCerrar.numero),
          items: productosTexto,
          total: totalConPropina,
          subtotal: subtotal,
          propina: propina,
          mesero: meseroNombre || 'Mesero',
          metodo_pago: metodoPago,
          fecha: new Date().toISOString()
        })
        .select()
      
      if (errorTicket) {
        console.error('❌ ERROR CREANDO TICKET:', errorTicket)
        alert(`❌ Error al crear ticket: ${errorTicket.message}`)
      } else {
        console.log('✅ Ticket creado:', ticketData)
      }

      // 3. ACTUALIZAR MÉTRICAS DEL CLIENTE (si existe clienteId)
      if (clienteId) {
        const { data: clienteActual } = await supabase
          .from('clientes')
          .select('total_visitas, consumo_total')
          .eq('id', clienteId)
          .single()
        
        if (clienteActual) {
          await supabase
            .from('clientes')
            .update({
              total_visitas: (clienteActual.total_visitas || 0) + 1,
              consumo_total: (clienteActual.consumo_total || 0) + totalConPropina,
              ultima_visita: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', clienteId)
        }
      }

      // 4. LIBERAR O MANTENER MESA
      if (!mantenerMesa) {
        await liberarMesa(mesaCerrar.numero)
      } else {
        await actualizarPedidosMesa(mesaCerrar.id, [], 0)
      }

      setDialogCerrarCuenta(false)
      setMesaCerrar(null)
      await cargarDatos()
      
      alert(`✅ Cuenta cerrada - Total: $${totalConPropina.toFixed(2)}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error?.message || 'Error desconocido'}`)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 glow-amber">Panel Mesero</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Bienvenido, {meseroNombre}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <Button
            onClick={() => setMostrarQRScanner(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 h-10 text-sm flex-1 md:flex-none"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Escanear
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard/selector-rol'}
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 h-10 text-sm flex-1 md:flex-none"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Menú
          </Button>
          <NotificacionesEmergencia />
          <Badge className="bg-blue-500/20 text-blue-500 text-sm md:text-lg px-3 md:px-4 py-1.5 md:py-2 w-full md:w-auto text-center">
            {mesas.length} Mesas
          </Badge>
        </div>
      </div>

      {/* Stats Rápidos */}
      <div className="grid gap-3 md:gap-4 grid-cols-3">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-2 md:px-6">
            <div className="flex flex-col items-center text-center">
              <UtensilsCrossed className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Mesas</p>
              <p className="text-xl md:text-3xl font-bold text-blue-500">{mesas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-2 md:px-6">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Total</p>
              <p className="text-xl md:text-3xl font-bold text-emerald-500">
                ${mesas.reduce((sum, m) => sum + (m.total_actual || 0), 0).toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-2 md:px-6">
            <div className="flex flex-col items-center text-center">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-amber-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Pedido</p>
              <p className="text-xl md:text-3xl font-bold text-amber-500">${calcularTotal().toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Mesas */}
        <div className="md:col-span-1">
          <Card className="glass-hover border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50">Mis Mesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] md:h-[500px] lg:h-[600px]">
                <div className="space-y-2 md:space-y-3">
                  {mesas.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-700 mx-auto mb-3 md:mb-4" />
                      <p className="text-sm md:text-base text-slate-400">No hay mesas asignadas</p>
                    </div>
                  ) : (
                    mesas
                      .sort((a, b) => {
                        // Orden según layout físico del restaurante
                        const orden = ['7', '37', '6', '16', '5', '15', '4', '14', '3', '13', '2', '22', '1', '21', '20', '36', '35', '34', '33', '32', '31', '30', '26', '25', '24', '23', '12', '11', '10']
                        return orden.indexOf(a.numero) - orden.indexOf(b.numero)
                      })
                      .map((mesa) => (
                      <div
                        key={mesa.id}
                        onClick={() => setMesaSeleccionada(mesa)}
                        className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                          mesaSeleccionada?.id === mesa.id
                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500'
                            : 'glass hover:bg-slate-800/50 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <Badge className="bg-blue-500/20 text-blue-500 mb-1 md:mb-2 text-xs">
                              Mesa {mesa.numero}
                            </Badge>
                            <p className="font-semibold text-slate-200 text-sm truncate">{mesa.cliente_nombre}</p>
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
                        
                        {/* Botón Cerrar Cuenta */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirDialogCerrarCuenta(mesa)
                          }}
                          size="sm"
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-9 md:h-10 text-xs md:text-sm"
                        >
                          <Receipt className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                          Cerrar Cuenta
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Productos */}
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
                      className={`text-xs h-8 md:h-9 px-2 md:px-3 ${categoriaFiltro === cat ? "bg-blue-600" : "border-slate-700"}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] md:h-[400px] lg:h-[450px]">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      onClick={() => mesaSeleccionada && agregarAlPedido(producto)}
                      className={`p-2 md:p-3 rounded-xl text-center cursor-pointer transition-all active:scale-95 ${
                        mesaSeleccionada
                          ? 'glass hover:bg-slate-800/50 border border-slate-700 hover:border-blue-500'
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

        {/* Pedido Actual */}
        <div className="md:col-span-2 lg:col-span-1">
          <Card className="glass-hover border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                Pedido
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
              {/* Pedidos ya enviados de la mesa */}
              {mesaSeleccionada && mesaSeleccionada.pedidos_data && Array.isArray(mesaSeleccionada.pedidos_data) && mesaSeleccionada.pedidos_data.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                    <p className="text-xs md:text-sm font-semibold text-emerald-500">Pedidos Enviados</p>
                  </div>
                  <div className="glass rounded-xl p-2 md:p-3 space-y-2 max-h-[120px] md:max-h-[150px] overflow-y-auto">
                    {mesaSeleccionada.pedidos_data.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs md:text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-300 font-medium truncate">{item.producto || item.nombre}</p>
                          <p className="text-xs text-slate-500">x{item.cantidad}</p>
                        </div>
                        <span className="text-emerald-500 font-semibold text-xs md:text-sm ml-2">
                          ${((item.precio || 0) * (item.cantidad || 0)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3 md:my-4 bg-slate-700" />
                </div>
              )}

              {/* Pedido nuevo (por enviar) */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
                  <p className="text-xs md:text-sm font-semibold text-amber-500">Nuevo Pedido</p>
                </div>
              </div>

              <ScrollArea className="h-[200px] md:h-[250px] lg:h-[300px] mb-3 md:mb-4">
                {pedido.length === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-slate-700 mx-auto mb-2 md:mb-3" />
                    <p className="text-slate-400 text-xs md:text-sm">Agrega productos</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {pedido.map((item) => (
                      <div key={item.id} className="glass rounded-xl p-2 md:p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-200 text-xs md:text-sm truncate">{item.producto}</p>
                            <p className="text-xs text-slate-400">${item.precio} c/u</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => eliminarItem(item.id)}
                            className="text-red-500 hover:text-red-400 h-7 w-7 p-0 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              className="h-7 w-7 md:h-8 md:w-8 p-0 border-slate-700"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-slate-200 font-semibold w-6 text-center text-xs md:text-sm">
                              {item.cantidad}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                              className="h-7 w-7 md:h-8 md:w-8 p-0 border-slate-700"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-sm md:text-base font-bold text-emerald-500">
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
                  <span className="text-slate-400">Total:</span>
                  <span className="font-bold text-slate-50 text-xl md:text-2xl">${calcularTotal().toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleEnviarPedido}
                  disabled={!mesaSeleccionada || pedido.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-11 md:h-12 text-sm md:text-base"
                >
                  <Check className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Enviar Pedido
                </Button>

                {!mesaSeleccionada && (
                  <p className="text-xs text-center text-slate-500">
                    Selecciona una mesa para comenzar
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Cerrar Cuenta */}
      <Dialog open={dialogCerrarCuenta} onOpenChange={setDialogCerrarCuenta}>
        <DialogContent className="bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl">
              Cerrar Cuenta - Mesa {mesaCerrar?.numero}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resumen de la cuenta */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="text-slate-200 font-semibold">{mesaCerrar?.cliente_nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Personas:</span>
                <span className="text-slate-200">{mesaCerrar?.numero_personas}</span>
              </div>
            </div>

            {/* Desglose de Productos */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Productos Consumidos
              </Label>
              <div className="glass rounded-xl p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {mesaCerrar?.pedidos_data && Array.isArray(mesaCerrar.pedidos_data) && mesaCerrar.pedidos_data.length > 0 ? (
                  mesaCerrar.pedidos_data.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/50 last:border-0">
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium">{item.producto || item.nombre}</p>
                        <p className="text-xs text-slate-500">x{item.cantidad} • ${item.precio}/u</p>
                      </div>
                      <span className="text-slate-50 font-semibold">
                        ${((item.precio || 0) * (item.cantidad || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 text-sm py-4">Sin productos</p>
                )}
              </div>
            </div>

            {/* Subtotal */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-slate-200 text-lg font-bold">
                  ${(mesaCerrar?.total_actual || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Propina */}
            <div className="space-y-2">
              <Label className="text-slate-300">Propina</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPropina((mesaCerrar?.total_actual || 0) * 0.10)}
                  className="border-slate-700 text-slate-300"
                >
                  10%
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropina((mesaCerrar?.total_actual || 0) * 0.15)}
                  className="border-slate-700 text-slate-300"
                >
                  15%
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropina((mesaCerrar?.total_actual || 0) * 0.20)}
                  className="border-slate-700 text-slate-300"
                >
                  20%
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPropina(0)}
                  className="border-slate-700 text-slate-300"
                >
                  Sin
                </Button>
              </div>
              <Input
                type="number"
                value={propina}
                onChange={(e) => setPropina(parseFloat(e.target.value) || 0)}
                placeholder="Propina personalizada"
                className="bg-slate-800/50 border-slate-700"
              />
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label className="text-slate-300">Método de Pago</Label>
              <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                  <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opción de mantener mesa */}
            <div className="glass rounded-xl p-4 space-y-3">
              <Label className="text-slate-300 text-base">¿Qué hacer con la mesa?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMantenerMesa(false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !mantenerMesa
                      ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500'
                      : 'glass border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-3xl mb-2 ${
                      !mantenerMesa ? 'text-emerald-500' : 'text-slate-400'
                    }`}>🔓</div>
                    <p className={`font-semibold ${
                      !mantenerMesa ? 'text-emerald-500' : 'text-slate-300'
                    }`}>Liberar Mesa</p>
                    <p className="text-xs text-slate-500 mt-1">Mesa disponible</p>
                  </div>
                </button>
                <button
                  onClick={() => setMantenerMesa(true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mantenerMesa
                      ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500'
                      : 'glass border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-3xl mb-2 ${
                      mantenerMesa ? 'text-blue-500' : 'text-slate-400'
                    }`}>🔒</div>
                    <p className={`font-semibold ${
                      mantenerMesa ? 'text-blue-500' : 'text-slate-300'
                    }`}>Mantener Mesa</p>
                    <p className="text-xs text-slate-500 mt-1">Cliente sigue</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total final */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-lg">Total a Pagar:</span>
                <span className="text-emerald-500 text-3xl font-bold">
                  ${((mesaCerrar?.total_actual || 0) + propina).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogCerrarCuenta(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCerrarCuenta}
                className={`flex-1 ${
                  mantenerMesa
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                }`}
              >
                <Receipt className="w-4 h-4 mr-2" />
                {mantenerMesa ? 'Cerrar y Mantener' : 'Cerrar y Liberar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner */}
      {mostrarQRScanner && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md p-6">
            <Button
              onClick={() => setMostrarQRScanner(false)}
              variant="ghost"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              size="icon"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-50 mb-2">Escanear Mesa</h2>
                <p className="text-slate-400">Escanea el código QR de la mesa para atenderla</p>
              </div>

              {/* Input manual como alternativa */}
              <div className="space-y-2">
                <Label className="text-slate-300">O ingresa el código manualmente:</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    placeholder="MESA-5"
                    className="bg-slate-800/50 border-slate-700 text-slate-100"
                  />
                  <Button
                    onClick={() => {
                      if (qrData) {
                        handleQRScan(qrData)
                        setQrData("")
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="glass rounded-lg p-4 border border-blue-500/30">
                <p className="text-sm text-slate-300">
                  💡 <strong>Formato del código:</strong> MESA-[número]
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Ejemplo: MESA-5, MESA-12, etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
