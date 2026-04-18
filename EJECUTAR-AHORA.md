# 🚀 EJECUTAR AHORA - TODO LISTO

## ✅ YA ESTÁ TODO ACTUALIZADO

No necesitas editar NADA. Solo ejecuta los scripts en orden.

---

## 📋 PASO 1: AGREGAR DATOS REALES

### Qué hace:
- Agrega 13 RPs reales con sus contraseñas
- Agrega productos de ejemplo (puedes agregar más después)
- Agrega 3 socios de ejemplo

### Cómo:
1. Abre Supabase SQL Editor
2. Copia y pega: **`AGREGAR-DATOS-INICIALES-REALES.sql`**
3. Clic en **RUN**
4. Espera confirmación

### Resultado:
```
✅ DATOS INICIALES AGREGADOS
📦 Productos: 11 total
👑 RPs: 13 total
💎 Socios: 3 total
```

---

## 📋 PASO 2: VERIFICAR QUE FUNCIONE

1. **Productos:**
   - Ve a: `localhost:3000/dashboard/mesero`
   - Deberías ver los productos

2. **RPs:**
   - Ve a: `localhost:3000/dashboard/hostess`
   - Al asignar mesa, deberías ver los 13 RPs

3. **Login RP:**
   - Ve a: `localhost:3000/dashboard/rp-login`
   - Prueba con:
     - **Usuario:** Elsa Vela
     - **Password:** elsa2025

4. **Socios:**
   - Ve a: `localhost:3000/socios`
   - Prueba con:
     - **Teléfono:** 5551234567
     - **Password:** socio2024

---

## 📋 PASO 3: BORRAR DATOS MOCK

### Qué hace:
- Borra productos mock del schema original
- Borra RPs de ejemplo (Carlos, Ana, Luis)
- Borra socios de ejemplo
- Borra clientes de prueba
- Resetea todas las mesas

### Cómo:
1. Abre Supabase SQL Editor
2. Copia y pega: **`PASO-4-BORRAR-MOCK.sql`**
3. Clic en **RUN**
4. Espera confirmación

### Resultado:
```
✅ Productos mock eliminados
✅ RPs mock eliminados
✅ Socios mock eliminados
✅ Clientes de prueba eliminados
✅ Transacciones antiguas eliminadas
✅ Mesas reseteadas
```

---

## 📋 PASO 4: VERIFICAR FINAL

1. Recarga tu app (Cmd+R o F5)
2. Verifica que solo veas:
   - ✅ Los 13 RPs reales
   - ✅ Los productos que agregaste
   - ✅ Todas las mesas en verde
   - ✅ Sin datos mock

---

## 🎯 DATOS CARGADOS

### **13 RPs con Credenciales:**

| # | Nombre | Password |
|---|--------|----------|
| 1 | Elsa Vela | elsa2025 |
| 2 | Leah Vazquez | leah2025 |
| 3 | Emiliano Fox | emiliano2025 |
| 4 | Oscar Navarro | oscar2025 |
| 5 | Patricio García | patricio2025 |
| 6 | Silvana Noriega | silvana2025 |
| 7 | Fernanda Lira | fernanda2025 |
| 8 | Daniela Navarro | daniela2025 |
| 9 | Ximena Muñoz | ximena2025 |
| 10 | Milton Guerrero | milton2025 |
| 11 | Alejandra Urteaga | alejandra2025 |
| 12 | Regina Rodríguez | regina2025 |
| 13 | Diego Oliveros | diego2025 |

**Límites por RP:**
- 5 Covers
- 0 Perlas Negras
- 0 Shots
- 0 Botellas Sembradas

### **3 Socios de Ejemplo:**

| Nombre | Teléfono | Password | Límite |
|--------|----------|----------|--------|
| Roberto Martínez | 5551234567 | socio2024 | $1500 |
| Patricia López | 5559876543 | socio2024 | $1500 |
| Fernando Sánchez | 5555555555 | socio2024 | $1500 |

**Nota:** Estos socios se borrarán en el PASO 3. Si quieres conservarlos, edita el archivo `PASO-4-BORRAR-MOCK.sql` y quita sus teléfonos de la lista.

### **11 Productos de Ejemplo:**

- Don Julio 70 (Tequila) - $450
- Clase Azul Reposado (Tequila) - $850
- Grey Goose (Vodka) - $380
- Hennessy VS (Cognac) - $420
- Shot Tequila (Shots) - $80
- Copa Vino Tinto (Vinos) - $120
- Agua Mineral (Bebidas) - $35
- Refresco (Bebidas) - $40
- Red Bull (Energizantes) - $60
- Tabla de Quesos (Comida) - $180
- Alitas BBQ (Comida) - $150

**Nota:** Puedes agregar más productos después ejecutando nuevos INSERT.

---

## 🎉 ¡LISTO!

Después de estos 3 pasos:

✅ Sistema con 13 RPs reales  
✅ Productos cargados  
✅ Sin datos mock  
✅ Todas las mesas disponibles  
✅ Listo para operar  

---

## 📞 AGREGAR MÁS DATOS

### Agregar más productos:
```sql
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
('Nuevo Producto', 'Categoria', 100.00, 10, 3, 'unidad', 50.00, 'Proveedor')
ON CONFLICT DO NOTHING;
```

### Agregar más RPs:
```sql
INSERT INTO limites_cortesias_rp (
    rp_nombre, shots_disponibles, perlas_negras_disponibles,
    descuento_botella_disponible, shots_bienvenida_disponibles,
    activo, password
) VALUES
    ('Nuevo RP', 0, 0, 0, 5, true, 'password2025')
ON CONFLICT (rp_nombre) DO NOTHING;
```

### Agregar más Socios:
```sql
INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
    ('Nuevo Socio', '5559999999', 'socio2024', 1500)
ON CONFLICT (telefono) DO NOTHING;
```

---

**¿Listo para empezar? ¡Ejecuta PASO 1!** 🚀
