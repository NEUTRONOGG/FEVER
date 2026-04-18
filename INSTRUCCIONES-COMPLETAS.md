# 📋 Instrucciones Completas de Implementación

## 🎯 Cambios Realizados

### **1. Sistema de Reservaciones - Campos de Género**
### **2. Sistema de Emergencias en Tiempo Real**

---

## 📝 PARTE 1: Actualizar Reservaciones (Género)

### **Cambios en el Código:**

✅ **Archivos Modificados:**
- `/app/dashboard/reservaciones/page.tsx` (Panel de Hostess)
- `/app/dashboard/rp/page.tsx` (Panel de RPs)

✅ **Cambios Realizados:**
- ❌ Eliminado campo "Teléfono" de los formularios
- ✅ Agregados campos "Hombres 👨" y "Mujeres 👩"
- ✅ Valores seleccionables de 0 a 20 para cada género
- ✅ Visualización con emojis en las listas de reservaciones

### **Pasos para Implementar:**

#### **1. Ejecutar SQL en Supabase:**
```sql
-- Copiar y pegar el contenido completo de:
ACTUALIZAR-RESERVACIONES-GENERO.sql
```

#### **2. Verificar en Supabase:**
- Ve a Table Editor > reservaciones
- Verifica que existen las columnas: `numero_hombres` y `numero_mujeres`

#### **3. Probar el Sistema:**
- Crear una nueva reservación desde el panel de Hostess o RP
- Verificar que se pueden seleccionar hombres y mujeres
- Ver que se muestran con emojis 👨👩 en la lista

---

## 🚨 PARTE 2: Sistema de Emergencias en Tiempo Real

### **Cambios en el Código:**

✅ **Archivos Creados:**
- `/components/EmergencyNotification.tsx` - Componente de notificación pop-up
- `/CREAR-TABLA-EMERGENCIAS.sql` - Script SQL

✅ **Archivos Modificados:**
- `/app/dashboard/cadena/page.tsx` - Panel de emergencias actualizado
- `/app/dashboard/layout.tsx` - Integración del componente global

✅ **Tipos de Emergencia:**
1. 👮 **FISCALIZACIÓN** (opción principal, más grande)
2. 🥊 Pelea Interna
3. 🚨 Pelea Externa
4. ⚠️ Emergencia General

### **Pasos para Implementar:**

#### **1. Ejecutar SQL en Supabase:**
```sql
-- Copiar y pegar el contenido completo de:
CREAR-TABLA-EMERGENCIAS.sql
```

#### **2. Habilitar Realtime en Supabase:**
1. Ve a tu proyecto de Supabase
2. Navega a: **Database** > **Replication**
3. Busca la tabla `emergencias`
4. Activa el toggle de **Realtime**
5. Guarda los cambios

#### **3. Verificar la Tabla:**
```sql
SELECT * FROM public.emergencias ORDER BY created_at DESC;
```

#### **4. Probar el Sistema:**

**Prueba Básica:**
1. Abre el CRM en **dos navegadores diferentes** (o pestañas en modo incógnito)
2. En ambos, inicia sesión con diferentes usuarios
3. En el **primer navegador**: ve a `/dashboard/cadena`
4. Haz clic en "Botón de Emergencia"
5. Selecciona "👮 FISCALIZACIÓN" (ya está seleccionada por defecto)
6. Agrega detalles opcionales
7. Haz clic en "🚨 ACTIVAR EMERGENCIA"
8. En el **segundo navegador**: deberías ver aparecer el pop-up instantáneamente

**Prueba Avanzada:**
- Prueba con 3-4 usuarios conectados simultáneamente
- Todos deberían recibir la notificación al mismo tiempo
- Cada usuario puede cerrar su notificación independientemente

---

## 🎨 Características del Sistema de Emergencias

### **Pop-up de Notificación:**
- 🖥️ Pantalla completa con fondo oscuro
- 🎨 Colores distintivos por tipo de emergencia
- ✨ Animaciones de pulso y zoom
- 📍 Información completa: tipo, mensaje, ubicación, quién reportó, hora
- 🔊 Sonido de alerta (si está disponible)
- ✅ Botón "ENTERADO" para cerrar

### **Colores por Tipo:**
- **Fiscalización**: Ámbar/Naranja
- **Peleas**: Rojo intenso
- **Emergencia General**: Rojo

---

## 🔧 Solución de Problemas

### **Problema: No aparece el pop-up**
**Solución:**
1. Verifica que ejecutaste el SQL correctamente
2. Confirma que Realtime está habilitado en Supabase
3. Revisa la consola del navegador (F12) para errores
4. Verifica que ambos usuarios estén en páginas del dashboard

### **Problema: Error al crear emergencia**
**Solución:**
1. Verifica que la tabla `emergencias` existe
2. Confirma que las políticas RLS están configuradas
3. Revisa que el usuario tiene permisos de INSERT

### **Problema: Las reservaciones no guardan género**
**Solución:**
1. Verifica que las columnas existen en la tabla
2. Confirma que ejecutaste el SQL de actualización
3. Revisa la consola para errores de inserción

---

## 📊 Estructura de Datos

### **Tabla: reservaciones**
```sql
- numero_hombres: INTEGER (0-20)
- numero_mujeres: INTEGER (0-20)
- numero_personas: INTEGER (total)
- cliente_nombre: TEXT
- fecha: DATE
- hora: TIME
- rp_nombre: TEXT (opcional)
- estado: TEXT (pendiente/confirmada/completada/cancelada)
```

### **Tabla: emergencias**
```sql
- id: UUID (primary key)
- tipo: TEXT (emergencia/pelea_interna/pelea_externa/fiscalizacion)
- mensaje: TEXT
- reportado_por: TEXT
- ubicacion: TEXT
- activa: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## ✅ Checklist de Implementación

### **Reservaciones:**
- [ ] Ejecutar `ACTUALIZAR-RESERVACIONES-GENERO.sql` en Supabase
- [ ] Verificar columnas en tabla reservaciones
- [ ] Probar crear reservación con género
- [ ] Verificar visualización con emojis

### **Emergencias:**
- [ ] Ejecutar `CREAR-TABLA-EMERGENCIAS.sql` en Supabase
- [ ] Habilitar Realtime para tabla emergencias
- [ ] Verificar tabla creada correctamente
- [ ] Probar notificación con 2+ usuarios conectados
- [ ] Verificar que el pop-up aparece instantáneamente
- [ ] Confirmar que cada usuario puede cerrar su notificación

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás:
- ✅ Sistema de reservaciones con información de género
- ✅ Sistema de emergencias en tiempo real
- ✅ Notificaciones instantáneas a todos los usuarios
- ✅ Interfaz mejorada y más funcional

**Nota:** Recuerda que el sistema de emergencias requiere que Realtime esté habilitado en Supabase para funcionar correctamente.
