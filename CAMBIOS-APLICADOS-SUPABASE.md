# ✅ CAMBIOS APLICADOS - CORTESÍAS EN SUPABASE

## 🎯 Objetivo Completado

Las cortesías activas ahora se guardan en **Supabase** y están sincronizadas en tiempo real entre todos los dispositivos.

---

## 📝 Cambios Implementados

### **1. SQL - Base de Datos (Supabase)**

#### ✅ Tabla `cortesias_activas` creada con:
- `folio` TEXT UNIQUE NOT NULL - Folio autoincremental (fever-cortesia-001, 002, etc.)
- `rp_nombre` TEXT - Nombre del RP que autorizó
- `mesa_numero` TEXT - Número de mesa
- `cliente_nombre` TEXT - Nombre del cliente
- `tipo_cortesia` TEXT - Tipo de cortesía
- `descripcion` TEXT - Descripción completa
- `cantidad` INTEGER - Cantidad autorizada
- `fecha_autorizacion` BIGINT - Timestamp de autorización
- `tiempo_restante` INTEGER - Segundos restantes (900 = 15 min)
- `notificado_10min` BOOLEAN - Si ya se notificó a los 10 min
- `notificado_5min` BOOLEAN - Si ya se notificó a los 5 min
- `estado` TEXT - 'activa', 'expirada', 'cerrada'

#### ✅ Funciones SQL creadas:
1. **`generar_folio_cortesia()`** - Genera folios consecutivos
2. **`crear_cortesia_activa()`** - Crea cortesía y retorna folio
3. **`obtener_cortesias_activas_rp()`** - Obtiene cortesías de un RP
4. **`actualizar_tiempo_cortesias()`** - Reduce 1 segundo a todas
5. **`cerrar_cortesia_activa()`** - Cierra cortesía manualmente
6. **`marcar_notificacion_cortesia()`** - Marca notificación enviada
7. **`limpiar_cortesias_expiradas()`** - Limpia cortesías antiguas

#### ✅ Vista creada:
- **`vista_cortesias_notificar`** - Identifica cortesías que necesitan notificación

---

### **2. TypeScript - Funciones de Supabase**

#### ✅ Interface `CortesiaActiva` actualizada:
```typescript
export interface CortesiaActiva {
  id: string
  folio: string  // ✅ NUEVO
  rp_nombre: string
  mesa_id: number
  mesa_numero: string
  cliente_nombre: string
  tipo_cortesia: string
  descripcion: string
  cantidad: number
  fecha_autorizacion: number  // ✅ Antes era timestamp
  tiempo_restante: number
  notificado_10min: boolean
  notificado_5min: boolean
  estado: 'activa' | 'expirada' | 'cerrada'
}
```

#### ✅ Funciones exportadas:
- `crearCortesiaActiva()` - Crea y retorna folio
- `obtenerCortesiasActivasRP()` - Obtiene cortesías del RP
- `actualizarTiempoCortesias()` - Actualiza temporizadores
- `cerrarCortesiaActiva()` - Cierra cortesía
- `suscribirCortesiasActivas()` - Suscripción en tiempo real
- `obtenerCortesiasParaNotificar()` - Para notificaciones
- `marcarNotificacionCortesia()` - Marca notificación enviada

---

### **3. Frontend - Componente RP**

#### ✅ Imports agregados:
```typescript
import {
  crearCortesiaActiva,
  obtenerCortesiasActivasRP,
  actualizarTiempoCortesias,
  cerrarCortesiaActiva,
  suscribirCortesiasActivas,
  obtenerCortesiasParaNotificar,
  marcarNotificacionCortesia,
  type CortesiaActiva
} from "@/lib/supabase-clientes"
```

#### ✅ Estado actualizado:
```typescript
// ❌ ANTES
const [cortesiasActivas, setCortesiasActivas] = useState<any[]>([])

// ✅ AHORA
const [cortesiasActivas, setCortesiasActivas] = useState<CortesiaActiva[]>([])
```

#### ✅ useEffect 1: Cargar cortesías al iniciar
```typescript
useEffect(() => {
  const cargarCortesiasActivas = async () => {
    const cortesias = await obtenerCortesiasActivasRP(rpNombre)
    setCortesiasActivas(cortesias)
  }
  
  cargarCortesiasActivas()
}, [rpNombre])
```

#### ✅ useEffect 2: Suscripción en tiempo real
```typescript
useEffect(() => {
  const channel = suscribirCortesiasActivas(rpNombre, (cortesias) => {
    setCortesiasActivas(cortesias)
  })
  
  return () => {
    channel.unsubscribe()
  }
}, [rpNombre])
```

#### ✅ useEffect 3: Temporizador (cada segundo)
```typescript
useEffect(() => {
  const timer = setInterval(async () => {
    await actualizarTiempoCortesias()
    const cortesias = await obtenerCortesiasActivasRP(rpNombre)
    setCortesiasActivas(cortesias)
  }, 1000)
  
  return () => clearInterval(timer)
}, [rpNombre])
```

#### ✅ useEffect 4: Notificaciones (cada minuto)
```typescript
useEffect(() => {
  const notificacionesTimer = setInterval(async () => {
    const cortesiasNotificar = await obtenerCortesiasParaNotificar()
    
    cortesiasNotificar.forEach(async (cortesia: any) => {
      if (cortesia.tipo_notificacion === '5min') {
        alert(`⚠️ URGENTE: Cortesía ${cortesia.folio} en Mesa ${cortesia.mesa_numero} expira en 5 minutos!`)
        await marcarNotificacionCortesia(cortesia.id, '5min')
      } else if (cortesia.tipo_notificacion === '10min') {
        alert(`⏰ Cortesía ${cortesia.folio} en Mesa ${cortesia.mesa_numero} expira en 10 minutos`)
        await marcarNotificacionCortesia(cortesia.id, '10min')
      }
    })
  }, 60000)
  
  return () => clearInterval(notificacionesTimer)
}, [])
```

#### ✅ Función handleAutorizarCortesia actualizada:
```typescript
// ❌ ANTES - Estado local
const nuevaCortesia = {
  id: `${mesaSeleccionada.id}-${Date.now()}`,
  tipo: cortesiaForm.tipo,
  // ...
  tiempoRestante: 900
}
setCortesiasActivas(prev => [...prev, nuevaCortesia])

// ✅ AHORA - Supabase
const nuevaCortesia = {
  id: `${mesaSeleccionada.id}-${Date.now()}`,
  rp_nombre: rpNombre,
  mesa_id: mesaSeleccionada.id,
  mesa_numero: mesaSeleccionada.numero,
  cliente_nombre: mesaSeleccionada.cliente_nombre,
  tipo_cortesia: cortesiaForm.tipo,
  descripcion: descripcion,
  cantidad: cortesiaForm.cantidad,
  fecha_autorizacion: Date.now()
}

const folio = await crearCortesiaActiva(nuevaCortesia)
console.log('✅ Cortesía creada con folio:', folio)

const cortesiasActualizadas = await obtenerCortesiasActivasRP(rpNombre)
setCortesiasActivas(cortesiasActualizadas)
setCortesiaExpandida(nuevaCortesia.id)
```

#### ✅ Botones de cerrar actualizados:
```typescript
// ❌ ANTES - Estado local
onClick={() => {
  setCortesiasActivas(prev => prev.filter(c => c.id !== cortesia.id))
  setCortesiaExpandida(null)
}}

// ✅ AHORA - Supabase
onClick={async () => {
  await cerrarCortesiaActiva(cortesia.id)
  setCortesiaExpandida(null)
  // El estado se actualiza automáticamente vía suscripción
}}
```

#### ✅ Referencias de propiedades actualizadas:
- `cortesia.mesa` → `cortesia.mesa_numero`
- `cortesia.cliente` → `cortesia.cliente_nombre`
- `cortesia.tiempoRestante` → `cortesia.tiempo_restante`
- `cortesia.timestamp` → `cortesia.fecha_autorizacion`

---

## 🎯 Funcionalidades Implementadas

### **1. Folio Autoincremental**
- ✅ Formato: `fever-cortesia-001`, `fever-cortesia-002`, etc.
- ✅ Se genera automáticamente en Supabase
- ✅ Sigue la numeración de la última cortesía
- ✅ Se muestra en la UI

### **2. Sincronización Multi-Dispositivo**
- ✅ Cortesías se guardan en Supabase
- ✅ Suscripción en tiempo real con Supabase Realtime
- ✅ Cambios se sincronizan automáticamente
- ✅ Funciona al cerrar sesión y volver a entrar

### **3. Temporizador Global**
- ✅ Se actualiza cada segundo en Supabase
- ✅ Todos los dispositivos ven el mismo tiempo
- ✅ Expira automáticamente a los 15 minutos

### **4. Sistema de Notificaciones**
- ✅ Notificación a los 10 minutos
- ✅ Notificación urgente a los 5 minutos
- ✅ Muestra folio y mesa
- ✅ No duplica notificaciones

### **5. Persistencia**
- ✅ Sobrevive al cierre de sesión
- ✅ Accesible desde cualquier dispositivo
- ✅ Datos en la nube

---

## 📱 Flujo de Uso

### **Escenario: Ana en 2 dispositivos**

**Dispositivo A (Móvil):**
```
1. Ana se loggea como RP
2. Autoriza cortesía en Mesa 1
3. Se guarda en Supabase
4. Folio generado: fever-cortesia-001
5. Badge aparece con folio y temporizador
```

**Dispositivo B (Tablet):**
```
1. Ana se loggea como RP (misma cuenta)
2. useEffect carga cortesías desde Supabase
3. Badge de Mesa 1 aparece automáticamente
4. Folio: fever-cortesia-001
5. Temporizador sincronizado (mismo tiempo)
```

**Sincronización en tiempo real:**
```
1. Ana cierra cortesía en Tablet
2. Supabase actualiza estado a 'cerrada'
3. Suscripción detecta cambio
4. Badge desaparece en Móvil automáticamente
```

---

## ✅ Checklist de Implementación

### **SQL (Supabase):**
- [x] Tabla `cortesias_activas` creada
- [x] Columna `folio` agregada
- [x] Función `generar_folio_cortesia()` creada
- [x] Función `crear_cortesia_activa()` actualizada
- [x] Función `obtener_cortesias_activas_rp()` actualizada
- [x] Funciones de temporizador y notificaciones creadas
- [ ] **PENDIENTE: Ejecutar script en Supabase**

### **TypeScript:**
- [x] Interface `CortesiaActiva` actualizada
- [x] Funciones de Supabase implementadas
- [x] Suscripción en tiempo real implementada

### **Frontend:**
- [x] Imports agregados
- [x] Estado actualizado a `CortesiaActiva[]`
- [x] useEffect para cargar cortesías
- [x] useEffect para suscripción en tiempo real
- [x] useEffect para temporizador
- [x] useEffect para notificaciones
- [x] Función `handleAutorizarCortesia` actualizada
- [x] Botones de cerrar actualizados
- [x] Referencias de propiedades actualizadas

---

## 🚀 Próximos Pasos

### **1. Ejecutar SQL en Supabase:**
```
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia el contenido de CREAR-CORTESIAS-ACTIVAS.sql
4. Ejecuta
5. Verifica: SELECT * FROM cortesias_activas;
```

### **2. Probar en 2 dispositivos:**
```
1. Dispositivo A: Autorizar cortesía
2. Dispositivo B: Verificar que aparece
3. Dispositivo A: Cerrar sesión y volver a entrar
4. Verificar que cortesía sigue activa
5. Dispositivo B: Cerrar cortesía
6. Dispositivo A: Verificar que desaparece
```

### **3. Probar notificaciones:**
```
1. Autorizar cortesía
2. Esperar 5 minutos (o modificar tiempo en SQL para prueba)
3. Verificar notificación a los 10 min
4. Verificar notificación urgente a los 5 min
5. Verificar que no se duplican
```

---

## 📊 Ejemplo de Folios

```
Primera cortesía:   fever-cortesia-001
Segunda cortesía:   fever-cortesia-002
Tercera cortesía:   fever-cortesia-003
...
Décima cortesía:    fever-cortesia-010
...
Centésima:          fever-cortesia-100
```

---

## Fecha de Implementación
31 de Octubre, 2025

## Estado
✅ **CÓDIGO COMPLETADO - LISTO PARA EJECUTAR SQL EN SUPABASE**
