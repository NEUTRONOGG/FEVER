// Tipos compartidos para el sistema CRM/POS

export interface Cliente {
  id: string
  nombre: string
  color: string
  email?: string
  telefono?: string
}

export interface ItemPedido {
  id: string
  productoId: number
  producto: string
  precio: number
  cantidad: number
  clienteId: string
  notas?: string
}

export interface Mesa {
  id: number
  numero: string
  capacidad: number
  estado: EstadoMesa
  mesero?: string
  clientes: Cliente[]
  pedidos: ItemPedido[]
  total?: number
  tiempoOcupada?: string
}

export type EstadoMesa = "disponible" | "ocupada" | "reservada" | "cuenta"

export interface Producto {
  id: number
  nombre: string
  categoria: string
  precio: number
  precioVenta?: number
  stock: number
  stockMinimo?: number
  unidad?: string
  precioCompra?: number
  proveedor?: string
  ultimaActualizacion?: string
}

export interface Venta {
  id: string
  mesaId: number
  mesaNumero: string
  mesero: string
  fecha: string
  clientes: {
    id: string
    nombre: string
    total: number
    items: ItemPedido[]
  }[]
  total: number
  metodoPago?: string
  estado: "pendiente" | "pagada" | "cancelada"
}

export interface Movimiento {
  id: number
  productoId: number
  tipo: "entrada" | "salida"
  cantidad: number
  motivo: string
  fecha: string
  usuario: string
}

export type UserRole = "gerente" | "mesero"

export interface User {
  id: string
  nombre: string
  email: string
  role: UserRole
}
