# SISTEMA DE LOGIN INDIVIDUAL PARA SOCIOS

## Descripción General
Sistema de acceso individual para cada socio premium con su propia página de login y contraseña personalizada.

## Estructura de Acceso

### Página Principal
**Ruta:** `/socios`
- Muestra 5 botones grandes con el nombre de cada socio
- Cada botón redirige a su página de login individual
- Diseño con grid responsive (1 columna móvil, 2 columnas desktop)
- Cada socio tiene su propio color distintivo

### Páginas de Login Individual

#### 1. ASHTON
- **Ruta:** `/socios/ashton`
- **Teléfono:** 5550000001
- **Contraseña:** ashton2024
- **Color:** Amarillo/Dorado (from-yellow-500 to-yellow-600)

#### 2. AGUS
- **Ruta:** `/socios/agus`
- **Teléfono:** 5550000002
- **Contraseña:** agus2024
- **Color:** Azul (from-blue-500 to-blue-600)

#### 3. CANALES
- **Ruta:** `/socios/canales`
- **Teléfono:** 5550000003
- **Contraseña:** canales2024
- **Color:** Púrpura (from-purple-500 to-purple-600)

#### 4. RICARDO
- **Ruta:** `/socios/ricardo`
- **Teléfono:** 5550000004
- **Contraseña:** ricardo2024
- **Color:** Verde (from-green-500 to-green-600)

#### 5. SOFIA
- **Ruta:** `/socios/sofia`
- **Teléfono:** 5550000005
- **Contraseña:** sofia2024
- **Color:** Rosa (from-pink-500 to-pink-600)

## Características de las Páginas de Login

### Elementos Comunes
- **Botón de regreso:** Flecha para volver a `/socios`
- **Logo:** Corona (👑) con el color del socio
- **Título:** Nombre del socio en mayúsculas
- **Campo único:** Solo contraseña (el teléfono es fijo por socio)
- **Validación:** Verifica contraseña contra base de datos
- **AutoFocus:** El campo de contraseña se enfoca automáticamente

### Flujo de Autenticación
1. Usuario selecciona su nombre en `/socios`
2. Redirige a su página personal (ej: `/socios/ashton`)
3. Ingresa solo su contraseña
4. Sistema valida contra teléfono fijo + contraseña
5. Si es correcta: guarda sesión y redirige a `/dashboard/socios`
6. Si es incorrecta: muestra mensaje de error

### Seguridad
- Cada socio tiene teléfono único (no modificable)
- Contraseña personalizada por socio
- Validación de cuenta activa (`activo = true`)
- Registro de último acceso en base de datos
- Sesión guardada en `sessionStorage`

## Archivos Creados

```
/app/socios/page.tsx              # Selector principal
/app/socios/ashton/page.tsx       # Login Ashton
/app/socios/agus/page.tsx         # Login Agus
/app/socios/canales/page.tsx      # Login Canales
/app/socios/ricardo/page.tsx      # Login Ricardo
/app/socios/sofia/page.tsx        # Login Sofia
```

## Archivos Modificados

```
CREAR-SOCIOS.sql                  # Actualizado con 5 socios
```

## Base de Datos

### Tabla: socios
```sql
INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
('Ashton', '5550000001', 'ashton2024', 1500.00),
('Agus', '5550000002', 'agus2024', 1500.00),
('Canales', '5550000003', 'canales2024', 1500.00),
('Ricardo', '5550000004', 'ricardo2024', 1500.00),
('Sofia', '5550000005', 'sofia2024', 1500.00);
```

## Diseño Visual

### Colores por Socio
- **Ashton:** Amarillo/Dorado - Representa liderazgo y premium
- **Agus:** Azul - Representa confianza y profesionalismo
- **Canales:** Púrpura - Representa creatividad y exclusividad
- **Ricardo:** Verde - Representa crecimiento y estabilidad
- **Sofia:** Rosa - Representa elegancia y sofisticación

### Responsive
- **Móvil:** Botones apilados verticalmente
- **Tablet/Desktop:** Grid de 2 columnas
- **Efectos:** Hover con scale y cambio de opacidad
- **Animaciones:** Transiciones suaves en todos los elementos

## Funcionalidades del Dashboard

Una vez autenticado, cada socio tiene acceso a:
- ✅ Autorizar cortesías (límite $1,500/día)
- 📊 Ver estadísticas del negocio en tiempo real
- 💰 Historial de cortesías del día
- 🎯 Métricas de ventas, clientes y mesas
- 👑 Acceso a funciones premium

## Ventajas del Sistema

1. **Personalización:** Cada socio tiene su propia identidad visual
2. **Simplicidad:** Solo requieren ingresar su contraseña
3. **Seguridad:** Teléfonos fijos no modificables
4. **Trazabilidad:** Registro de último acceso por socio
5. **Escalabilidad:** Fácil agregar más socios en el futuro
6. **UX Optimizada:** Flujo directo sin pasos innecesarios

## Notas de Implementación

- Las contraseñas están en texto plano por simplicidad
- En producción se recomienda usar hash (bcrypt)
- El sistema valida que la cuenta esté activa
- Cada login actualiza el campo `ultimo_acceso`
- La sesión se mantiene en `sessionStorage`
- Al cerrar sesión se limpia el storage y redirige a su login
