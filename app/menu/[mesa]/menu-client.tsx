"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UtensilsCrossed, Search, ShoppingCart, Plus, Minus, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen: string
  disponible: boolean
}

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function MenuDigitalClient({ mesa }: { mesa: string }) {
  const [busqueda, setBusqueda] = useState("")
  const [categoriaActiva, setCategoriaActiva] = useState("Todos")
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)

  const productos: Producto[] = [
    {
      id: 1,
      nombre: "Hamburguesa Clásica",
      descripcion: "Carne de res, lechuga, tomate, cebolla y queso cheddar",
      precio: 15,
      categoria: "Comida",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 2,
      nombre: "Pizza Margarita",
      descripcion: "Salsa de tomate, mozzarella fresca y albahaca",
      precio: 18,
      categoria: "Comida",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 3,
      nombre: "Tacos al Pastor",
      descripcion: "3 tacos con carne al pastor, piña, cilantro y cebolla",
      precio: 12,
      categoria: "Comida",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 4,
      nombre: "Alitas Picantes",
      descripcion: "12 alitas con salsa búfalo y aderezo ranch",
      precio: 12,
      categoria: "Comida",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 5,
      nombre: "Ensalada César",
      descripcion: "Lechuga romana, crutones, parmesano y aderezo césar",
      precio: 10,
      categoria: "Comida",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 6,
      nombre: "Cerveza Corona",
      descripcion: "Cerveza mexicana 355ml",
      precio: 8,
      categoria: "Bebidas",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 7,
      nombre: "Mojito",
      descripcion: "Ron blanco, menta, limón, azúcar y soda",
      precio: 15,
      categoria: "Bebidas",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 8,
      nombre: "Margarita",
      descripcion: "Tequila, triple sec, jugo de limón y sal",
      precio: 20,
      categoria: "Bebidas",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 9,
      nombre: "Café Americano",
      descripcion: "Café espresso con agua caliente",
      precio: 5,
      categoria: "Bebidas",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 10,
      nombre: "Limonada Natural",
      descripcion: "Limones frescos, agua y azúcar",
      precio: 6,
      categoria: "Bebidas",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 11,
      nombre: "Brownie con Helado",
      descripcion: "Brownie de chocolate caliente con helado de vainilla",
      precio: 9,
      categoria: "Postres",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
    {
      id: 12,
      nombre: "Cheesecake",
      descripcion: "Pastel de queso con salsa de frutos rojos",
      precio: 10,
      categoria: "Postres",
      imagen: "/placeholder.svg?height=200&width=200",
      disponible: true,
    },
  ]

  const categorias = ["Todos", ...Array.from(new Set(productos.map((p) => p.categoria)))]

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchCategoria && matchBusqueda && p.disponible
  })

  const agregarAlCarrito = (producto: Producto) => {
    const itemExistente = carrito.find((item) => item.producto.id === producto.id)
    if (itemExistente) {
      setCarrito(
        carrito.map((item) => (item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)),
      )
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }])
    }
  }

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad === 0) {
      setCarrito(carrito.filter((item) => item.producto.id !== productoId))
    } else {
      setCarrito(carrito.map((item) => (item.producto.id === productoId ? { ...item, cantidad: nuevaCantidad } : item)))
    }
  }

  const totalCarrito = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  const cantidadItems = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  const enviarPedido = () => {
    console.log("Pedido enviado:", { mesa, items: carrito, total: totalCarrito })
    alert(`Pedido enviado para Mesa ${mesa}. Total: $${totalCarrito.toFixed(2)}`)
    setCarrito([])
    setCarritoAbierto(false)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-50">Menú Digital</h1>
                <p className="text-xs text-slate-400">Mesa {mesa}</p>
              </div>
            </div>
            <Button
              onClick={() => setCarritoAbierto(true)}
              className="relative bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              <ShoppingCart className="w-5 h-5" />
              {cantidadItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cantidadItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-100 h-12"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map((categoria) => (
            <Button
              key={categoria}
              onClick={() => setCategoriaActiva(categoria)}
              variant={categoriaActiva === categoria ? "default" : "outline"}
              className={
                categoriaActiva === categoria
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-900 whitespace-nowrap"
                  : "border-slate-700 text-slate-300 hover:bg-slate-800 whitespace-nowrap"
              }
            >
              {categoria}
            </Button>
          ))}
        </div>

        {/* Grid de Productos */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productosFiltrados.map((producto) => (
            <Card key={producto.id} className="bg-slate-900 border-slate-800 overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-slate-800">
                <img
                  src={producto.imagen || "/placeholder.svg"}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-50 text-lg leading-tight">{producto.nombre}</h3>
                    <Badge className="bg-amber-500/20 text-amber-500 shrink-0">{producto.categoria}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{producto.descripcion}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-500">${producto.precio}</span>
                  <Button
                    onClick={() => agregarAlCarrito(producto)}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Dialog del Carrito */}
      <Dialog open={carritoAbierto} onOpenChange={setCarritoAbierto}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>Tu Pedido</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCarritoAbierto(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items del Carrito */}
              <div className="space-y-3">
                {carrito.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700"
                  >
                    <img
                      src={item.producto.imagen || "/placeholder.svg"}
                      alt={item.producto.nombre}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium text-slate-200">{item.producto.nombre}</h4>
                        <p className="text-sm text-slate-400">${item.producto.precio} c/u</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                            className="h-8 w-8 p-0 border-slate-700"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-slate-200 font-semibold w-8 text-center">{item.cantidad}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                            className="h-8 w-8 p-0 border-slate-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="text-amber-500 font-semibold">
                          ${(item.producto.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-semibold text-slate-200">${totalCarrito.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-2xl">
                  <span className="font-bold text-slate-50">Total</span>
                  <span className="font-bold text-amber-500">${totalCarrito.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de Enviar */}
              <Button
                onClick={enviarPedido}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 h-12 text-lg font-semibold"
              >
                Enviar Pedido
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
