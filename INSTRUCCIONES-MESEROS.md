# Sistema de Asignación de Mesas a Meseros

## 📋 Resumen
Se ha implementado un sistema completo para gestionar meseros y asignar mesas específicas a cada uno. Ahora cada mesero solo puede ver y gestionar las mesas que le han sido asignadas.

## 🚀 Pasos de Instalación

### 1. Ejecutar Script SQL en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Abre el archivo `CREAR-TABLA-MESEROS.sql`
4. Copia todo el contenido y pégalo en el editor SQL
5. Haz clic en **Run** para ejecutar el script

Este script creará:
- ✅ Tabla `meseros` con campos: id, nombre, apellido, telefono, email, activo
- ✅ Columna `mesero_id` en la tabla `mesas`
- ✅ 4 meseros de ejemplo (Juan Pérez, María González, Carlos Rodríguez, Ana Martínez)
- ✅ Índices para optimizar búsquedas
- ✅ Triggers para actualizar timestamps automáticamente

### 2. Verificar la Instalación

Ejecuta esta consulta en Supabase para verificar:

```sql
-- Ver meseros creados
SELECT * FROM meseros;

-- Ver estructura de mesas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mesas' AND column_name = 'mesero_id';
```

## 🎯 Funcionalidades Implementadas

### 1. **Gestión de Meseros (Administrador)**
- Ruta: `/dashboard/gestion-meseros`
- Funciones:
  - ➕ Agregar nuevos meseros
  - ✏️ Editar información de meseros
  - 🔄 Activar/Desactivar meseros
  - 🗑️ Eliminar meseros (solo si no tienen mesas activas)
  - 📊 Ver estadísticas de meseros activos/inactivos

### 2. **Selector de Mesero en Login**
- Cuando un usuario selecciona el rol "Mesero" en el selector de roles
- Se muestra un diálogo para elegir su perfil de mesero
- Solo aparecen meseros activos
- Se guarda el ID y nombre del mesero en localStorage

### 3. **Asignación de Mesas (Hostess)**
- Al asignar una mesa a un cliente, la hostess puede:
  - Seleccionar qué mesero atenderá la mesa
  - Ver lista de todos los meseros activos
  - Dejar sin asignar si no hay mesero disponible

### 4. **Vista Filtrada de Mesero**
- Cada mesero solo ve las mesas asignadas a él
- Filtrado automático por `mesero_id`
- Actualización en tiempo real cada 5 segundos
- Muestra nombre completo del mesero en el header

## 📊 Flujo de Trabajo

```
1. ADMINISTRADOR
   └─> Gestiona meseros en /dashboard/gestion-meseros
       └─> Crea/Edita/Activa meseros

2. HOSTESS
   └─> Asigna cliente a mesa
       └─> Selecciona mesero para esa mesa
           └─> Mesa queda vinculada al mesero

3. MESERO
   └─> Inicia sesión y selecciona su perfil
       └─> Solo ve sus mesas asignadas
           └─> Toma pedidos y cierra cuentas
```

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos:
- `CREAR-TABLA-MESEROS.sql` - Script de base de datos
- `app/dashboard/gestion-meseros/page.tsx` - Página de gestión de meseros
- `INSTRUCCIONES-MESEROS.md` - Este archivo

### Archivos Modificados:
- `lib/supabase.ts` - Tipos TypeScript actualizados
- `lib/supabase-clientes.ts` - Funciones con soporte para mesero_id
- `app/dashboard/selector-rol/page.tsx` - Selector de mesero
- `app/dashboard/mesero/page.tsx` - Filtrado por mesero
- `app/dashboard/hostess/page.tsx` - Asignación de mesero

## 🎨 Colores de la Marca

Los componentes usan la paleta de colores FEVER:
- **Naranja**: `orange-500` / `orange-600` (Principal)
- **Ámbar**: `amber-500` / `amber-600` (Secundario)
- **Fondo**: Negro con gradientes naranjas sutiles

## 📱 Uso del Sistema

### Para Administradores:
1. Accede al dashboard principal
2. Ve a "Gestión de Meseros"
3. Agrega los meseros de tu restaurante
4. Activa/desactiva según disponibilidad

### Para Hostess:
1. Al registrar un cliente y asignar mesa
2. Selecciona el mesero disponible del dropdown
3. La mesa quedará asignada a ese mesero

### Para Meseros:
1. En el selector de roles, elige "Mesero"
2. Ingresa la contraseña: `M3S3R02025`
3. Selecciona tu perfil de la lista
4. Solo verás tus mesas asignadas

## 🔐 Contraseñas del Sistema

- **Administrador**: `4DM1N2025!`
- **Hostess**: `H0ST3SS2025`
- **Mesero**: `M3S3R02025`
- **Cadena**: `C4D3N42025`

## ✅ Verificación

Para verificar que todo funciona:

1. ✅ Ejecuta el script SQL en Supabase
2. ✅ Verifica que aparezcan 4 meseros en la tabla
3. ✅ Inicia sesión como Hostess
4. ✅ Asigna una mesa y selecciona un mesero
5. ✅ Inicia sesión como ese mesero
6. ✅ Verifica que solo veas esa mesa

## 🐛 Solución de Problemas

**Problema**: No aparecen meseros en el selector
- **Solución**: Verifica que el script SQL se ejecutó correctamente y que hay meseros activos

**Problema**: El mesero ve todas las mesas
- **Solución**: Verifica que la columna `mesero_id` existe en la tabla `mesas`

**Problema**: Error al asignar mesa
- **Solución**: Verifica que la función `asignarMesaCliente` incluye el parámetro `mesero_id`

## 📞 Soporte

Si tienes problemas:
1. Verifica que ejecutaste el script SQL completo
2. Revisa la consola del navegador para errores
3. Verifica que Supabase esté conectado correctamente
