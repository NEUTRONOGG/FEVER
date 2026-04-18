"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PedidoDialogProps {
  mesaId: number
}

export function PedidoDialog({ mesaId }: PedidoDialogProps) {
  const [open, setOpen] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  // Mock productos - en producción vendrán de la base de datos
  const productos = [
    { id: 1, nombre: "Hamburguesa Clásica", precio: 15, categoria: "Comida" },
    { id: 2, nombre: "Pizza Margarita", precio: 18, categoria: "Comida" },
    { id: 3, nombre: "Tacos al Pastor", precio: 12, categoria: "Comida" },
    { id: 4, nombre: "Alitas Picantes", precio: 12, categoria: "Comida" },
    { id: 5, nombre: "Ensalada César", precio: 10, categoria: "Comida" },
    { id: 6, nombre: "Cerveza Corona", precio: 8, categoria: "Bebida" },
    { id: 7, nombre: "Mojito", precio: 15, categoria: "Bebida" },
    { id: 8, nombre: "Margarita", precio: 20, categoria: "Bebida" },
    { id: 9, nombre: "Café Americano", precio: 5, categoria: "Bebida" },
    { id: 10, nombre: "Limonada", precio: 6, categoria: "Bebida" },
  ]

  const productosFiltrados = productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  const handleAgregarProducto = (producto: (typeof productos)[0]) => {
    // Aquí se agregaría el producto al pedido
    console.log(`Agregando ${producto.nombre} a mesa ${mesaId}`)
    // En producción, actualizar el estado global o base de datos
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agregar Pedido - Mesa {mesaId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          {/* Lista de Productos */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-200">{producto.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-slate-700 text-slate-300 text-xs">{producto.categoria}</Badge>
                    <span className="text-sm text-emerald-500 font-semibold">${producto.precio}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAgregarProducto(producto)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <p className="text-center text-slate-400 py-8">No se encontraron productos</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
