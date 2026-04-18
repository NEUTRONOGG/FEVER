# 🚀 GUÍA PASO A PASO - LIMPIAR Y CONFIGURAR DATOS REALES

## ✅ PASO 1: LIMPIAR DATOS MOCK

### 1.1 Abrir Supabase
1. Ve a tu proyecto en Supabase
2. Clic en **SQL Editor** (en el menú lateral izquierdo)
3. Clic en **New query**

### 1.2 Ejecutar Script de Limpieza
1. Abre el archivo: `ELIMINAR-TODO-DATOS-MOCK.sql`
2. Copia TODO el contenido (Cmd+A, Cmd+C)
3. Pégalo en el SQL Editor de Supabase (Cmd+V)
4. Clic en **RUN** (botón verde) o presiona Cmd+Enter
5. Espera a que termine (verás mensajes de progreso)
6. Al final verás un resumen como este:

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

---

## ✅ PASO 2: PREPARAR TUS DATOS REALES

### 2.1 Editar el archivo de datos iniciales
1. Abre: `AGREGAR-DATOS-INICIALES-REALES.sql`
2. **IMPORTANTE:** Reemplaza los datos de ejemplo con TUS datos reales:

#### A) PRODUCTOS DE TU MENÚ:
```sql
-- Líneas 13-30 aproximadamente
-- Reemplaza con tus productos reales:

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES

-- Ejemplo de cómo editarlo:
('Don Julio 70', 'Tequila', 450.00, 10, 3, 'botella', 300.00, 'Licores Premium'),
-- ↑ Cambia esto por tus productos reales
```

**Categorías sugeridas:**
- Tequila
- Vodka
- Whisky
- Ron
- Ginebra
- Vinos
- Champagne
- Shots
- Coctelería
- Cerveza
- Bebidas (sin alcohol)
- Energizantes
- Comida

#### B) TUS RPs REALES:
```sql
-- Líneas 37-47 aproximadamente
-- Reemplaza con los nombres de tus RPs:

INSERT INTO limites_cortesias_rp (
    rp_nombre,
    shots_disponibles,
    perlas_negras_disponibles,
    descuento_botella_disponible,
    shots_bienvenida_disponibles,
    activo
) VALUES
    ('Nombre Real RP 1', 10, 3, 2, 5, true),
    ('Nombre Real RP 2', 10, 3, 2, 5, true),
    ('Nombre Real RP 3', 10, 3, 2, 5, true)
```

#### C) TUS SOCIOS REALES:
```sql
-- Líneas 54-60 aproximadamente
-- Reemplaza con los datos de tus socios:

INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
    ('Nombre Socio 1', '5551234567', 'socio2024', 1500),
    ('Nombre Socio 2', '5559876543', 'socio2024', 1500)
```

**NOTA:** La contraseña por defecto es `socio2024`. Pídeles que la cambien después del primer login.

#### D) MESEROS Y HOSTESS (OPCIONAL):
Si tienes estas tablas, descomenta las líneas correspondientes y agrega los nombres reales.

### 2.2 Guardar el archivo
- Guarda los cambios (Cmd+S)

---

## ✅ PASO 3: AGREGAR DATOS REALES

### 3.1 Ejecutar Script de Datos Iniciales
1. En Supabase SQL Editor, clic en **New query**
2. Abre el archivo editado: `AGREGAR-DATOS-INICIALES-REALES.sql`
3. Copia TODO el contenido (Cmd+A, Cmd+C)
4. Pégalo en el SQL Editor de Supabase (Cmd+V)
5. Clic en **RUN** o presiona Cmd+Enter
6. Verás un resumen como:

```
✅ DATOS INICIALES AGREGADOS

📦 Productos: 15 total
   Categorías: Tequila, Vodka, Bebidas, Comida

👑 RPs: 3 total
   Nombres: Carlos Mendoza, Ana García, Luis Rodríguez

💎 Socios: 3 total
   Nombres: Roberto Martínez, Patricia López, Fernando Sánchez

🚀 Sistema listo para operar con datos reales!
```

---

## ✅ PASO 4: VERIFICAR QUE TODO FUNCIONE

### 4.1 Verificar Productos en POS
1. Ve a tu aplicación: `localhost:3000/dashboard/mesero`
2. Deberías ver tus productos reales en el menú
3. Si no los ves, recarga la página (Cmd+R)

### 4.2 Verificar RPs
1. Ve a: `localhost:3000/dashboard/hostess`
2. Al asignar una mesa, deberías ver tus RPs en el selector
3. Ve a: `localhost:3000/dashboard/rp`
4. Deberías poder hacer login con los nombres de tus RPs

### 4.3 Verificar Socios
1. Ve a: `localhost:3000/socios`
2. Intenta hacer login con:
   - Teléfono: (el que pusiste)
   - Contraseña: `socio2024`
3. Deberías entrar al dashboard de socios

### 4.4 Verificar Mesas
1. Ve a: `localhost:3000/dashboard/hostess`
2. Deberías ver el plano con todas las mesas en VERDE (disponibles)
3. No debería haber mesas ocupadas ni reservadas

---

## ✅ PASO 5: HACER PRUEBA COMPLETA

### 5.1 Crear Cliente y Asignar Mesa
1. Dashboard Hostess → Clic en mesa verde (ej: Mesa 7)
2. Crear nuevo cliente:
   - Nombre: "Cliente Prueba"
   - Teléfono: "5551111111"
   - Género: Hombre
   - Personas: 2
3. Seleccionar un RP de la lista
4. Clic en "Asignar Mesa"
5. **Verificar:** Mesa 7 ahora debe estar en ROJO (ocupada)

### 5.2 Crear Pedido
1. Ve a: `localhost:3000/dashboard/mesero` o `/dashboard/rp`
2. Deberías ver Mesa 7 ocupada con "Cliente Prueba"
3. Clic en Mesa 7
4. Agregar productos de tu menú real
5. Clic en "Guardar Pedido"
6. **Verificar:** El total debe aparecer en la mesa

### 5.3 Ver Consumo en Tiempo Real
1. Ve a: `localhost:3000/dashboard/mesas-clientes`
2. Deberías ver Mesa 7 con el badge de consumo
3. El color debe cambiar según el monto:
   - Verde: < $500
   - Ámbar: $500-$1000
   - Rojo: > $1000

### 5.4 Ver Historial
1. Ve a: `localhost:3000/dashboard/historial-consumos`
2. Deberías ver el ticket que acabas de crear
3. Con todos los productos y el total

### 5.5 Liberar Mesa
1. Regresa a: `localhost:3000/dashboard/hostess`
2. Busca Mesa 7 en "Mesas Ocupadas"
3. Clic en "Liberar Mesa"
4. **Verificar:** 
   - Mesa 7 vuelve a VERDE (disponible)
   - El cliente queda registrado en el historial

### 5.6 Ver Estadísticas del Cliente
1. Ve a: `localhost:3000/dashboard/clientes`
2. Busca "Cliente Prueba"
3. Deberías ver:
   - Total visitas: 1
   - Consumo total: (el monto del pedido)
   - Ticket promedio: (el monto del pedido)
   - Última visita: (fecha y hora de hoy)

---

## ✅ PASO 6: ELIMINAR CLIENTE DE PRUEBA (OPCIONAL)

Si quieres eliminar el cliente de prueba que acabas de crear:

```sql
-- En Supabase SQL Editor:
DELETE FROM clientes WHERE telefono = '5551111111';
DELETE FROM tickets WHERE cliente_telefono = '5551111111';
DELETE FROM visitas WHERE cliente_id IN (
  SELECT id FROM clientes WHERE telefono = '5551111111'
);
```

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Si todo funcionó correctamente:

✅ Sistema limpio de datos mock
✅ Productos reales cargados
✅ RPs reales configurados
✅ Socios reales con acceso
✅ Flujo completo probado
✅ Historial funcionando
✅ Estadísticas actualizándose

**¡Tu sistema está 100% listo para operar con datos reales!** 🚀

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: No veo los productos
**Solución:** 
1. Verifica en Supabase que se insertaron: `SELECT * FROM productos;`
2. Recarga la página del dashboard
3. Verifica permisos de la tabla productos en Supabase

### Problema: No aparecen los RPs
**Solución:**
1. Verifica en Supabase: `SELECT * FROM limites_cortesias_rp;`
2. Asegúrate que `activo = true`
3. Recarga la página

### Problema: No puedo hacer login como Socio
**Solución:**
1. Verifica en Supabase: `SELECT * FROM socios;`
2. Confirma que el teléfono esté correcto (10 dígitos)
3. Usa la contraseña: `socio2024`

### Problema: Las mesas no cambian de color
**Solución:**
1. Recarga la página (Cmd+R)
2. Verifica en Supabase: `SELECT * FROM mesas WHERE estado = 'ocupada';`
3. Limpia el caché del navegador

---

## 📞 SIGUIENTE PASO

Una vez que todo funcione, puedes:
1. Agregar más productos según tu menú completo
2. Configurar más RPs
3. Agregar más socios
4. Capacitar a tu equipo
5. ¡Empezar a operar!

**¿Necesitas ayuda con algo específico?** 🤝
