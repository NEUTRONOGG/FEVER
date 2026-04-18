# 👑 SISTEMA DE SOCIOS PREMIUM

Sistema exclusivo para socios del restaurante con cortesías premium de $1500 y acceso a estadísticas clave del negocio.

---

## 📋 CARACTERÍSTICAS PRINCIPALES

### 1. CORTESÍAS PREMIUM
- **Límite diario**: $1500 por socio
- **Tipos de cortesías**:
  - 🍾 Botella Premium
  - 💰 Descuento Especial
  - 🥃 Shots Premium
  - 🎫 Entrada VIP
  - 👑 Mesa VIP
  - 🎁 Otro

### 2. ESTADÍSTICAS EN TIEMPO REAL
- **Ventas del día**: Total de ventas y ticket promedio
- **Ventas del mes**: Acumulado mensual
- **Clientes del día**: Cantidad de clientes y reservaciones
- **Ocupación de mesas**: Porcentaje en tiempo real
- **FeverCoins**: Circulación total

### 3. GESTIÓN DE CORTESÍAS
- Autorización de cortesías con validación de límites
- Selección de mesa y cliente
- Monto personalizable
- Historial completo del día
- Estado de canje (Pendiente/Canjeado)

---

## 🔐 ACCESO AL SISTEMA

### Credenciales de Prueba
```
Teléfono: 5550000001
Contraseña: socio2024
```

### Flujo de Acceso
1. Página de login principal → Botón "Acceder como Socio"
2. Login de socios → Ingresar teléfono y contraseña
3. Dashboard de socios → Acceso completo

---

## 🗄️ BASE DE DATOS

### Tabla: `socios`
```sql
- id (SERIAL PRIMARY KEY)
- nombre (VARCHAR)
- telefono (VARCHAR UNIQUE)
- password (VARCHAR)
- activo (BOOLEAN)
- limite_cortesias (DECIMAL) - Default: 1500.00
- cortesias_usadas_hoy (DECIMAL)
- fecha_creacion (TIMESTAMP)
- ultimo_acceso (TIMESTAMP)
- notas (TEXT)
```

### Tabla: `cortesias_socios`
```sql
- id (SERIAL PRIMARY KEY)
- socio_id (INTEGER FK)
- tipo_cortesia (VARCHAR)
- mesa_id (INTEGER FK)
- cliente_id (INTEGER FK)
- cantidad (INTEGER)
- monto (DECIMAL)
- fecha_autorizacion (TIMESTAMP)
- canjeado (BOOLEAN)
- fecha_canje (TIMESTAMP)
- notas (TEXT)
```

### Vista: `vista_stats_socios`
Proporciona todas las estadísticas en tiempo real:
- Ventas del día y del mes
- Tickets y clientes
- Mesas ocupadas
- Ticket promedio
- Cortesías del día
- Reservaciones
- FeverCoins en circulación

---

## 🛠️ FUNCIONES SQL

### `autorizar_cortesia_socio()`
Autoriza una cortesía validando:
- Socio activo
- Límite disponible
- Monto válido

**Retorna**: JSON con resultado de la operación

### `resetear_cortesias_socios_diarias()`
Resetea el contador de cortesías usadas diariamente.

---

## 📱 INTERFAZ DE USUARIO

### Login de Socios (`/socios`)
- Diseño premium con gradiente púrpura/rosa
- Icono de corona dorada
- Validación de credenciales
- Mensaje de error amigable
- Credenciales de prueba visibles

### Dashboard de Socios (`/dashboard/socios`)
- **Header**: Nombre del socio y botón de logout
- **Panel de Cortesías**:
  - Límite diario, usado y disponible
  - Barra de progreso con colores dinámicos
  - Botón para autorizar cortesías
- **Estadísticas del Negocio**:
  - 4 cards con métricas clave
  - Actualización cada 10 segundos
- **Historial de Cortesías**:
  - Lista del día con detalles
  - Estado de canje
  - Hora de autorización

### Dialog de Autorización
- Selección de tipo de cortesía
- Selección de mesa (solo ocupadas)
- Selección de cliente
- Cantidad y monto
- Validación de límite disponible
- Confirmación con mensaje de éxito

---

## 🎨 DISEÑO

### Colores
- **Principal**: Amarillo/Dorado (#EAB308)
- **Secundario**: Púrpura (#A855F7)
- **Fondo**: Negro con gradientes
- **Acentos**: Rosa (#EC4899)

### Iconos
- 👑 Corona (Crown) - Identidad de socios
- 🎁 Regalo (Gift) - Cortesías
- 📊 Gráficas - Estadísticas
- ✨ Sparkles - Premium

---

## 📂 ARCHIVOS CREADOS

### SQL
- `CREAR-SOCIOS.sql` - Script completo de instalación

### Frontend
- `/app/socios/page.tsx` - Login de socios
- `/app/dashboard/socios/page.tsx` - Dashboard principal

### Modificados
- `/app/login/page.tsx` - Agregado botón de acceso a socios

---

## 🔄 FLUJO DE TRABAJO

### Autorización de Cortesía
1. Socio inicia sesión
2. Verifica límite disponible
3. Selecciona tipo de cortesía
4. Selecciona mesa y cliente
5. Define cantidad y monto
6. Sistema valida límite
7. Autoriza cortesía
8. Actualiza contador de uso
9. Registra en historial

### Actualización de Datos
- **Estadísticas**: Cada 10 segundos
- **Cortesías usadas**: En tiempo real
- **Límite disponible**: Calculado dinámicamente

---

## 🚀 CARACTERÍSTICAS TÉCNICAS

### Seguridad
- Autenticación por teléfono y contraseña
- Sesión almacenada en sessionStorage
- Validación de socio activo
- Redirección si no hay sesión

### Performance
- Actualización automática cada 10 segundos
- Queries optimizadas con índices
- Vista materializada para estadísticas
- Carga asíncrona de datos

### UX/UI
- Diseño responsive (móvil, tablet, desktop)
- Animaciones suaves
- Feedback visual inmediato
- Mensajes de error claros
- Confirmaciones de éxito

---

## 📊 MÉTRICAS DISPONIBLES

### Dashboard Principal
1. **Ventas Hoy**: Total + Ticket promedio
2. **Ventas del Mes**: Acumulado mensual + Tickets del día
3. **Clientes Hoy**: Cantidad + Reservaciones
4. **Mesas Ocupadas**: Cantidad + Porcentaje de ocupación

### Panel de Cortesías
1. **Límite Diario**: $1500
2. **Usado Hoy**: Monto acumulado
3. **Disponible**: Límite - Usado
4. **Porcentaje de Uso**: Visual con colores

---

## 🔧 INSTALACIÓN

### 1. Ejecutar Script SQL
```bash
psql -U usuario -d database -f CREAR-SOCIOS.sql
```

### 2. Verificar Tablas
```sql
SELECT * FROM socios;
SELECT * FROM cortesias_socios;
SELECT * FROM vista_stats_socios;
```

### 3. Crear Socios Adicionales
```sql
INSERT INTO socios (nombre, telefono, password, limite_cortesias) 
VALUES ('Nombre Socio', '5551234567', 'password', 1500.00);
```

---

## 📝 NOTAS IMPORTANTES

1. **Reseteo Diario**: Las cortesías usadas se deben resetear diariamente
2. **Límite Fijo**: Cada socio tiene $1500 diarios
3. **Validación**: El sistema valida automáticamente los límites
4. **Historial**: Se mantiene registro completo de todas las cortesías
5. **Tiempo Real**: Las estadísticas se actualizan cada 10 segundos

---

## 🎯 PRÓXIMAS MEJORAS

- [ ] Notificaciones push cuando se acerca al límite
- [ ] Reportes mensuales de uso de cortesías
- [ ] Gráficas de tendencias de ventas
- [ ] Exportación de datos a Excel/PDF
- [ ] Configuración de límites personalizados por socio
- [ ] Sistema de aprobación de cortesías mayores
- [ ] Integración con sistema de puntos/recompensas

---

## 👥 SOCIOS DE PRUEBA

### Socio 1
- **Nombre**: Socio Principal
- **Teléfono**: 5550000001
- **Contraseña**: socio2024
- **Límite**: $1500

### Socio 2
- **Nombre**: Socio Secundario
- **Teléfono**: 5550000002
- **Contraseña**: socio2024
- **Límite**: $1500

---

## 📞 SOPORTE

Para agregar nuevos socios o modificar límites, contactar al administrador del sistema.

**Contraseña Admin**: 4DM1N2025!

---

*Sistema implementado el 30 de octubre de 2025*
*Versión 1.0*
