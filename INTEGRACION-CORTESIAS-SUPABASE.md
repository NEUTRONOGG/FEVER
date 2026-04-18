# INTEGRACIÓN DE CORTESÍAS ACTIVAS CON SUPABASE

## 🎯 Problema Identificado

**Situación Actual:**
- Las cortesías activas se guardan en `useState` (memoria local del navegador)
- Al cerrar sesión o cambiar de dispositivo, se pierden
- No hay sincronización entre dispositivos

**Solución:**
- Guardar cortesías en **Supabase**
- Sincronización en **tiempo real**
- Acceso desde **cualquier dispositivo**
- **Folio autoincremental**: `fever-cortesia-001`, `fever-cortesia-002`, etc.

---

## ✅ Cambios Implementados en SQL

### 1. **Columna `folio` agregada:**
```sql
CREATE TABLE cortesias_activas (
  id TEXT PRIMARY KEY,
  folio TEXT UNIQUE NOT NULL,  -- ✅ NUEVO
  rp_nombre TEXT NOT NULL,
  mesa_id INTEGER NOT NULL,
  -- ... resto de columnas
);
```

### 2. **Función para generar folio:**
```sql
CREATE OR REPLACE FUNCTION generar_folio_cortesia()
RETURNS TEXT AS $$
DECLARE
  ultimo_numero INTEGER;
  nuevo_folio TEXT;
BEGIN
  -- Obtener el último número
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(folio FROM 'fever-cortesia-(\d+)') AS INTEGER)),
    0
  ) INTO ultimo_numero
  FROM cortesias_activas;
  
  -- Generar: fever-cortesia-001, fever-cortesia-002, etc.
  nuevo_folio := 'fever-cortesia-' || LPAD((ultimo_numero + 1)::TEXT, 3, '0');
  
  RETURN nuevo_folio;
END;
$$ LANGUAGE plpgsql;
```

### 3. **Función crear_cortesia_activa actualizada:**
```sql
-- Ahora genera el folio automáticamente y lo retorna
RETURNS TEXT AS $$  -- Retorna el folio generado
DECLARE
  nuevo_folio TEXT;
BEGIN
  nuevo_folio := generar_folio_cortesia();
  
  INSERT INTO cortesias_activas (
    id,
    folio,  -- ✅ NUEVO
    -- ... resto
  ) VALUES (
    p_id,
    nuevo_folio,  -- ✅ NUEVO
    -- ... resto
  );
  
  RETURN nuevo_folio;  -- ✅ Retorna folio
END;
```

---

## 💻 Cambios en Frontend

### **Interface actualizada (`lib/supabase-clientes.ts`):**
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
  fecha_autorizacion: number
  tiempo_restante: number
  notificado_10min: boolean
  notificado_5min: boolean
  estado: 'activa' | 'expirada' | 'cerrada'
}
```

---

## 🔄 Integración en `/app/dashboard/rp/page.tsx`

### **Paso 1: Importar funciones de Supabase**
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
} from '@/lib/supabase-clientes'
```

### **Paso 2: Cambiar estado local por Supabase**

**❌ ANTES (Estado Local):**
```typescript
const [cortesiasActivas, setCortesiasActivas] = useState<any[]>([])

// Al autorizar
const nuevaCortesia = {
  id: `${mesaSeleccionada.id}-${Date.now()}`,
  tipo: cortesiaForm.tipo,
  // ...
  tiempoRestante: 900
}
setCortesiasActivas(prev => [...prev, nuevaCortesia])
```

**✅ AHORA (Supabase):**
```typescript
const [cortesiasActivas, setCortesiasActivas] = useState<CortesiaActiva[]>([])

// Al autorizar
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

// Guardar en Supabase
const folio = await crearCortesiaActiva(nuevaCortesia)
console.log('Cortesía creada con folio:', folio) // fever-cortesia-001

// El estado se actualiza automáticamente vía suscripción
```

### **Paso 3: Cargar cortesías al iniciar**
```typescript
useEffect(() => {
  const cargarCortesiasActivas = async () => {
    const cortesias = await obtenerCortesiasActivasRP(rpNombre)
    setCortesiasActivas(cortesias)
  }
  
  cargarCortesiasActivas()
}, [rpNombre])
```

### **Paso 4: Suscripción en tiempo real**
```typescript
useEffect(() => {
  // Suscribirse a cambios en tiempo real
  const channel = suscribirCortesiasActivas(rpNombre, (cortesias) => {
    setCortesiasActivas(cortesias)
  })
  
  return () => {
    channel.unsubscribe()
  }
}, [rpNombre])
```

### **Paso 5: Actualizar temporizador**

**❌ ANTES (Local):**
```typescript
useEffect(() => {
  if (cortesiasActivas.length > 0) {
    const timer = setInterval(() => {
      setCortesiasActivas(prev => {
        const actualizadas = prev.map(cortesia => ({
          ...cortesia,
          tiempoRestante: cortesia.tiempoRestante - 1
        })).filter(cortesia => cortesia.tiempoRestante > 0)
        return actualizadas
      })
    }, 1000)
    return () => clearInterval(timer)
  }
}, [cortesiasActivas.length])
```

**✅ AHORA (Supabase):**
```typescript
useEffect(() => {
  const timer = setInterval(async () => {
    // Actualizar en Supabase (reduce 1 segundo a todas)
    await actualizarTiempoCortesias()
    
    // Recargar cortesías actualizadas
    const cortesias = await obtenerCortesiasActivasRP(rpNombre)
    setCortesiasActivas(cortesias)
  }, 1000)
  
  return () => clearInterval(timer)
}, [rpNombre])
```

### **Paso 6: Cerrar cortesía**

**❌ ANTES (Local):**
```typescript
onClick={() => {
  setCortesiasActivas(prev => prev.filter(c => c.id !== cortesia.id))
  setCortesiaExpandida(null)
}}
```

**✅ AHORA (Supabase):**
```typescript
onClick={async () => {
  await cerrarCortesiaActiva(cortesia.id)
  setCortesiaExpandida(null)
  // El estado se actualiza automáticamente vía suscripción
}}
```

### **Paso 7: Notificaciones**
```typescript
useEffect(() => {
  const notificacionesTimer = setInterval(async () => {
    const cortesiasNotificar = await obtenerCortesiasParaNotificar()
    
    cortesiasNotificar.forEach(async (cortesia: any) => {
      if (cortesia.tipo_notificacion === '5min') {
        alert(`⚠️ URGENTE: Cortesía ${cortesia.folio} en Mesa ${cortesia.mesa_numero} expira en 5 minutos!\n\n${cortesia.descripcion}`)
        await marcarNotificacionCortesia(cortesia.id, '5min')
      } else if (cortesia.tipo_notificacion === '10min') {
        alert(`⏰ Cortesía ${cortesia.folio} en Mesa ${cortesia.mesa_numero} expira en 10 minutos\n\n${cortesia.descripcion}`)
        await marcarNotificacionCortesia(cortesia.id, '10min')
      }
    })
  }, 60000) // Cada minuto
  
  return () => clearInterval(notificacionesTimer)
}, [])
```

---

## 🎨 Actualizar UI para mostrar folio

### **Badge Flotante:**
```typescript
<div className="glass rounded-2xl p-3 ...">
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 ...">
      <Gift className="w-5 h-5 text-white" />
      {cortesias.length > 1 && (
        <div className="absolute -top-1 -right-1 ...">
          <span>{cortesias.length}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold text-emerald-400">
        Mesa {mesa}
      </p>
      <p className="text-[10px] text-slate-400">
        {cortesias.length} cortesía{cortesias.length > 1 ? 's' : ''}
      </p>
      {/* ✅ MOSTRAR FOLIO */}
      <p className="text-[9px] text-slate-500">
        {cortesias[0].folio}
      </p>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-500" />
        <span className="text-xs font-bold text-amber-500">
          {Math.floor(tiempoMenor / 60)}:{(tiempoMenor % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  </div>
</div>
```

### **Diálogo de Cortesías:**
```typescript
<div className="glass rounded-xl p-4 ...">
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1">
      {/* ✅ MOSTRAR FOLIO */}
      <p className="text-xs text-slate-500 mb-1">{cortesia.folio}</p>
      <p className="text-lg font-bold text-emerald-500">
        {cortesia.descripcion}
      </p>
      <p className="text-sm text-slate-400">
        Cliente: {cortesia.cliente}
      </p>
    </div>
    <div className="text-right">
      <p className="text-2xl font-bold text-amber-500">
        {Math.floor(cortesia.tiempo_restante / 60)}:{(cortesia.tiempo_restante % 60).toString().padStart(2, '0')}
      </p>
      <p className="text-xs text-slate-500">restante</p>
    </div>
  </div>
  {/* ... resto */}
</div>
```

---

## 📱 Flujo Multi-Dispositivo

### **Escenario: RP Ana en 2 dispositivos**

**Dispositivo A (Móvil):**
```
1. Ana se loggea como RP
2. Autoriza cortesía en Mesa 1
3. Se guarda en Supabase con folio: fever-cortesia-001
4. Badge aparece en pantalla
```

**Dispositivo B (Tablet):**
```
1. Ana se loggea como RP (misma cuenta)
2. useEffect carga cortesías desde Supabase
3. Badge de Mesa 1 aparece automáticamente
4. Folio: fever-cortesia-001
5. Temporizador sincronizado
```

**Sincronización en tiempo real:**
```
1. Ana cierra cortesía en Tablet
2. Supabase actualiza estado a 'cerrada'
3. Suscripción detecta cambio
4. Badge desaparece en Móvil automáticamente
```

---

## 🔢 Ejemplo de Folios

```
Primera cortesía:  fever-cortesia-001
Segunda cortesía:  fever-cortesia-002
Tercera cortesía:  fever-cortesia-003
...
Décima cortesía:   fever-cortesia-010
...
Centésima:         fever-cortesia-100
```

---

## ✅ Checklist de Implementación

### **SQL (Supabase):**
- [x] Agregar columna `folio`
- [x] Crear función `generar_folio_cortesia()`
- [x] Actualizar función `crear_cortesia_activa()`
- [x] Actualizar función `obtener_cortesias_activas_rp()`
- [ ] **Ejecutar script en Supabase**

### **TypeScript:**
- [x] Actualizar interface `CortesiaActiva`
- [x] Funciones de Supabase listas

### **Frontend (page.tsx):**
- [ ] Importar funciones de Supabase
- [ ] Reemplazar `useState` local por Supabase
- [ ] Implementar `useEffect` para cargar cortesías
- [ ] Implementar suscripción en tiempo real
- [ ] Actualizar temporizador para usar Supabase
- [ ] Actualizar función de cerrar cortesía
- [ ] Implementar notificaciones
- [ ] Mostrar folio en UI

---

## 🚀 Próximos Pasos

1. **Ejecutar SQL en Supabase:**
   ```
   - Abrir Supabase Dashboard
   - SQL Editor
   - Copiar CREAR-CORTESIAS-ACTIVAS.sql
   - Ejecutar
   ```

2. **Actualizar componente RP:**
   ```
   - Seguir pasos de integración
   - Probar en 2 dispositivos
   - Verificar sincronización
   ```

3. **Probar:**
   ```
   - Autorizar cortesía en dispositivo A
   - Verificar que aparece en dispositivo B
   - Cerrar sesión y volver a entrar
   - Verificar que cortesías siguen activas
   - Verificar folios consecutivos
   ```

---

## Fecha de Creación
31 de Octubre, 2025

## Estado
✅ **SQL LISTO CON FOLIOS - FRONTEND PENDIENTE**
