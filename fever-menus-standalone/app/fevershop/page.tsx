'use client'

import { useState } from 'react'
import { ArrowLeft, ShoppingCart, Coins, Gift, TrendingUp, Search, Star, Package, Sparkles, Award, ArrowRight, Check, Zap, Plus, Minus, X } from 'lucide-react'
import Image from 'next/image'

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio_fevercoins: number
  categoria: string
  stock: number
  destacado: boolean
}

// Productos de ejemplo (en producción vendrían de la base de datos)
const productosEjemplo: Producto[] = [
  { id: 1, nombre: 'Botella Tequila Don Julio 70', descripcion: 'Botella premium de tequila cristalino', precio_fevercoins: 500, categoria: 'bebidas', stock: 10, destacado: true },
  { id: 2, nombre: 'Cover VIP para 4 personas', descripcion: 'Acceso VIP para ti y 3 amigos', precio_fevercoins: 300, categoria: 'experiencias', stock: 20, destacado: true },
  { id: 3, nombre: 'Playera FEVER Edición Limitada', descripcion: 'Playera exclusiva de colección', precio_fevercoins: 150, categoria: 'merchandising', stock: 50, destacado: true },
  { id: 4, nombre: '50% Descuento en Botella', descripcion: 'Válido en cualquier botella del menú', precio_fevercoins: 200, categoria: 'descuentos', stock: 100, destacado: false },
  { id: 5, nombre: 'Shot Perla Negra Gratis', descripcion: 'Canjea por un shot de cortesía', precio_fevercoins: 50, categoria: 'bebidas', stock: 200, destacado: false },
  { id: 6, nombre: 'Mesa Reservada Preferencial', descripcion: 'Reserva garantizada en zona premium', precio_fevercoins: 400, categoria: 'experiencias', stock: 15, destacado: true },
  { id: 7, nombre: 'Gorra FEVER Original', descripcion: 'Gorra snapback con logo bordado', precio_fevercoins: 100, categoria: 'merchandising', stock: 30, destacado: false },
  { id: 8, nombre: 'Combo Snacks Premium', descripcion: 'Botana gourmet para compartir', precio_fevercoins: 80, categoria: 'alimentos', stock: 50, destacado: false },
]

const categorias = [
  { id: 'todos', label: 'Todos', icon: Package },
  { id: 'bebidas', label: 'Bebidas', icon: Sparkles },
  { id: 'alimentos', label: 'Alimentos', icon: Gift },
  { id: 'merchandising', label: 'Merchandising', icon: Award },
  { id: 'experiencias', label: 'Experiencias', icon: Star },
  { id: 'descuentos', label: 'Descuentos', icon: TrendingUp }
]

export default function FeverShopPage() {
  const [productos] = useState<Producto[]>(productosEjemplo)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [mostrarSoloDestacados, setMostrarSoloDestacados] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [dialogCompra, setDialogCompra] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [dialogCanje, setDialogCanje] = useState(false)
  const [puntosACanjear, setPuntosACanjear] = useState(100)

  const stats = {
    coins_circulacion: 125000,
    compras_hoy: 47,
    coins_gastados_hoy: 8500,
    total_clientes: 1250
  }

  const productosFiltrados = productos.filter(p => {
    const matchCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchDestacado = !mostrarSoloDestacados || p.destacado
    return matchCategoria && matchBusqueda && matchDestacado
  })

  const fevercoinsObtenidos = Math.floor(puntosACanjear / 100) * 50

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo FEVER */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/fever-bg-2.png)',
            filter: 'brightness(0.5)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

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
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 1rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: white;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }
        .btn-secondary {
          background: linear-gradient(135deg, #9333ea 0%, #db2777 100%);
          color: white;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
        }
        .btn-outline {
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          border: 1px solid #334155;
          cursor: pointer;
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: #fbbf24;
          color: #fbbf24;
        }
        .input-field {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #334155;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          width: 100%;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }
        .input-field::placeholder {
          color: #64748b;
        }
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .dialog-content {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 1.5rem;
          padding: 1.5rem;
          max-width: 28rem;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-gold {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: white;
        }
        .badge-outline {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
        }
      `}</style>

      <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/menu-1" className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Volver</span>
            </a>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-50 flex items-center gap-3">
                <Coins className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">FEVERSHOP</span>
              </h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">Canjea tus FeverCoins por productos exclusivos</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setMostrarSoloDestacados(!mostrarSoloDestacados)} 
              className={`flex-1 md:flex-none h-11 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${mostrarSoloDestacados ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'border border-slate-700 text-slate-300 hover:border-amber-500'}`}
              style={{ padding: '0 1rem' }}
            >
              <Star className="w-4 h-4" />{mostrarSoloDestacados ? 'Destacados' : 'Todos'}
            </button>
            <button onClick={() => setDialogCanje(true)} className="btn-secondary flex-1 md:flex-none h-11 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />Canjear Puntos
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
          <div className="liquid-glass rounded-xl p-4">
            <div className="flex flex-col items-center text-center">
              <Coins className="w-6 h-6 md:w-8 md:h-8 text-amber-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">En Circulación</p>
              <p className="text-lg md:text-2xl font-bold text-amber-500">{stats.coins_circulacion.toLocaleString()}</p>
            </div>
          </div>
          <div className="liquid-glass rounded-xl p-4">
            <div className="flex flex-col items-center text-center">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Compras Hoy</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-500">{stats.compras_hoy}</p>
            </div>
          </div>
          <div className="liquid-glass rounded-xl p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Gastados Hoy</p>
              <p className="text-lg md:text-2xl font-bold text-blue-500">{stats.coins_gastados_hoy.toLocaleString()}</p>
            </div>
          </div>
          <div className="liquid-glass rounded-xl p-4">
            <div className="flex flex-col items-center text-center">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Clientes</p>
              <p className="text-lg md:text-2xl font-bold text-purple-500">{stats.total_clientes}</p>
            </div>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="liquid-glass rounded-xl p-4 md:p-6 shimmer-effect">
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
        </div>

        {/* Search and Filters */}
        <div className="liquid-glass rounded-xl p-4 md:p-6">
          <div className="space-y-3 md:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar productos..." 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categorias.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setCategoriaFiltro(cat.id)} 
                  className={`h-9 md:h-10 px-3 md:px-4 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${categoriaFiltro === cat.id ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'border border-slate-700 text-slate-300 hover:border-amber-500'}`}
                >
                  <cat.icon className="w-3 h-3 md:w-4 md:h-4" />{cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No se encontraron productos</p>
            </div>
          ) : (
            productosFiltrados.map((producto) => (
              <div 
                key={producto.id} 
                className={`product-card-3d cursor-pointer rounded-xl ${producto.destacado ? 'product-card-destacado' : ''}`} 
                onClick={() => { setProductoSeleccionado(producto); setCantidad(1); setDialogCompra(true); }}
              >
                <div className="p-4 md:p-5">
                  <div className="space-y-2 md:space-y-3">
                    {producto.destacado && <span className="badge badge-gold">⭐ Destacado</span>}
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
                      <span className="badge badge-outline">Stock: {producto.stock}</span>
                    </div>
                    <button 
                      className="w-full btn-primary h-9 md:h-10 text-xs md:text-sm flex items-center justify-center gap-2" 
                      onClick={(e) => { e.stopPropagation(); setProductoSeleccionado(producto); setCantidad(1); setDialogCompra(true); }}
                    >
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog Compra */}
      {dialogCompra && productoSeleccionado && (
        <div className="dialog-overlay" onClick={() => setDialogCompra(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-50">Comprar Producto</h2>
              <button onClick={() => setDialogCompra(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">Selecciona la cantidad y confirma la compra</p>
            
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h3 className="font-bold text-slate-50 mb-2">{productoSeleccionado.nombre}</h3>
                <p className="text-sm text-slate-400 mb-3">{productoSeleccionado.descripcion}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-xl font-bold text-amber-500">{productoSeleccionado.precio_fevercoins}</span>
                    <span className="text-sm text-slate-400">c/u</span>
                  </div>
                  <span className="badge badge-outline">Stock: {productoSeleccionado.stock}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))} 
                    className="h-10 w-10 rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number" 
                    value={cantidad} 
                    onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))} 
                    className="input-field text-center flex-1"
                  />
                  <button 
                    onClick={() => setCantidad(Math.min(productoSeleccionado.stock, cantidad + 1))} 
                    className="h-10 w-10 rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="glass-card p-4 border-2 border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500" />
                    <span className="text-2xl font-bold text-amber-500">{productoSeleccionado.precio_fevercoins * cantidad}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setDialogCompra(false)} className="btn-outline flex-1 h-11">Cancelar</button>
                <button className="btn-primary flex-1 h-11 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Canje */}
      {dialogCanje && (
        <div className="dialog-overlay" onClick={() => setDialogCanje(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-50">Canjear Puntos por FeverCoins</h2>
              <button onClick={() => setDialogCanje(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">Convierte tus puntos en FeverCoins para comprar en la tienda</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium">Puntos a Canjear (múltiplos de 100)</label>
                <input 
                  type="number" 
                  value={puntosACanjear} 
                  onChange={(e) => setPuntosACanjear(Math.max(100, parseInt(e.target.value) || 100))} 
                  step="100" 
                  min="100" 
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button onClick={() => setPuntosACanjear(100)} className="btn-outline flex-1 h-9 text-sm">100</button>
                  <button onClick={() => setPuntosACanjear(500)} className="btn-outline flex-1 h-9 text-sm">500</button>
                  <button onClick={() => setPuntosACanjear(1000)} className="btn-outline flex-1 h-9 text-sm">1000</button>
                </div>
              </div>
              
              <div className="glass-card p-4 border-2 border-purple-500/30">
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
                <button onClick={() => setDialogCanje(false)} className="btn-outline flex-1 h-11">Cancelar</button>
                <button className="btn-secondary flex-1 h-11 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />Canjear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
