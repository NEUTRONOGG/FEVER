# 🚀 PASOS COMPLETOS: LIMPIAR DATOS MOCK Y CARGAR DATOS REALES

## 📌 RESUMEN RÁPIDO

1. ✅ Limpiar todos los datos mock
2. ✅ Editar archivo con TUS datos reales
3. ✅ Cargar datos reales
4. ✅ Verificar que todo funcione
5. ✅ ¡Listo para operar!

---

## 🗑️ PASO 1: LIMPIAR DATOS MOCK

### 1.1 Abrir Supabase
1. Ve a: https://supabase.com
2. Selecciona tu proyecto
3. En el menú lateral izquierdo, clic en **SQL Editor**
4. Clic en **New query**

### 1.2 Ejecutar Script de Limpieza
1. Abre el archivo: **`ELIMINAR-TODO-DATOS-MOCK.sql`**
2. Selecciona TODO el contenido (Cmd+A o Ctrl+A)
3. Copia (Cmd+C o Ctrl+C)
4. Pega en el SQL Editor de Supabase (Cmd+V o Ctrl+V)
5. Clic en el botón **RUN** (verde) o presiona Cmd+Enter
6. Espera a que termine (verás mensajes de progreso)

### 1.3 Verificar Limpieza
Al final deberías ver algo como:

```
═══════════════════════════════════════
           RESUMEN FINAL
═══════════════════════════════════════
👥 Clientes:           0
📦 Productos:          0
🎫 Tickets:            0
👑 RPs:                0
💎 Socios:             0
🍽️  Meseros:            0
🎀 Hostess:            0
🪑 Mesas disponibles:  37 de 37
═══════════════════════════════════════
✅ PERFECTO: Sistema 100% limpio
🚀 Listo para agregar datos reales de producción
```

✅ **Si ves esto, la limpieza fue exitosa!**

---

## ✏️ PASO 2: EDITAR ARCHIVO CON TUS DATOS REALES

### 2.1 Abrir el Archivo
1. Abre: **`AGREGAR-DATOS-INICIALES-REALES.sql`**

### 2.2 Editar PRODUCTOS (Líneas 13-33)

**ANTES (Ejemplo):**
```sql
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES

-- BEBIDAS ALCOHÓLICAS (Ejemplos - ajusta a tu menú real)
('Don Julio 70', 'Tequila', 450.00, 10, 3, 'botella', 300.00, 'Licores Premium'),
('Clase Azul Reposado', 'Tequila', 850.00, 5, 2, 'botella', 600.00, 'Licores Premium'),
```

**DESPUÉS (Con tus productos reales):**
```sql
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES

-- TUS PRODUCTOS REALES
('Don Julio 70', 'Tequila', 450.00, 10, 3, 'botella', 300.00, 'Licores Premium'),
('Herradura Reposado', 'Tequila', 380.00, 15, 5, 'botella', 250.00, 'Licores Premium'),
('Grey Goose', 'Vodka', 420.00, 8, 3, 'botella', 280.00, 'Licores Premium'),
('Buchanan\'s 12', 'Whisky', 550.00, 6, 2, 'botella', 380.00, 'Licores Premium'),
('Corona', 'Cerveza', 50.00, 100, 30, 'unidad', 25.00, 'Distribuidora'),
('Agua Mineral', 'Bebidas', 35.00, 100, 30, 'unidad', 15.00, 'Distribuidora'),
-- Agrega TODOS tus productos aquí
```

**IMPORTANTE:**
- Cada línea termina con coma `,` excepto la última
- Usa comillas simples `'` para textos
- Si un nombre tiene apóstrofe, escápalo: `Buchanan\'s`
- Ajusta precios, stock y proveedores a tu realidad

### 2.3 Editar RPs (Líneas 45-56)

**ANTES (Ejemplo):**
```sql
INSERT INTO limites_cortesias_rp (
    rp_nombre,
    shots_disponibles,
    perlas_negras_disponibles,
    descuento_botella_disponible,
    shots_bienvenida_disponibles,
    activo
) VALUES
    ('Carlos Mendoza', 0, 0, 0, 5, true),
    ('Ana García', 0, 0, 0, 5, true),
    ('Luis Rodríguez', 0, 0, 0, 5, true)
```

**DESPUÉS (Con tus RPs reales):**
```sql
INSERT INTO limites_cortesias_rp (
    rp_nombre,
    shots_disponibles,
    perlas_negras_disponibles,
    descuento_botella_disponible,
    shots_bienvenida_disponibles,
    activo
) VALUES
    ('Nombre RP 1', 0, 0, 0, 5, true),
    ('Nombre RP 2', 0, 0, 0, 5, true),
    ('Nombre RP 3', 0, 0, 0, 5, true),
    ('Nombre RP 4', 0, 0, 0, 5, true)
    -- Agrega todos tus RPs aquí
```

**IMPORTANTE:**
- Reemplaza con los nombres REALES de tus RPs
- Cada RP tiene 5 covers (shots_bienvenida_disponibles)
- 0 perlas, 0 shots, 0 botellas (como lo pediste)

### 2.4 Editar SOCIOS (Líneas 64-68)

**ANTES (Ejemplo):**
```sql
INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
    ('Roberto Martínez', '5551234567', 'socio2024', 1500),
    ('Patricia López', '5559876543', 'socio2024', 1500),
    ('Fernando Sánchez', '5555555555', 'socio2024', 1500)
```

**DESPUÉS (Con tus socios reales):**
```sql
INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
    ('Nombre Socio 1', '5551111111', 'socio2024', 1500),
    ('Nombre Socio 2', '5552222222', 'socio2024', 1500),
    ('Nombre Socio 3', '5553333333', 'socio2024', 1500)
    -- Agrega todos tus socios aquí
```

**IMPORTANTE:**
- Teléfono: 10 dígitos sin espacios ni guiones
- Password: `socio2024` (pídeles que la cambien después)
- Límite: $1500 diarios en cortesías

### 2.5 Guardar el Archivo
- Guarda los cambios (Cmd+S o Ctrl+S)

---

## 📤 PASO 3: CARGAR DATOS REALES

### 3.1 Ejecutar Script de Datos
1. En Supabase SQL Editor, clic en **New query**
2. Abre el archivo editado: **`AGREGAR-DATOS-INICIALES-REALES.sql`**
3. Selecciona TODO el contenido (Cmd+A)
4. Copia (Cmd+C)
5. Pega en el SQL Editor de Supabase (Cmd+V)
6. Clic en **RUN** o presiona Cmd+Enter
7. Espera a que termine

### 3.2 Verificar Carga
Deberías ver algo como:

```
✅ DATOS INICIALES AGREGADOS

📦 Productos: 15 total
   Categorías: Tequila, Vodka, Whisky, Cerveza, Bebidas

👑 RPs: 4 total
   Nombres: Nombre RP 1, Nombre RP 2, Nombre RP 3, Nombre RP 4

💎 Socios: 3 total
   Nombres: Nombre Socio 1, Nombre Socio 2, Nombre Socio 3

🚀 Sistema listo para operar con datos reales!
```

✅ **Si ves esto, la carga fue exitosa!**

---

## ✅ PASO 4: VERIFICAR QUE TODO FUNCIONE

### 4.1 Verificar Productos
1. Abre tu app: `localhost:3000/dashboard/mesero`
2. Deberías ver tus productos reales
3. Si no aparecen, recarga la página (Cmd+R o F5)

### 4.2 Verificar RPs
1. Ve a: `localhost:3000/dashboard/hostess`
2. Intenta asignar una mesa
3. En el selector de RP deberías ver tus RPs reales

### 4.3 Verificar Socios
1. Ve a: `localhost:3000/socios`
2. Intenta hacer login con:
   - **Teléfono:** (el que pusiste)
   - **Password:** `socio2024`
3. Deberías entrar al dashboard de socios

### 4.4 Verificar Mesas
1. Ve a: `localhost:3000/dashboard/hostess`
2. Deberías ver el plano del restaurante
3. Todas las mesas en **VERDE** (disponibles)
4. Ninguna mesa ocupada ni reservada

---

## 🧪 PASO 5: HACER PRUEBA COMPLETA

### 5.1 Crear Cliente y Asignar Mesa
1. Dashboard Hostess → Clic en una mesa verde (ej: Mesa 7)
2. Crear nuevo cliente:
   - **Nombre:** Cliente Prueba
   - **Teléfono:** 5559999999
   - **Género:** Hombre
   - **Personas:** 2
3. Seleccionar un RP de tu lista
4. Clic en **"Asignar Mesa"**
5. ✅ **Verificar:** Mesa 7 ahora debe estar en **ROJO** (ocupada)

### 5.2 Crear Pedido
1. Ve a: `localhost:3000/dashboard/mesero`
2. Deberías ver Mesa 7 ocupada con "Cliente Prueba"
3. Clic en Mesa 7
4. Agregar productos de tu menú real
5. Clic en **"Guardar Pedido"**
6. ✅ **Verificar:** El total debe aparecer en la mesa

### 5.3 Ver Consumo en Tiempo Real
1. Ve a: `localhost:3000/dashboard/mesas-clientes`
2. Deberías ver Mesa 7 con badge de consumo
3. Color según monto:
   - Verde: < $500
   - Ámbar: $500-$1000
   - Rojo: > $1000

### 5.4 Ver Historial
1. Ve a: `localhost:3000/dashboard/historial-consumos`
2. Deberías ver el ticket que acabas de crear
3. Con productos y total

### 5.5 Liberar Mesa
1. Regresa a: `localhost:3000/dashboard/hostess`
2. Busca Mesa 7 en "Mesas Ocupadas"
3. Clic en **"Liberar Mesa"**
4. ✅ **Verificar:**
   - Mesa 7 vuelve a **VERDE** (disponible)
   - Cliente queda en historial

### 5.6 Ver Estadísticas del Cliente
1. Ve a: `localhost:3000/dashboard/clientes`
2. Busca "Cliente Prueba"
3. Deberías ver:
   - Total visitas: 1
   - Consumo total: (monto del pedido)
   - Ticket promedio: (monto del pedido)
   - Última visita: (hoy)

---

## 🗑️ PASO 6: ELIMINAR CLIENTE DE PRUEBA (OPCIONAL)

Si quieres eliminar el cliente de prueba:

1. Abre Supabase SQL Editor
2. Ejecuta:

```sql
DELETE FROM clientes WHERE telefono = '5559999999';
DELETE FROM tickets WHERE cliente_telefono = '5559999999';
DELETE FROM visitas WHERE cliente_id IN (
  SELECT id FROM clientes WHERE telefono = '5559999999'
);
```

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Si todo funcionó:

✅ Sistema limpio de datos mock  
✅ Productos reales cargados  
✅ RPs reales configurados  
✅ Socios reales con acceso  
✅ Flujo completo probado  
✅ Historial funcionando  
✅ Estadísticas actualizándose  

**¡Tu sistema está 100% listo para operar!** 🚀

---

## 📋 CHECKLIST FINAL

- [ ] Ejecuté `ELIMINAR-TODO-DATOS-MOCK.sql`
- [ ] Edité `AGREGAR-DATOS-INICIALES-REALES.sql` con mis datos
- [ ] Ejecuté `AGREGAR-DATOS-INICIALES-REALES.sql`
- [ ] Verifiqué que productos aparezcan en POS
- [ ] Verifiqué que RPs aparezcan en selects
- [ ] Verifiqué que Socios puedan hacer login
- [ ] Hice prueba completa (asignar, pedido, liberar)
- [ ] Verifiqué historial y estadísticas
- [ ] Eliminé cliente de prueba
- [ ] ✅ **Sistema listo para operar!**

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ Error al ejecutar script de limpieza
**Solución:** Algunas tablas no existen. Esto es normal, el script las omite automáticamente.

### ❌ No veo los productos
**Solución:** 
1. Verifica en Supabase: `SELECT * FROM productos;`
2. Recarga la página del dashboard
3. Limpia caché del navegador

### ❌ No aparecen los RPs
**Solución:**
1. Verifica en Supabase: `SELECT * FROM limites_cortesias_rp;`
2. Asegúrate que `activo = true`
3. Recarga la página

### ❌ No puedo hacer login como Socio
**Solución:**
1. Verifica en Supabase: `SELECT * FROM socios;`
2. Confirma teléfono (10 dígitos, sin espacios)
3. Usa password: `socio2024`

### ❌ Las mesas no cambian de color
**Solución:**
1. Recarga la página (Cmd+R o F5)
2. Verifica en Supabase: `SELECT * FROM mesas;`
3. Limpia caché del navegador

---

## 📞 ARCHIVOS DE REFERENCIA

- **`ELIMINAR-TODO-DATOS-MOCK.sql`** - Limpia todos los datos mock
- **`AGREGAR-DATOS-INICIALES-REALES.sql`** - Carga datos reales
- **`CONFIGURACION-CORTESIAS.md`** - Info sobre cortesías
- **`ADMIN-REPONER-CORTESIAS.sql`** - Para reponer cortesías
- **`COMO-FUNCIONA-SISTEMA-REAL.md`** - Explicación del sistema

---

**¿Necesitas ayuda con algún paso?** ¡Pregunta! 🤝
