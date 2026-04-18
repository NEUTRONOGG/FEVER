// Script para probar la conexión a Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wymcgcbeqmrdzxlbobwr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bWNnY2JlcW1yZHp4bGJvYndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NjMyNTgsImV4cCI6MjA4OTUzOTI1OH0.XZNX7rG0c7uOZso4tkCWgZ5l1lLx7N3TX2Z3Y2j0-Ec'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...\n')
  
  try {
    // Probar conexión listando tablas
    const { data, error } = await supabase
      .from('productos')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
      console.log('\n📋 NECESITAS EJECUTAR EL SCHEMA SQL:')
      console.log('1. Ve a: https://supabase.com/dashboard')
      console.log('2. Selecciona tu proyecto')
      console.log('3. Ve a SQL Editor')
      console.log('4. Copia y pega el contenido de supabase-schema.sql')
      console.log('5. Click en Run\n')
      return false
    }
    
    console.log('✅ Conexión exitosa a Supabase!')
    console.log('✅ La tabla "productos" existe')
    
    // Verificar si hay productos
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('*')
      .limit(5)
    
    if (!errorProductos && productos) {
      console.log(`✅ Hay ${productos.length} productos en la base de datos`)
      if (productos.length > 0) {
        console.log('\n📦 Primeros productos:')
        productos.forEach(p => {
          console.log(`  - ${p.nombre} (Stock: ${p.stock})`)
        })
      } else {
        console.log('\n⚠️  No hay productos. El schema se ejecutó pero está vacío.')
        console.log('   Ejecuta el script completo de supabase-schema.sql')
      }
    }
    
    return true
  } catch (error) {
    console.log('❌ Error:', error.message)
    return false
  }
}

testConnection()
