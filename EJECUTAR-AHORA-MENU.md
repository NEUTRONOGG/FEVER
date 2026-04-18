# ⚠️ IMPORTANTE: EJECUTAR SCRIPTS DEL MENÚ

## 🚨 El menú solo tiene 2 productos

Para agregar los **119 productos** completos:

## 📝 PASO 1: Ir a Supabase

1. Abrir: https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **SQL Editor** en el menú lateral

---

## 📋 PASO 2: Ejecutar Script Principal

1. Clic en **New query**
2. Abrir el archivo: `AGREGAR-MENU-COMPLETO.sql`
3. Copiar TODO el contenido
4. Pegar en el editor de Supabase
5. Clic en **Run** (o Ctrl + Enter)

**Resultado esperado**: ✅ 119 productos insertados

---

## ⚙️ PASO 3: Ejecutar Funciones (Opcional pero recomendado)

1. Nueva consulta en SQL Editor
2. Abrir el archivo: `FUNCIONES-MENU.sql`
3. Copiar TODO el contenido
4. Pegar en el editor
5. Clic en **Run**

**Resultado esperado**: ✅ 8 funciones + 2 vistas creadas

---

## ✅ PASO 4: Verificar

Ejecutar esta consulta:

```sql
SELECT COUNT(*) FROM productos;
```

**Debe retornar**: 119

---

## 🔄 PASO 5: Recargar la Página del RP

1. Ir a: http://localhost:3001/dashboard/rp
2. Presionar **Ctrl + R** (o Cmd + R en Mac)
3. Hacer clic en **"Ver Menú"**
4. Ahora deberías ver los **119 productos** organizados en **15 categorías**

---

## 📊 Categorías que verás:

1. 🥃 **Tequila** (25 productos)
2. 🍸 **Vodka** (10 productos)
3. 🌵 **Mezcal** (6 productos)
4. 🍹 **Ginebra** (8 productos)
5. 🥃 **Ron** (11 productos)
6. 🥃 **Whisky** (7 productos)
7. 🍷 **Brandy** (2 productos)
8. 🍾 **Cognac** (2 productos)
9. 🍾 **Champagne** (3 productos)
10. 🥃 **Shots** (4 productos)
11. 🍹 **Coctelería** (10 productos)
12. 🍺 **Cerveza** (5 productos)
13. 🍸 **Mixología** (9 productos)
14. ⚡ **Energizantes** (5 productos)
15. 🥤 **Refrescos** (12 productos)

---

## 🎯 Después de esto:

- ✅ El menú se verá fluido y completo
- ✅ Los RPs podrán registrar pedidos con productos reales
- ✅ Los consumos aparecerán en el historial
- ✅ El dashboard admin mostrará ventas por producto
- ✅ Todo estará conectado al CRM

---

## 💡 Nota

Si ya ejecutaste los scripts y sigues viendo solo 2 productos:

1. Verifica en Supabase que los productos se insertaron:
   ```sql
   SELECT categoria, COUNT(*) 
   FROM productos 
   GROUP BY categoria 
   ORDER BY categoria;
   ```

2. Si no hay productos, ejecuta de nuevo `AGREGAR-MENU-COMPLETO.sql`

3. Si hay productos pero no aparecen en el RP, recarga la página con **Ctrl + Shift + R** (hard reload)

---

**¡Ejecuta los scripts ahora para tener el menú completo!** 🚀
