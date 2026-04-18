# SISTEMA DE CORTESÍAS ACTIVAS EN TIEMPO REAL

## 🎯 Objetivo

Implementar un sistema de cortesías activas que:
- ✅ Persista en **Supabase** (no localStorage)
- ✅ Sea accesible desde **cualquier dispositivo**
- ✅ Esté **sincronizado en tiempo real**
- ✅ Sobreviva al **cierre de sesión**
- ✅ Notifique cada **5 minutos** cuando esté por vencer
- ✅ Expire automáticamente a los **15 minutos**

---

## 📊 Arquitectura

### **1. Base de Datos (Supabase)**

#### Tabla: `cortesias_activas`
```sql
CREATE TABLE cortesias_activas (
  id TEXT PRIMARY KEY,
  rp_nombre TEXT NOT NULL,
  mesa_id INTEGER NOT NULL,
  mesa_numero TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  tipo_cortesia TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  tiempo_restante INTEGER NOT NULL, -- Segundos (900 = 15 min)
  notificado_10min BOOLEAN DEFAULT FALSE,
  notificado_5min BOOLEAN DEFAULT FALSE,
  estado TEXT DEFAULT 'activa', -- 'activa', 'expirada', 'cerrada'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Funciones SQL:
1. **`crear_cortesia_activa()`** - Crea nueva cortesía
2. **`obtener_cortesias_activas_rp()`** - Obtiene cortesías de un RP
3. **`actualizar_tiempo_cortesias()`** - Reduce 1 segundo a todas
4. **`cerrar_cortesia_activa()`** - Cierra cortesía manualmente
5. **`marcar_notificacion_cortesia()`** - Marca notificación enviada
6. **`limpiar_cortesias_expiradas()`** - Limpia cortesías antiguas

#### Vista: `vista_cortesias_notificar`
```sql
SELECT 
  id, rp_nombre, mesa_numero, descripcion, tiempo_restante,
  CASE 
    WHEN tiempo_restante <= 300 AND NOT notificado_5min THEN '5min'
    WHEN tiempo_restante <= 600 AND NOT notificado_10min THEN '10min'
    ELSE NULL
  END as tipo_notificacion
FROM cortesias_activas
WHERE estado = 'activa'
  AND (
    (tiempo_restante <= 300 AND NOT notificado_5min) OR
    (tiempo_restante <= 600 AND NOT notificado_10min)
  );
```

---

## 💻 Frontend (React/Next.js)

### **Funciones de Supabase (`lib/supabase-clientes.ts`)**

```typescript
// Crear cortesía activa
export async function crearCortesiaActiva(cortesia: {
  id: string
  rp_nombre: string
  mesa_id: number
  mesa_numero: string
  cliente_nombre: string
  tipo_cortesia: string
  descripcion: string
  cantidad: number
  timestamp: number
})

// Obtener cortesías activas del RP
export async function obtenerCortesiasActivasRP(rpNombre: string): Promise<CortesiaActiva[]>

// Actualizar tiempo (cada segundo)
export async function actualizarTiempoCortesias()

// Cerrar cortesía
export async function cerrarCortesiaActiva(id: string)

// Marcar notificación enviada
export async function marcarNotificacionCortesia(id: string, tipo: '10min' | '5min')

// Obtener cortesías que necesitan notificación
export async function obtenerCortesiasParaNotificar()

// Suscripción en tiempo real
export function suscribirCortesiasActivas(
  rpNombre: string, 
  callback: (cortesias: CortesiaActiva[]) => void
)
```

---

## 🔄 Flujo de Trabajo

### **1. Al Autorizar Cortesía**

```typescript
// En handleAutorizarCortesia()
const nuevaCortesia = {
  id: `${mesaSeleccionada.id}-${Date.now()}`,
  rp_nombre: rpNombre,
  mesa_id: mesaSeleccionada.id,
  mesa_numero: mesaSeleccionada.numero,
  cliente_nombre: mesaSeleccionada.cliente_nombre,
  tipo_cortesia: cortesiaForm.tipo,
  descripcion: descripcion,
  cantidad: cortesiaForm.cantidad,
  timestamp: Date.now()
}

// Guardar en Supabase
await crearCortesiaActiva(nuevaCortesia)

// El estado local se actualiza automáticamente vía suscripción
```

### **2. Al Cargar el Dashboard**

```typescript
useEffect(() => {
  // Cargar cortesías activas desde Supabase
  const cargarCortesiasActivas = async () => {
    const cortesias = await obtenerCortesiasActivasRP(rpNombre)
    setCortesiasActivas(cortesias)
  }
  
  cargarCortesiasActivas()
  
  // Suscribirse a cambios en tiempo real
  const channel = suscribirCortesiasActivas(rpNombre, (cortesias) => {
    setCortesiasActivas(cortesias)
  })
  
  return () => {
    channel.unsubscribe()
  }
}, [rpNombre])
```

### **3. Actualizar Tiempo (Cada Segundo)**

```typescript
useEffect(() => {
  const timer = setInterval(async () => {
    // Actualizar en Supabase
    await actualizarTiempoCortesias()
    
    // Recargar cortesías
    const cortesias = await obtenerCortesiasActivasRP(rpNombre)
    setCortesiasActivas(cortesias)
  }, 1000)
  
  return () => clearInterval(timer)
}, [rpNombre])
```

### **4. Notificaciones (Cada 5 Minutos)**

```typescript
useEffect(() => {
  const notificacionesTimer = setInterval(async () => {
    const cortesiasNotificar = await obtenerCortesiasParaNotificar()
    
    cortesiasNotificar.forEach(async (cortesia) => {
      if (cortesia.tipo_notificacion === '5min') {
        // Mostrar notificación
        alert(`⚠️ URGENTE: Cortesía en Mesa ${cortesia.mesa_numero} expira en 5 minutos!\n\n${cortesia.descripcion}`)
        
        // Marcar como notificado
        await marcarNotificacionCortesia(cortesia.id, '5min')
      } else if (cortesia.tipo_notificacion === '10min') {
        // Mostrar notificación
        alert(`⏰ Cortesía en Mesa ${cortesia.mesa_numero} expira en 10 minutos\n\n${cortesia.descripcion}`)
        
        // Marcar como notificado
        await marcarNotificacionCortesia(cortesia.id, '10min')
      }
    })
  }, 60000) // Cada minuto (para detectar cambios)
  
  return () => clearInterval(notificacionesTimer)
}, [])
```

### **5. Cerrar Cortesía**

```typescript
const handleCerrarCortesia = async (cortesiaId: string) => {
  await cerrarCortesiaActiva(cortesiaId)
  // El estado se actualiza automáticamente vía suscripción
}
```

---

## 🎨 Interfaz de Usuario

### **Badge Flotante**
```
┌──────────────────┐
│  🎁③  Mesa 1     │
│  3 cortesías     │
│  ⏰ 12:35        │
└──────────────────┘
```

### **Diálogo de Cortesías**
```
┌─────────────────────────────────────┐
│ 🎁 Cortesías Activas - Mesa 1       │
│ 3 cortesía(s) autorizada(s)         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 5 Shots de cortesía    14:35    │ │
│ │ Cliente: Juan Pérez             │ │
│ │ Cantidad: 5  │  Autorizado: 8pm │ │
│ │ [Ver Detalles] [Cerrar]         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **Notificación de Expiración**
```
⚠️ URGENTE: Cortesía en Mesa 1 expira en 5 minutos!

5 Shots de cortesía
Cliente: Juan Pérez

[Aceptar]
```

---

## 📱 Sincronización Multi-Dispositivo

### **Escenario 1: RP en Móvil y Tablet**
```
1. RP autoriza cortesía en móvil
2. Se guarda en Supabase
3. Tablet recibe actualización en tiempo real
4. Ambos dispositivos muestran la cortesía
5. RP cierra cortesía en tablet
6. Móvil recibe actualización y la oculta
```

### **Escenario 2: Cierre de Sesión**
```
1. RP tiene 3 cortesías activas
2. Cierra sesión
3. Inicia sesión en otro dispositivo
4. Supabase devuelve las 3 cortesías activas
5. Temporizadores continúan desde donde quedaron
```

### **Escenario 3: Expiración Automática**
```
1. Cortesía con 00:05 restantes
2. Función actualizar_tiempo_cortesias() reduce a 00:04
3. Continúa hasta 00:00
4. Estado cambia a 'expirada'
5. Frontend deja de mostrarla
6. Limpieza automática después de 1 hora
```

---

## ⏱️ Temporizadores

### **Timer 1: Actualización de Tiempo (1 segundo)**
```typescript
setInterval(async () => {
  await actualizarTiempoCortesias()
  const cortesias = await obtenerCortesiasActivasRP(rpNombre)
  setCortesiasActivas(cortesias)
}, 1000)
```

### **Timer 2: Notificaciones (1 minuto)**
```typescript
setInterval(async () => {
  const cortesiasNotificar = await obtenerCortesiasParaNotificar()
  // Procesar notificaciones
}, 60000)
```

### **Timer 3: Limpieza (1 hora) - Backend**
```sql
-- Ejecutar cada hora vía cron job o similar
SELECT limpiar_cortesias_expiradas();
```

---

## 🔔 Sistema de Notificaciones

### **Notificación a los 10 minutos:**
- Tipo: Informativa
- Mensaje: "⏰ Cortesía en Mesa X expira en 10 minutos"
- Color: Ámbar
- Sonido: Suave

### **Notificación a los 5 minutos:**
- Tipo: Urgente
- Mensaje: "⚠️ URGENTE: Cortesía en Mesa X expira en 5 minutos!"
- Color: Rojo
- Sonido: Fuerte
- Vibración (móvil)

### **Marcado de Notificaciones:**
```typescript
// Evitar notificaciones duplicadas
if (!cortesia.notificado_5min && cortesia.tiempo_restante <= 300) {
  mostrarNotificacion('5min', cortesia)
  await marcarNotificacionCortesia(cortesia.id, '5min')
}
```

---

## 📋 Pasos de Implementación

### **Paso 1: Ejecutar SQL en Supabase**
```bash
1. Abrir Supabase Dashboard
2. Ir a SQL Editor
3. Copiar contenido de CREAR-CORTESIAS-ACTIVAS.sql
4. Ejecutar
5. Verificar: SELECT * FROM cortesias_activas;
```

### **Paso 2: Actualizar Frontend**
```typescript
// En /app/dashboard/rp/page.tsx

import {
  crearCortesiaActiva,
  obtenerCortesiasActivasRP,
  actualizarTiempoCortesias,
  cerrarCortesiaActiva,
  suscribirCortesiasActivas,
  obtenerCortesiasParaNotificar,
  marcarNotificacionCortesia
} from '@/lib/supabase-clientes'

// Reemplazar estado local por Supabase
// Agregar suscripción en tiempo real
// Implementar notificaciones
```

### **Paso 3: Probar**
```
1. Autorizar cortesía en dispositivo A
2. Verificar que aparece en dispositivo B
3. Esperar 10 minutos → Verificar notificación
4. Esperar 5 minutos más → Verificar notificación urgente
5. Cerrar sesión y volver a entrar
6. Verificar que cortesías siguen activas
```

---

## ✅ Beneficios

1. **Persistencia Real**
   - No se pierden cortesías al cerrar sesión
   - Datos en la nube, no en dispositivo

2. **Multi-Dispositivo**
   - Acceso desde móvil, tablet, desktop
   - Sincronización automática

3. **Tiempo Real**
   - Cambios instantáneos en todos los dispositivos
   - No necesita recargar página

4. **Notificaciones Inteligentes**
   - Avisos a tiempo para no perder cortesías
   - Evita duplicados con marcado

5. **Escalabilidad**
   - Soporta múltiples RPs simultáneamente
   - Limpieza automática de datos antiguos

---

## 🚀 Próximos Pasos

1. ✅ Ejecutar SQL en Supabase
2. ⏳ Actualizar componente RP para usar Supabase
3. ⏳ Implementar notificaciones push (opcional)
4. ⏳ Agregar sonidos y vibraciones
5. ⏳ Dashboard de administración de cortesías

---

## 📁 Archivos Creados

1. **`CREAR-CORTESIAS-ACTIVAS.sql`** - Script SQL completo
2. **`lib/supabase-clientes.ts`** - Funciones de Supabase (actualizado)
3. **`SISTEMA-CORTESIAS-TIEMPO-REAL.md`** - Esta documentación

---

## Fecha de Creación
31 de Octubre, 2025

## Estado
✅ **SQL LISTO - FRONTEND PENDIENTE**
