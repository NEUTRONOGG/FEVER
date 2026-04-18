# 🚀 CREAR TABLA RESERVACIONES - RÁPIDO

## ⚠️ SI VES ERROR EN CONSOLA

Si ves este error en la consola:
```
⚠️ Tabla reservaciones no existe o no tiene datos
```

**Significa que necesitas crear la tabla en Supabase.**

---

## 📋 PASOS RÁPIDOS

### **1. Ir a Supabase**
```
https://supabase.com
→ Tu proyecto
→ SQL Editor (icono de base de datos)
```

### **2. Copiar y pegar este SQL:**

```sql
-- ============================================
-- CREAR TABLA RESERVACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS reservaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Datos del cliente
  cliente_id UUID REFERENCES clientes(id),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  
  -- Datos de la reservación
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  numero_personas INTEGER NOT NULL,
  rp_nombre TEXT,
  
  -- Estado
  estado TEXT DEFAULT 'pendiente',
  
  -- Asistencia
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

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha ON reservaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_reservaciones_estado ON reservaciones(estado);
CREATE INDEX IF NOT EXISTS idx_reservaciones_cliente ON reservaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_rp ON reservaciones(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_reservaciones_telefono ON reservaciones(cliente_telefono);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp_reservaciones()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_reservaciones
BEFORE UPDATE ON reservaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_reservaciones();

-- Datos de prueba
INSERT INTO reservaciones (
  cliente_nombre,
  cliente_telefono,
  fecha,
  hora,
  numero_personas,
  rp_nombre,
  estado,
  notas,
  creado_por
) VALUES 
(
  'Juan Pérez',
  '+52 555 123 4567',
  CURRENT_DATE,
  '21:00',
  4,
  'Carlos RP',
  'pendiente',
  'Mesa cerca de la pista',
  'Admin'
),
(
  'AGUS PINAYA',
  '4779806392',
  CURRENT_DATE + INTERVAL '1 day',
  '23:39',
  2,
  'Carlos RP',
  'pendiente',
  'Preferencia',
  'Carlos RP'
);
```

### **3. Click RUN (botón verde)**

### **4. Verificar:**
```sql
SELECT * FROM reservaciones;
```

---

## ✅ RESULTADO ESPERADO

Deberías ver:
```
✅ Success. No rows returned
```

O si insertaste datos de prueba:
```
✅ 2 rows returned
```

---

## 🔄 RECARGAR PÁGINA

```
1. Vuelve a: http://localhost:3000/dashboard/reservaciones
2. Recarga la página (F5)
3. ✅ Ya no verás el error
4. ✅ Verás las reservaciones de prueba
```

---

## 🎯 QUÉ HACE ESTA TABLA

### **Campos principales:**

```
cliente_nombre → Nombre del cliente
cliente_telefono → Teléfono de contacto
fecha → Fecha de la reservación
hora → Hora de la reservación
numero_personas → Cuántas personas
rp_nombre → RP asignado (opcional)
estado → pendiente | confirmada | completada | cancelada
asistio → true/false (cuando llega)
mesa_asignada → Número de mesa asignada
creado_por → Quién creó la reservación
```

---

## 🚨 SI AÚN HAY ERROR

### **Error: "relation reservaciones does not exist"**
```
→ La tabla no se creó
→ Ejecuta el SQL de nuevo
→ Verifica que estás en el proyecto correcto
```

### **Error: "permission denied"**
```
→ Necesitas permisos de admin en Supabase
→ Contacta al dueño del proyecto
```

### **Error: "column does not exist"**
```
→ Falta alguna columna
→ Ejecuta el SQL completo de nuevo
```

---

## 📊 VERIFICAR QUE FUNCIONA

### **1. En Supabase:**
```sql
-- Ver todas las reservaciones
SELECT * FROM reservaciones;

-- Ver reservaciones de hoy
SELECT * FROM reservaciones 
WHERE fecha = CURRENT_DATE;

-- Ver reservaciones pendientes
SELECT * FROM reservaciones 
WHERE estado = 'pendiente';
```

### **2. En la aplicación:**
```
1. Ir a /dashboard/reservaciones
2. ✅ Ver lista de reservaciones
3. Click "Nueva Reservación"
4. ✅ Crear una reservación
5. ✅ Aparece en la lista
```

---

## 🎯 RESUMEN RÁPIDO

```
╔════════════════════════════════════════════════════╗
║   PASOS:                                           ║
║   1. Ir a Supabase SQL Editor                      ║
║   2. Copiar SQL de arriba                          ║
║   3. Pegar en editor                               ║
║   4. Click RUN                                     ║
║   5. Recargar página                               ║
║   6. ✅ Listo!                                     ║
╚════════════════════════════════════════════════════╝
```

---

**¡Tabla creada y lista para usar!** 🚀✅
