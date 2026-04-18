import { createClient } from '@supabase/supabase-js'

// URL correcta de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wymcgcbeqmrdzxlbobwr.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bWNnY2JlcW1yZHp4bGJvYndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NjMyNTgsImV4cCI6MjA4OTUzOTI1OH0.XZNX7rG0c7uOZso4tkCWgZ5l1lLx7N3TX2Z3Y2j0-Ec'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
