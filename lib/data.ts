import type { Producto } from "./types"

// Catálogo de productos compartido entre POS e Inventario
export const PRODUCTOS_CATALOGO: Producto[] = [
  {
    id: 1,
    nombre: "Hamburguesa Clásica",
    categoria: "Comida",
    precio: 15,
    stock: 50,
    stockMinimo: 20,
    unidad: "unidades",
    precioCompra: 8,
    proveedor: "Distribuidora ABC",
  },
  {
    id: 2,
    nombre: "Pizza Margarita",
    categoria: "Comida",
    precio: 18,
    stock: 30,
    stockMinimo: 15,
    unidad: "unidades",
    precioCompra: 10,
    proveedor: "Distribuidora ABC",
  },
  {
    id: 3,
    nombre: "Tacos al Pastor",
    categoria: "Comida",
    precio: 12,
    stock: 40,
    stockMinimo: 20,
    unidad: "porciones",
    precioCompra: 6,
    proveedor: "Carnicería El Buen Corte",
  },
  {
    id: 4,
    nombre: "Alitas Picantes",
    categoria: "Comida",
    precio: 12,
    stock: 35,
    stockMinimo: 15,
    unidad: "porciones",
    precioCompra: 6,
    proveedor: "Pollería El Gallo",
  },
  {
    id: 5,
    nombre: "Ensalada César",
    categoria: "Comida",
    precio: 10,
    stock: 25,
    stockMinimo: 10,
    unidad: "porciones",
    precioCompra: 5,
    proveedor: "Frutas y Verduras La Huerta",
  },
  {
    id: 6,
    nombre: "Sushi Roll",
    categoria: "Comida",
    precio: 25,
    stock: 20,
    stockMinimo: 10,
    unidad: "porciones",
    precioCompra: 15,
    proveedor: "Distribuidora ABC",
  },
  {
    id: 7,
    nombre: "Cerveza Corona",
    categoria: "Bebidas",
    precio: 8,
    stock: 100,
    stockMinimo: 24,
    unidad: "unidades",
    precioCompra: 5,
    proveedor: "Distribuidora ABC",
  },
  {
    id: 8,
    nombre: "Margarita",
    categoria: "Bebidas",
    precio: 20,
    stock: 50,
    stockMinimo: 20,
    unidad: "unidades",
    precioCompra: 12,
    proveedor: "Licores Premium",
  },
  {
    id: 9,
    nombre: "Mojito",
    categoria: "Bebidas",
    precio: 15,
    stock: 50,
    stockMinimo: 20,
    unidad: "unidades",
    precioCompra: 8,
    proveedor: "Licores Premium",
  },
  {
    id: 10,
    nombre: "Café Americano",
    categoria: "Bebidas",
    precio: 5,
    stock: 80,
    stockMinimo: 30,
    unidad: "unidades",
    precioCompra: 2,
    proveedor: "Café Premium",
  },
  {
    id: 11,
    nombre: "Refresco",
    categoria: "Bebidas",
    precio: 4,
    stock: 120,
    stockMinimo: 50,
    unidad: "unidades",
    precioCompra: 2,
    proveedor: "Distribuidora ABC",
  },
  {
    id: 12,
    nombre: "Tequila Shot",
    categoria: "Bebidas",
    precio: 45,
    stock: 50,
    stockMinimo: 20,
    unidad: "shots",
    precioCompra: 25,
    proveedor: "Licores Premium",
  },
  // Botellas Premium
  {
    id: 13,
    nombre: "Moët & Chandon",
    categoria: "Botellas Premium",
    precio: 23200,
    stock: 5,
    stockMinimo: 2,
    unidad: "botellas",
    precioCompra: 18000,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 14,
    nombre: "Maestro Dobel Diamante",
    categoria: "Botellas Premium",
    precio: 3500,
    stock: 8,
    stockMinimo: 3,
    unidad: "botellas",
    precioCompra: 2500,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 15,
    nombre: "Don Julio 1942",
    categoria: "Botellas Premium",
    precio: 8500,
    stock: 6,
    stockMinimo: 2,
    unidad: "botellas",
    precioCompra: 6500,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 16,
    nombre: "Hennessy VS",
    categoria: "Botellas Premium",
    precio: 4200,
    stock: 10,
    stockMinimo: 4,
    unidad: "botellas",
    precioCompra: 3200,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 17,
    nombre: "Grey Goose Vodka",
    categoria: "Botellas Premium",
    precio: 3800,
    stock: 12,
    stockMinimo: 5,
    unidad: "botellas",
    precioCompra: 2800,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 18,
    nombre: "Buchanan's 18",
    categoria: "Botellas Premium",
    precio: 5500,
    stock: 7,
    stockMinimo: 3,
    unidad: "botellas",
    precioCompra: 4200,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 19,
    nombre: "Patrón Silver",
    categoria: "Botellas Premium",
    precio: 4500,
    stock: 9,
    stockMinimo: 4,
    unidad: "botellas",
    precioCompra: 3400,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 20,
    nombre: "Dom Pérignon",
    categoria: "Botellas Premium",
    precio: 28000,
    stock: 3,
    stockMinimo: 1,
    unidad: "botellas",
    precioCompra: 22000,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 21,
    nombre: "Clase Azul Reposado",
    categoria: "Botellas Premium",
    precio: 12000,
    stock: 4,
    stockMinimo: 2,
    unidad: "botellas",
    precioCompra: 9500,
    proveedor: "Licores Premium VIP",
  },
  {
    id: 22,
    nombre: "Macallan 12",
    categoria: "Botellas Premium",
    precio: 6800,
    stock: 6,
    stockMinimo: 2,
    unidad: "botellas",
    precioCompra: 5200,
    proveedor: "Licores Premium VIP",
  },
  // Mixers
  {
    id: 23,
    nombre: "Red Bull",
    categoria: "Bebidas",
    precio: 12,
    stock: 80,
    stockMinimo: 30,
    unidad: "unidades",
    precioCompra: 8,
    proveedor: "Distribuidora ABC",
  },
]

// Colores para identificar clientes
export const COLORES_CLIENTES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
]

// Función para obtener productos del localStorage o usar el catálogo por defecto
export function getProductos(): Producto[] {
  if (typeof window === "undefined") return PRODUCTOS_CATALOGO

  const stored = localStorage.getItem("productos")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Si hay error, inicializar con el catálogo
      localStorage.setItem("productos", JSON.stringify(PRODUCTOS_CATALOGO))
      return PRODUCTOS_CATALOGO
    }
  }
  
  // Si no hay productos guardados, inicializar con el catálogo
  localStorage.setItem("productos", JSON.stringify(PRODUCTOS_CATALOGO))
  return PRODUCTOS_CATALOGO
}

// Función para actualizar el stock de un producto
export function actualizarStock(productoId: number, cantidad: number, tipo: "entrada" | "salida"): void {
  const productos = getProductos()
  const productoIndex = productos.findIndex((p) => p.id === productoId)

  if (productoIndex !== -1) {
    const producto = productos[productoIndex]
    const nuevoStock = tipo === "entrada" ? producto.stock + cantidad : producto.stock - cantidad

    productos[productoIndex] = {
      ...producto,
      stock: Math.max(0, nuevoStock),
    }

    localStorage.setItem("productos", JSON.stringify(productos))
    
    // Emitir evento de actualización
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stock-actualizado', { 
        detail: { productoId, nuevoStock: productos[productoIndex].stock } 
      }))
    }
  }
}

// Función para registrar una venta
export async function registrarVenta(venta: any): Promise<void> {
  // Intentar guardar en Supabase primero
  try {
    const { supabase } = await import('./supabase')
    
    const { error } = await supabase
      .from('ventas')
      .insert({
        mesa_id: venta.mesaId,
        mesa_numero: venta.mesaNumero,
        mesero: venta.mesero,
        total: venta.total,
        estado: venta.estado,
        clientes_data: venta.clientes,
      })

    if (!error) {
      console.log('✅ Venta guardada en Supabase')
      
      // Actualizar inventario en Supabase
      for (const cliente of venta.clientes) {
        for (const item of cliente.items) {
          await actualizarStockSupabase(item.productoId, item.cantidad, 'salida')
        }
      }
      
      // También guardar en localStorage como backup
      const ventas = JSON.parse(localStorage.getItem("ventas") || "[]")
      ventas.push(venta)
      localStorage.setItem("ventas", JSON.stringify(ventas))
      
      // Emitir evento
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('venta-registrada', { detail: venta }))
      }
      return
    } else {
      console.error('Error guardando en Supabase:', error)
    }
  } catch (error) {
    console.log('Supabase no disponible, usando localStorage')
  }

  // Fallback a localStorage
  const ventas = JSON.parse(localStorage.getItem("ventas") || "[]")
  ventas.push(venta)
  localStorage.setItem("ventas", JSON.stringify(ventas))

  // Actualizar inventario
  venta.clientes.forEach((cliente: any) => {
    cliente.items.forEach((item: any) => {
      actualizarStock(item.productoId, item.cantidad, "salida")
    })
  })
  
  // Emitir evento de venta registrada
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('venta-registrada', { detail: venta }))
  }
}

// Función auxiliar para actualizar stock en Supabase
async function actualizarStockSupabase(productoId: number, cantidad: number, tipo: 'entrada' | 'salida') {
  try {
    const { supabase } = await import('./supabase')
    
    const { data: producto } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', productoId)
      .single()

    if (producto) {
      const nuevoStock = tipo === 'entrada' 
        ? producto.stock + cantidad 
        : Math.max(0, producto.stock - cantidad)

      await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', productoId)
    }
  } catch (error) {
    console.error('Error actualizando stock en Supabase:', error)
  }
}

// Función para obtener todas las ventas
export async function getVentas(): Promise<any[]> {
  if (typeof window === "undefined") return []
  
  // Intentar obtener de Supabase primero
  try {
    const { supabase } = await import('./supabase')
    
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false })

    if (!error && data) {
      console.log('✅ Ventas cargadas desde Supabase:', data.length)
      return data.map((v: any) => ({
        id: v.id,
        mesaId: v.mesa_id,
        mesaNumero: v.mesa_numero,
        mesero: v.mesero,
        fecha: v.fecha,
        total: parseFloat(v.total),
        estado: v.estado,
        clientes: v.clientes_data,
      }))
    }
  } catch (error) {
    console.log('Usando localStorage')
  }
  
  // Fallback a localStorage
  const ventas = localStorage.getItem("ventas")
  return ventas ? JSON.parse(ventas) : []
}

// Función para obtener mesas
export function getMesas(): any[] {
  if (typeof window === "undefined") return []
  
  const mesasGuardadas: any[] = []
  for (let i = 1; i <= 12; i++) {
    const mesaData = localStorage.getItem(`mesa_${i}`)
    if (mesaData) {
      try {
        const mesa = JSON.parse(mesaData)
        mesasGuardadas.push({
          ...mesa,
          estado: mesa.clientes && mesa.clientes.length > 0 ? 'ocupada' : 'disponible'
        })
      } catch (e) {
        // Ignorar errores de parsing
      }
    }
  }
  return mesasGuardadas
}

// Función para actualizar mesa
export async function actualizarMesa(mesa: any): Promise<void> {
  localStorage.setItem(`mesa_${mesa.numero}`, JSON.stringify(mesa))
  
  // Actualizar en Supabase
  try {
    const { supabase } = await import('./supabase')
    
    // Convertir numero de mesa (string) a id (integer)
    const mesaId = mesa.id || parseInt(mesa.numero)
    
    await supabase
      .from('mesas')
      .update({
        capacidad: mesa.capacidad || 4,
        estado: mesa.estado || 'ocupada',
        mesero: mesa.mesero || null,
        clientes_data: mesa.clientes || [],
        pedidos_data: mesa.pedidos || [],
        total: mesa.pedidos ? mesa.pedidos.reduce((sum: number, p: any) => sum + (p.precio * p.cantidad), 0) : 0
      })
      .eq('id', mesaId)
    
    console.log('✅ Mesa actualizada en Supabase')
  } catch (error) {
    console.log('Error actualizando mesa en Supabase:', error)
  }
  
  // Emitir evento de mesa actualizada
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mesa-actualizada', { detail: mesa }))
  }
}

// Función para liberar mesa
export async function liberarMesa(numeroMesa: string): Promise<void> {
  // Eliminar de localStorage
  localStorage.removeItem(`mesa_${numeroMesa}`)
  
  // Actualizar estado en Supabase
  try {
    const { supabase } = await import('./supabase')
    
    // Convertir numero de mesa (string) a id (integer)
    const mesaId = parseInt(numeroMesa)
    
    const { data, error } = await supabase
      .from('mesas')
      .update({ 
        estado: 'disponible',
        mesero: null,
        clientes_data: [],
        pedidos_data: [],
        total: 0
      })
      .eq('id', mesaId)
    
    if (error) {
      console.error('Error al liberar mesa:', error)
      console.error('Error completo:', JSON.stringify(error, null, 2))
      throw error
    }
    
    console.log(`✅ Mesa ${numeroMesa} liberada en Supabase`)
  } catch (error) {
    console.error('Error liberando mesa:', error)
  }
  
  // Emitir evento
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mesa-liberada', { detail: { numero: numeroMesa } }))
  }
}
