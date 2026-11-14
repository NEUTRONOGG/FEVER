import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sucursalActual, type VistaSucursal } from './sucursal'

// URL correcta de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wymcgcbeqmrdzxlbobwr.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bWNnY2JlcW1yZHp4bGJvYndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NjMyNTgsImV4cCI6MjA4OTUzOTI1OH0.XZNX7rG0c7uOZso4tkCWgZ5l1lLx7N3TX2Z3Y2j0-Ec'

const AVISO_SOLO_CONSULTA = 'Estás viendo "Todas las sucursales" (solo consulta). Elige León o Aguascalientes para registrar datos.'

// Cada consulta lleva la sucursal; la base de datos filtra y asigna la sucursal sola
function fetchConSucursal(sucursal: () => VistaSucursal): typeof fetch {
  return (input, init) => {
    const vista = sucursal()
    const metodo = (init?.method ?? 'GET').toUpperCase()
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    // En el acumulado no se crean registros (no habría a qué sucursal asignarlos)
    if (vista === 'todas' && metodo === 'POST' && url.includes('/rest/v1/') && !url.includes('/rest/v1/rpc/')) {
      return Promise.resolve(new Response(JSON.stringify({ code: 'FEVER_SUCURSAL', message: AVISO_SOLO_CONSULTA, details: null, hint: null }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }))
    }
    const headers = new Headers(init?.headers)
    headers.set('x-sucursal', vista)
    return fetch(input, { ...init, headers })
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchConSucursal(sucursalActual) },
})

// Cliente fijo a una sucursal, para comparar sucursales en una misma pantalla
const porSucursal = new Map<VistaSucursal, SupabaseClient>()
export function clienteDeSucursal(sucursal: VistaSucursal): SupabaseClient {
  let c = porSucursal.get(sucursal)
  if (!c) {
    c = createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: fetchConSucursal(() => sucursal) },
      auth: { persistSession: false, storageKey: `fever-${sucursal}` },
    })
    porSucursal.set(sucursal, c)
  }
  return c
}

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      productos: {
        Row: {
          id: number
          nombre: string
          categoria: string
          precio: number
          stock: number
          stock_minimo: number
          unidad: string
          precio_compra: number
          proveedor: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['productos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['productos']['Insert']>
      }
      ventas: {
        Row: {
          id: string
          mesa_id: number
          mesa_numero: string
          mesero: string
          fecha: string
          total: number
          estado: string
          clientes_data: any
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ventas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ventas']['Insert']>
      }
      mesas: {
        Row: {
          id: number
          numero: string
          capacidad: number
          estado: string
          mesero: string | null
          mesero_id: number | null
          clientes_data: any
          pedidos_data: any
          total: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mesas']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mesas']['Insert']>
      }
      meseros: {
        Row: {
          id: number
          nombre: string
          apellido: string
          telefono: string | null
          email: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['meseros']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['meseros']['Insert']>
      }
    }
  }
}
