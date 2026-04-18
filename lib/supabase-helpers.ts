import { supabase } from './supabase'
import type { Producto, Venta } from './types'

// ============ PRODUCTOS ============

export async function getProductosFromDB(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('categoria', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error al obtener productos:', error)
    return []
  }

  return data.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: parseFloat(p.precio),
    stock: p.stock,
    stockMinimo: p.stock_minimo,
    unidad: p.unidad,
    precioCompra: parseFloat(p.precio_compra),
    proveedor: p.proveedor,
  }))
}

export async function actualizarStockDB(productoId: number, cantidad: number, tipo: 'entrada' | 'salida') {
  // Primero obtener el stock actual
  const { data: producto, error: fetchError } = await supabase
    .from('productos')
    .select('stock')
    .eq('id', productoId)
    .single()

  if (fetchError || !producto) {
    console.error('Error al obtener producto:', fetchError)
    return
  }

  const nuevoStock = tipo === 'entrada' 
    ? producto.stock + cantidad 
    : Math.max(0, producto.stock - cantidad)

  const { error: updateError } = await supabase
    .from('productos')
    .update({ stock: nuevoStock })
    .eq('id', productoId)

  if (updateError) {
    console.error('Error al actualizar stock:', updateError)
  }
}

// ============ VENTAS ============

export async function registrarVentaDB(venta: any) {
  // Registrar la venta
  const { error: ventaError } = await supabase
    .from('ventas')
    .insert({
      mesa_id: venta.mesaId,
      mesa_numero: venta.mesaNumero,
      mesero: venta.mesero,
      total: venta.total,
      estado: venta.estado,
      clientes_data: venta.clientes,
    })

  if (ventaError) {
    console.error('Error al registrar venta:', ventaError)
    return
  }

  // Actualizar inventario
  for (const cliente of venta.clientes) {
    for (const item of cliente.items) {
      await actualizarStockDB(item.productoId, item.cantidad, 'salida')
    }
  }
}

export async function getVentasFromDB(): Promise<Venta[]> {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) {
    console.error('Error al obtener ventas:', error)
    return []
  }

  return data.map((v) => ({
    id: v.id,
    mesaId: v.mesa_id,
    mesaNumero: v.mesa_numero,
    mesero: v.mesero,
    fecha: v.fecha,
    total: parseFloat(v.total),
    estado: v.estado as 'pendiente' | 'pagada' | 'cancelada',
    clientes: v.clientes_data,
  }))
}

// ============ MESAS ============

export async function getMesaFromDB(numero: string) {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('numero', numero)
    .single()

  if (error) {
    console.error('Error al obtener mesa:', error)
    return null
  }

  return {
    id: data.id,
    numero: data.numero,
    capacidad: data.capacidad,
    estado: data.estado,
    mesero: data.mesero,
    clientes: data.clientes_data || [],
    pedidos: data.pedidos_data || [],
    total: parseFloat(data.total || '0'),
  }
}

export async function guardarMesaDB(mesa: any) {
  const { error } = await supabase
    .from('mesas')
    .upsert({
      id: mesa.id,
      numero: mesa.numero,
      capacidad: mesa.capacidad || 4,
      estado: mesa.clientes.length > 0 ? 'ocupada' : 'disponible',
      mesero: mesa.mesero,
      clientes_data: mesa.clientes,
      pedidos_data: mesa.pedidos,
      total: mesa.pedidos.reduce((sum: number, p: any) => sum + (p.precio * p.cantidad), 0),
    })

  if (error) {
    console.error('Error al guardar mesa:', error)
  }
}

export async function limpiarMesaDB(numero: string) {
  const { error } = await supabase
    .from('mesas')
    .update({
      estado: 'disponible',
      mesero: null,
      clientes_data: [],
      pedidos_data: [],
      total: 0,
    })
    .eq('numero', numero)

  if (error) {
    console.error('Error al limpiar mesa:', error)
  }
}

// ============ UTILIDADES ============

export async function sincronizarConSupabase() {
  // Función para sincronizar datos locales con Supabase si es necesario
  const productosLocal = localStorage.getItem('productos')
  
  if (!productosLocal) {
    // Si no hay datos locales, cargar desde Supabase
    const productos = await getProductosFromDB()
    localStorage.setItem('productos', JSON.stringify(productos))
  }
}
