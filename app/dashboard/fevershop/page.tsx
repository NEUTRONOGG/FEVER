"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShoppingCart, Coins, Gift, TrendingUp, Search, Star, Package, Sparkles, Award, ArrowRight, Check, Zap, Plus, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FeverCoin3D from "@/components/FeverCoin3D"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio_fevercoins: number
  categoria: string
  stock: number
  destacado: boolean
}

interface Cliente {
  id: number
  nombre: string
  telefono: string
  puntos_rewards: number
  balance_fevercoins?: number
}

export default function FeverShopPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos")
  const [mostrarSoloDestacados, setMostrarSoloDestacados] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogCompra, setDialogCompra] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [dialogCanje, setDialogCanje] = useState(false)
  const [puntosACanjear, setPuntosACanjear] = useState(100)
  const [stats, setStats] = useState({
    total_clientes: 0,
    coins_circulacion: 0,
    compras_hoy: 0,
    coins_gastados_hoy: 0
  })

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: productosData } = await supabase.from('fevershop_productos').select('*').eq('activo', true).order('destacado', { ascending: false })
      setProductos(productosData || [])
      const { data: statsData } = await supabase.from('vista_fevershop_stats').select('*').single()
      if (statsData) {
        setStats({
          total_clientes: statsData.total_clientes_activos || 0,
          coins_circulacion: statsData.total_fevercoins_circulacion || 0,
          compras_hoy: statsData.compras_hoy || 0,
          coins_gastados_hoy: statsData.coins_gastados_hoy || 0
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function buscarCliente() {
    if (!busquedaCliente.trim()) return
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase.from('clientes').select('id, nombre, telefono, puntos_rewards, fevercoins_balance (balance)').or(`nombre.ilike.%${busquedaCliente}%,telefono.ilike.%${busquedaCliente}%`).eq('activo', true).limit(5)
      const clientesConBalance = (data || []).map(c => ({ ...c, balance_fevercoins: c.fevercoins_balance?.[0]?.balance || 0 }))
      setClientesEncontrados(clientesConBalance)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleComprarProducto() {
    if (!clienteSeleccionado || !productoSeleccionado) return alert('❌ Selecciona un cliente y producto')
    const totalCoins = productoSeleccionado.precio_fevercoins * cantidad
    if ((clienteSeleccionado.balance_fevercoins || 0) < totalCoins) return alert('❌ FeverCoins insuficientes')
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase.rpc('comprar_producto_fevershop', { p_cliente_id: clienteSeleccionado.id, p_producto_id: productoSeleccionado.id, p_cantidad: cantidad })
      if (data?.success) {
        alert(`✅ ${data.message}\n💰 Balance restante: ${data.balance_restante} FeverCoins`)
        setDialogCompra(false)
        setProductoSeleccionado(null)
        setClienteSeleccionado(null)
        setBusquedaCliente("")
        cargarDatos()
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  async function handleCanjearPuntos() {
    if (!clienteSeleccionado) return alert('❌ Selecciona un cliente')
    if (puntosACanjear < 100 || puntosACanjear % 100 !== 0) return alert('❌ Debes canjear mínimo 100 puntos (múltiplos de 100)')
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase.rpc('canjear_puntos_por_fevercoins', { p_cliente_id: clienteSeleccionado.id, p_puntos: puntosACanjear })
      if (data?.success) {
        alert(`✅ ${data.message}`)
        setDialogCanje(false)
        setClienteSeleccionado(null)
        setBusquedaCliente("")
        cargarDatos()
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const categorias = [
    { id: "todos", label: "Todos", icon: Package },
    { id: "bebidas", label: "Bebidas", icon: Sparkles },
    { id: "alimentos", label: "Alimentos", icon: Gift },
    { id: "merchandising", label: "Merchandising", icon: Award },
    { id: "experiencias", label: "Experiencias", icon: Star },
    { id: "descuentos", label: "Descuentos", icon: TrendingUp }
  ]

  const productosFiltrados = productos.filter(p => {
    const matchCategoria = categoriaFiltro === "todos" || p.categoria === categoriaFiltro
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchDestacado = !mostrarSoloDestacados || p.destacado
    return matchCategoria && matchBusqueda && matchDestacado
  })

  const fevercoinsObtenidos = Math.floor(puntosACanjear / 100) * 50

  return (
    <>
      <FeverCoin3D />
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-20px) rotateX(10deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.2), inset 0 0 20px rgba(251, 191, 36, 0.1); }
          50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3), inset 0 0 30px rgba(251, 191, 36, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes border-flow {
          0%, 100% { border-color: rgba(251, 191, 36, 0.2); }
          50% { border-color: rgba(251, 191, 36, 0.6); }
        }
        @keyframes glow-expand {
          0% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 0 rgba(251, 191, 36, 0); }
          50% { box-shadow: 0 20px 60px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 40px 10px rgba(251, 191, 36, 0.3); }
          100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        .product-card-3d {
          transform-style: preserve-3d;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(251, 191, 36, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .product-card-3d::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .product-card-3d:hover {
          transform: translateY(-12px) scale(1.05);
          border-color: rgba(251, 191, 36, 0.5);
          animation: glow-expand 2s ease-in-out infinite;
        }
        .product-card-3d:hover::before {
          opacity: 1;
          animation: float-up 2s ease-in-out infinite;
        }
        .product-card-destacado {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%);
          border: 2px solid rgba(251, 191, 36, 0.4);
          animation: border-flow 3s ease-in-out infinite;
        }
        .product-card-destacado::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
          animation: shimmer 4s infinite;
        }
        .liquid-glass {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s infinite;
        }
        @keyframes rotateCoin {
          100% { transform: rotateY(360deg); }
        }
        .coin-mini {
          font-size: 24px;
          width: 0.1em;
          height: 1em;
          background: linear-gradient(#faa504, #f97316);
          margin: 0 0 0 4px;
          position: relative;
          animation: rotateCoin 4s infinite linear;
          transform-style: preserve-3d;
          display: inline-block;
          flex-shrink: 0;
        }
        .coin-mini .side-mini,
        .coin-mini:before,
        .coin-mini:after {
          content: "";
          position: absolute;
          width: 1em;
          height: 1em;
          overflow: hidden;
          border-radius: 50%;
          right: -0.4em;
          text-align: center;
          line-height: 1;
          transform: rotateY(-90deg);
          backface-visibility: hidden;
        }
        .coin-mini .tails-mini,
        .coin-mini:after {
          left: -0.4em;
          transform: rotateY(90deg);
        }
        .coin-mini:before,
        .coin-mini:after {
          background: linear-gradient(#faa504, #f97316);
          backface-visibility: hidden;
          transform: rotateY(90deg);
        }
        .coin-mini:after {
          transform: rotateY(-90deg);
        }
      `}</style>
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
            <Coins className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">FEVERSHOP</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Canjea tus FeverCoins por productos exclusivos</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={() => setMostrarSoloDestacados(!mostrarSoloDestacados)} variant={mostrarSoloDestacados ? "default" : "outline"} className={`flex-1 md:flex-none h-11 ${mostrarSoloDestacados ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'border-slate-700'}  shimmer-effect`}>
            <Star className="w-4 h-4 mr-2" />{mostrarSoloDestacados ? 'Destacados' : 'Todos'}
          </Button>
          <Button onClick={() => setDialogCanje(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 flex-1 md:flex-none h-11 shimmer-effect">
            <Zap className="w-4 h-4 mr-2" />Canjear Puntos
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="liquid-glass border-0">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Coins className="w-6 h-6 md:w-8 md:h-8 text-amber-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">En Circulación</p>
              <p className="text-lg md:text-2xl font-bold text-amber-500">{stats.coins_circulacion.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="liquid-glass border-0">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Compras Hoy</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-500">{stats.compras_hoy}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="liquid-glass border-0">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Gastados Hoy</p>
              <p className="text-lg md:text-2xl font-bold text-blue-500">{stats.coins_gastados_hoy.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="liquid-glass border-0">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Clientes</p>
              <p className="text-lg md:text-2xl font-bold text-purple-500">{stats.total_clientes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="liquid-glass border-0 shimmer-effect">
        <CardContent className="pt-4 md:pt-6 pb-4 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
              <span className="text-lg md:text-2xl font-bold text-purple-500">100 Puntos</span>
            </div>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-slate-500 rotate-90 md:rotate-0" />
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
              <span className="text-lg md:text-2xl font-bold text-amber-500">50 FeverCoins</span>
            </div>
          </div>
          <p className="text-center text-xs md:text-sm text-slate-400 mt-2">Canjea tus puntos por FeverCoins y compra productos exclusivos</p>
        </CardContent>
      </Card>

      <Card className="liquid-glass border-0">
        <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
          <div className="space-y-3 md:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Buscar productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10 bg-slate-800/50 border-slate-700 h-10 md:h-auto text-sm md:text-base" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categorias.map((cat) => (
                <Button key={cat.id} size="sm" variant={categoriaFiltro === cat.id ? "default" : "outline"} onClick={() => setCategoriaFiltro(cat.id)} className={`h-9 md:h-10 text-xs md:text-sm ${categoriaFiltro === cat.id ? "bg-gradient-to-r from-amber-600 to-orange-600" : "border-slate-700"}`}>
                  <cat.icon className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />{cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full text-center py-12"><p className="text-slate-400">Cargando productos...</p></div>
        ) : productosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12"><Package className="w-16 h-16 text-slate-700 mx-auto mb-4" /><p className="text-slate-400">No se encontraron productos</p></div>
        ) : (
          productosFiltrados.map((producto) => (
            <Card key={producto.id} className={`product-card-3d cursor-pointer ${producto.destacado ? 'product-card-destacado' : ''}`} onClick={() => { setProductoSeleccionado(producto); setCantidad(1); setDialogCompra(true); }}>
              <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-4">
                <div className="space-y-2 md:space-y-3">
                  {producto.destacado && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">⭐ Destacado</Badge>}
                  <h3 className="font-bold text-slate-50 text-sm md:text-base line-clamp-2">{producto.nombre}</h3>
                  <p className="text-xs md:text-sm text-slate-400 line-clamp-2">{producto.descripcion}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-0">
                      <div className="coin-mini">
                        <div className="side-mini heads-mini">
                          <svg viewBox="0 0 100 100" width="100%" height="100%">
                            <circle cx="50" cy="50" r="48" fill="url(#goldGradientMini)" stroke="#f97316" strokeWidth="2"/>
                            <defs>
                              <linearGradient id="goldGradientMini" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24"/>
                                <stop offset="50%" stopColor="#f59e0b"/>
                                <stop offset="100%" stopColor="#f97316"/>
                              </linearGradient>
                            </defs>
                            <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="14" fontWeight="900" fontFamily="Arial Black, sans-serif">FEVER</text>
                            <text x="50" y="65" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="14" fontWeight="900" fontFamily="Arial Black, sans-serif">COINS</text>
                          </svg>
                        </div>
                        <div className="side-mini tails-mini">
                          <svg viewBox="0 0 100 100" width="100%" height="100%">
                            <circle cx="50" cy="50" r="48" fill="url(#goldGradientMini2)" stroke="#f97316" strokeWidth="2"/>
                            <defs>
                              <linearGradient id="goldGradientMini2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24"/>
                                <stop offset="50%" stopColor="#f59e0b"/>
                                <stop offset="100%" stopColor="#f97316"/>
                              </linearGradient>
                            </defs>
                            <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="16" fontWeight="900" fontFamily="Arial Black, sans-serif" transform="scale(-1, 1) translate(-100, 0)">FEVER</text>
                          </svg>
                        </div>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-amber-500 ml-6">{producto.precio_fevercoins}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Stock: {producto.stock}</Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-9 md:h-10 text-xs md:text-sm" onClick={(e) => { e.stopPropagation(); setProductoSeleccionado(producto); setCantidad(1); setDialogCompra(true); }}>
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />Comprar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogCompra} onOpenChange={setDialogCompra}>
        <DialogContent className="bg-slate-900 border-slate-800 w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl text-slate-50">Comprar Producto</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">Selecciona un cliente y confirma la compra</DialogDescription>
          </DialogHeader>
          {productoSeleccionado && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <h3 className="font-bold text-slate-50 mb-2">{productoSeleccionado.nombre}</h3>
                <p className="text-sm text-slate-400 mb-3">{productoSeleccionado.descripcion}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-xl font-bold text-amber-500">{productoSeleccionado.precio_fevercoins}</span>
                    <span className="text-sm text-slate-400">c/u</span>
                  </div>
                  <Badge variant="outline">Stock: {productoSeleccionado.stock}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cantidad</Label>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="h-10 w-10 p-0 border-slate-700"><Minus className="w-4 h-4" /></Button>
                  <Input type="number" value={cantidad} onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))} className="text-center bg-slate-800 border-slate-700 h-10" />
                  <Button size="sm" variant="outline" onClick={() => setCantidad(Math.min(productoSeleccionado.stock, cantidad + 1))} className="h-10 w-10 p-0 border-slate-700"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Buscar por nombre o teléfono..." value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarCliente()} className="pl-10 bg-slate-800 border-slate-700" />
                </div>
                {clientesEncontrados.length > 0 && (
                  <div className="glass rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                    {clientesEncontrados.map((cliente) => (
                      <div key={cliente.id} onClick={() => { setClienteSeleccionado(cliente); setClientesEncontrados([]); setBusquedaCliente(cliente.nombre); }} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <p className="text-slate-200 font-semibold text-sm">{cliente.nombre}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{cliente.telefono}</span>
                          <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber-500" />{cliente.balance_fevercoins || 0} FC</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {clienteSeleccionado && (
                  <div className="glass rounded-lg p-3 border border-emerald-500/30">
                    <p className="text-sm text-emerald-500 font-semibold">{clienteSeleccionado.nombre}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{clienteSeleccionado.telefono}</span>
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber-500" />{clienteSeleccionado.balance_fevercoins || 0} FeverCoins</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="glass rounded-xl p-4 border-2 border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Total:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500" />
                    <span className="text-2xl font-bold text-amber-500">{productoSeleccionado.precio_fevercoins * cantidad}</span>
                  </div>
                </div>
                {clienteSeleccionado && <div className="text-xs text-slate-400 text-right">Balance restante: {(clienteSeleccionado.balance_fevercoins || 0) - (productoSeleccionado.precio_fevercoins * cantidad)} FC</div>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDialogCompra(false); setProductoSeleccionado(null); setClienteSeleccionado(null); setBusquedaCliente(""); }} className="flex-1 border-slate-700 h-11">Cancelar</Button>
                <Button onClick={handleComprarProducto} disabled={!clienteSeleccionado} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 h-11"><Check className="w-4 h-4 mr-2" />Confirmar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogCanje} onOpenChange={setDialogCanje}>
        <DialogContent className="bg-slate-900 border-slate-800 w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl text-slate-50">Canjear Puntos por FeverCoins</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">Convierte tus puntos en FeverCoins para comprar en la tienda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar por nombre o teléfono..." value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarCliente()} className="pl-10 bg-slate-800 border-slate-700" />
              </div>
              {clientesEncontrados.length > 0 && (
                <div className="glass rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  {clientesEncontrados.map((cliente) => (
                    <div key={cliente.id} onClick={() => { setClienteSeleccionado(cliente); setClientesEncontrados([]); setBusquedaCliente(cliente.nombre); }} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <p className="text-slate-200 font-semibold text-sm">{cliente.nombre}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{cliente.telefono}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-purple-500" />{cliente.puntos_rewards} puntos</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {clienteSeleccionado && (
                <div className="glass rounded-lg p-3 border border-emerald-500/30">
                  <p className="text-sm text-emerald-500 font-semibold">{clienteSeleccionado.nombre}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{clienteSeleccionado.telefono}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-purple-500" />{clienteSeleccionado.puntos_rewards} puntos</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Puntos a Canjear (múltiplos de 100)</Label>
              <Input type="number" value={puntosACanjear} onChange={(e) => setPuntosACanjear(Math.max(100, parseInt(e.target.value) || 100))} step="100" min="100" className="bg-slate-800 border-slate-700" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPuntosACanjear(100)} className="flex-1 border-slate-700">100</Button>
                <Button size="sm" variant="outline" onClick={() => setPuntosACanjear(500)} className="flex-1 border-slate-700">500</Button>
                <Button size="sm" variant="outline" onClick={() => setPuntosACanjear(1000)} className="flex-1 border-slate-700">1000</Button>
              </div>
            </div>
            <div className="glass rounded-xl p-4 border-2 border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-purple-500" />
                  <span className="text-xl font-bold text-purple-500">{puntosACanjear}</span>
                  <span className="text-sm text-slate-400">puntos</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-500" />
                  <span className="text-xl font-bold text-amber-500">{fevercoinsObtenidos}</span>
                  <span className="text-sm text-slate-400">FC</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setDialogCanje(false); setClienteSeleccionado(null); setBusquedaCliente(""); }} className="flex-1 border-slate-700 h-11">Cancelar</Button>
              <Button onClick={handleCanjearPuntos} disabled={!clienteSeleccionado} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 h-11"><Check className="w-4 h-4 mr-2" />Canjear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
