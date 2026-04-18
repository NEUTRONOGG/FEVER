# 🚀 INSTRUCCIONES DE SETUP - PASO A PASO

## ⚠️ IMPORTANTE: Ejecutar en ORDEN

Los scripts deben ejecutarse **UNO POR UNO** en Supabase SQL Editor.

---

## 📋 PASO 1: CREAR TABLAS

### **Archivo:** `PASO1-crear-tablas.sql`

**¿Qué hace?**
- ✅ Crea tabla `clientes`
- ✅ Crea tabla `mesas`
- ✅ Crea tabla `visitas`
- ✅ Crea tabla `tickets`

**Cómo ejecutar:**
```
1. Abre Supabase SQL Editor
2. Copia TODO el contenido de PASO1-crear-tablas.sql
3. Pega en el editor
4. Click "Run"
5. Espera mensaje: "Tablas creadas correctamente"
```

**Resultado esperado:**
```
✅ mensaje: "Tablas creadas correctamente"
```

---

## 📋 PASO 2: INSERTAR MESAS

### **Archivo:** `PASO2-insertar-mesas.sql`

**¿Qué hace?**
- ✅ Inserta 12 mesas (1-12)
- ✅ Asigna capacidades
- ✅ Estado inicial: disponible

**Cómo ejecutar:**
```
1. Copia TODO el contenido de PASO2-insertar-mesas.sql
2. Pega en el editor
3. Click "Run"
4. Debes ver una tabla con las 12 mesas
```

**Resultado esperado:**
```
numero | capacidad | estado
-------|-----------|------------
1      | 4         | disponible
2      | 4         | disponible
3      | 4         | disponible
...
12     | 10        | disponible
```

---

## 📋 PASO 3: CONFIGURAR SEGURIDAD

### **Archivo:** `PASO3-configurar-seguridad.sql`

**¿Qué hace?**
- ✅ Habilita RLS (Row Level Security)
- ✅ Crea políticas permisivas
- ✅ Permite acceso total a las tablas

**Cómo ejecutar:**
```
1. Copia TODO el contenido de PASO3-configurar-seguridad.sql
2. Pega en el editor
3. Click "Run"
4. Espera mensaje: "Seguridad configurada correctamente"
```

**Resultado esperado:**
```
✅ mensaje: "Seguridad configurada correctamente"
```

---

## 📋 PASO 4: CREAR RESERVA

### **Archivo:** `PASO4-crear-reserva.sql`

**¿Qué hace?**
- ✅ Crea cliente María González
- ✅ Reserva Mesa 5 para 4 personas
- ✅ Hora: Dentro de 2 horas
- ✅ Motivo: Cumpleaños 🎂

**Cómo ejecutar:**
```
1. Copia TODO el contenido de PASO4-crear-reserva.sql
2. Pega en el editor
3. Click "Run"
4. Debes ver la reserva creada
```

**Resultado esperado:**
```
Mesa | Estado    | Cliente         | Personas | Hora  | Notas
-----|-----------|-----------------|----------|-------|------------------
5    | reservada | María González  | 4        | 22:30 | 🎂 Cumpleaños...
```

---

## ✅ VERIFICACIÓN FINAL

### **Después de ejecutar los 4 pasos:**

**1. Verifica las tablas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Debes ver:
- ✅ clientes
- ✅ mesas
- ✅ visitas
- ✅ tickets

**2. Verifica las mesas:**
```sql
SELECT COUNT(*) as total_mesas FROM mesas;
```

Debe mostrar: **12 mesas**

**3. Verifica la reserva:**
```sql
SELECT * FROM mesas WHERE estado = 'reservada';
```

Debe mostrar: **Mesa 5 reservada**

---

## 🎯 AHORA VE AL CRM

```
http://localhost:3001/dashboard
```

**Deberías ver:**
- ✅ Mesa 5 con estado "Reservada" (color naranja)
- ✅ Cliente: María González
- ✅ 4 personas
- ✅ Hora de reserva
- ✅ Nota: 🎂 Cumpleaños

---

## ❌ SI HAY ERRORES

### **Error: "relation already exists"**
```
✅ Normal, significa que la tabla ya existe
✅ Continúa con el siguiente paso
```

### **Error: "relation does not exist"**
```
❌ No ejecutaste el paso anterior
❌ Vuelve al PASO 1
```

### **Error: "policy already exists"**
```
✅ Normal, el script elimina y recrea
✅ Ignora el mensaje
```

---

## 📁 ARCHIVOS CREADOS

```
✅ PASO1-crear-tablas.sql
✅ PASO2-insertar-mesas.sql
✅ PASO3-configurar-seguridad.sql
✅ PASO4-crear-reserva.sql
✅ INSTRUCCIONES-SETUP.md (este archivo)
```

---

## 🔄 ORDEN DE EJECUCIÓN

```
1️⃣ PASO1-crear-tablas.sql
   ↓
2️⃣ PASO2-insertar-mesas.sql
   ↓
3️⃣ PASO3-configurar-seguridad.sql
   ↓
4️⃣ PASO4-crear-reserva.sql
   ↓
✅ Ve al CRM
```

---

## 💡 TIPS

- ✅ Ejecuta **UN** script a la vez
- ✅ Espera que termine cada uno
- ✅ Lee los mensajes de resultado
- ✅ Si hay error, lee el mensaje completo
- ✅ No ejecutes todos juntos

---

**¡Sigue los pasos en orden y todo funcionará!** 🚀✅
