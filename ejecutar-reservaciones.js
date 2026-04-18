// Script para ejecutar SQL de reservaciones en Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function ejecutarSQL() {
  try {
    // Leer variables de entorno
    const envPath = path.join(__dirname, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
    const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ No se encontraron las credenciales de Supabase en .env.local')
      process.exit(1)
    }
    
    console.log('🔗 Conectando a Supabase...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Crear tabla de reservaciones
    console.log('📋 Creando tabla de reservaciones...')
    
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reservaciones (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          
          -- Información del cliente
          cliente_id UUID REFERENCES clientes(id),
          cliente_nombre TEXT NOT NULL,
          cliente_telefono TEXT NOT NULL,
          
          -- Información de la reservación
          fecha DATE NOT NULL,
          hora TIME NOT NULL,
          numero_personas INTEGER NOT NULL,
          rp_nombre TEXT,
          
          -- Estado de la reservación
          estado TEXT DEFAULT 'pendiente',
          
          -- Información de asistencia
          asistio BOOLEAN DEFAULT false,
          hora_llegada TIMESTAMP,
          mesa_asignada INTEGER,
          
          -- Notas
          notas TEXT,
          
          -- Auditoría
          creado_por TEXT,
          creado_en TIMESTAMP DEFAULT NOW(),
          actualizado_en TIMESTAMP DEFAULT NOW(),
          activo BOOLEAN DEFAULT true
        );
        
        -- Índices
        CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha ON reservaciones(fecha);
        CREATE INDEX IF NOT EXISTS idx_reservaciones_estado ON reservaciones(estado);
        CREATE INDEX IF NOT EXISTS idx_reservaciones_cliente ON reservaciones(cliente_id);
        CREATE INDEX IF NOT EXISTS idx_reservaciones_rp ON reservaciones(rp_nombre);
        CREATE INDEX IF NOT EXISTS idx_reservaciones_telefono ON reservaciones(cliente_telefono);
      `
    })
    
    if (createTableError) {
      console.log('⚠️  Intentando método alternativo...')
      
      // Método alternativo: usar la API directamente
      const { error } = await supabase
        .from('reservaciones')
        .select('*')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log('❌ La tabla no existe. Por favor, ejecuta el SQL manualmente en Supabase:')
        console.log('\n1. Ve a: https://supabase.com')
        console.log('2. Abre tu proyecto')
        console.log('3. Ve a SQL Editor')
        console.log('4. Copia y pega el contenido de: CREAR-TABLA-RESERVACIONES.sql')
        console.log('5. Click en RUN\n')
        process.exit(1)
      }
    }
    
    // Verificar si la tabla existe
    console.log('🔍 Verificando tabla...')
    const { data, error } = await supabase
      .from('reservaciones')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('\n⚠️  La tabla aún no existe o no tienes permisos.')
      console.log('\n📋 EJECUTA MANUALMENTE EN SUPABASE:')
      console.log('1. Ve a: https://supabase.com')
      console.log('2. Abre tu proyecto')
      console.log('3. Ve a SQL Editor')
      console.log('4. Copia y pega el contenido de: CREAR-TABLA-RESERVACIONES.sql')
      console.log('5. Click en RUN\n')
    } else {
      console.log('✅ Tabla de reservaciones lista!')
      console.log('\n🎉 Ahora puedes usar el panel de reservaciones:')
      console.log('   http://localhost:3000/dashboard/reservaciones\n')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 EJECUTA MANUALMENTE EN SUPABASE:')
    console.log('1. Ve a: https://supabase.com')
    console.log('2. Abre tu proyecto')
    console.log('3. Ve a SQL Editor')
    console.log('4. Copia y pega el contenido de: CREAR-TABLA-RESERVACIONES.sql')
    console.log('5. Click en RUN\n')
  }
}

ejecutarSQL()
