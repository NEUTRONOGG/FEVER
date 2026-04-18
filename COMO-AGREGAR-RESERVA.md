# 📅 CÓMO AGREGAR UNA RESERVA DE EJEMPLO

## 🎯 OPCIÓN 1: DESDE SUPABASE (MÁS RÁPIDO)

### **Paso 1: Ir a Supabase**
```
1. Abre: https://supabase.com
2. Entra a tu proyecto
3. Ve a: SQL Editor (icono de base de datos)
```

### **Paso 2: Ejecutar este SQL**
```sql
-- Crear cliente
INSERT INTO clientes (
  nombre, telefono, email, genero, nivel_fidelidad, puntos_rewards, activo
) VALUES (
  'María González', '+52 555 987 6543', 'maria.gonzalez@email.com', 
  'femenino', 'oro', 450, true
) ON CONFLICT (telefono) DO NOTHING;

-- Crear reserva en Mesa 5
UPDATE mesas 
SET 
  estado = 'reservada',
  cliente_id = (SELECT id FROM clientes WHERE telefono = '+52 555 987 6543'),
  cliente_nombre = 'María González',
  numero_personas = 4,
  hostess = 'Sistema',
  hora_entrada = NOW() + INTERVAL '2 hours',
  notas = '🎂 Cumpleaños - Mesa preferencial'
WHERE numero = '5';
```

### **Paso 3: Verificar**
```sql
SELECT numero, estado, cliente_nombre, numero_personas, hora_entrada, notas
FROM mesas WHERE numero = '5';
```

---

## 🎯 OPCIÓN 2: DESDE EL CRM (INTERFAZ)

### **Si tienes panel de Hostess:**
```
1. Ve a: /dashboard/hostess
2. Busca la sección "Reservas" (si existe)
3. Click "Nueva Reserva"
4. Llena los datos:
   - Cliente: María González
   - Mesa: 5
   - Personas: 4
   - Hora: Dentro de 2 horas
   - Notas: Cumpleaños
```

---

## 📊 CÓMO SE VERÁ EN EL CRM

### **Dashboard Principal:**
```
┌─────────────────────────────────────┐
│  Mesa 5 - RESERVADA                 │
│  👤 María González                  │
│  👥 4 personas                      │
│  🕐 20:00 hrs                       │
│  📝 🎂 Cumpleaños                   │
└─────────────────────────────────────┘
```

### **Panel de Mesas:**
```
Mesa 5
├─ Estado: RESERVADA (color naranja)
├─ Cliente: María González
├─ Personas: 4
├─ Hora: 20:00
└─ Notas: 🎂 Cumpleaños - Mesa preferencial
```

---

## 🔄 PARA CREAR MÁS RESERVAS

### **Reserva para Mesa 8:**
```sql
-- Cliente 2
INSERT INTO clientes (nombre, telefono, email, genero, nivel_fidelidad, activo)
VALUES ('Roberto Sánchez', '+52 555 111 2222', 'roberto@email.com', 'masculino', 'platino', true)
ON CONFLICT (telefono) DO NOTHING;

-- Reserva Mesa 8
UPDATE mesas 
SET 
  estado = 'reservada',
  cliente_id = (SELECT id FROM clientes WHERE telefono = '+52 555 111 2222'),
  cliente_nombre = 'Roberto Sánchez',
  numero_personas = 2,
  hostess = 'Sistema',
  hora_entrada = NOW() + INTERVAL '3 hours',
  notas = '💼 Cena de negocios'
WHERE numero = '8';
```

### **Reserva para Mesa 10:**
```sql
-- Cliente 3
INSERT INTO clientes (nombre, telefono, email, genero, nivel_fidelidad, activo)
VALUES ('Laura Martínez', '+52 555 333 4444', 'laura@email.com', 'femenino', 'diamante', true)
ON CONFLICT (telefono) DO NOTHING;

-- Reserva Mesa 10
UPDATE mesas 
SET 
  estado = 'reservada',
  cliente_id = (SELECT id FROM clientes WHERE telefono = '+52 555 333 4444'),
  cliente_nombre = 'Laura Martínez',
  numero_personas = 6,
  hostess = 'Sistema',
  hora_entrada = NOW() + INTERVAL '4 hours',
  notas = '🎉 Aniversario - Mesa VIP'
WHERE numero = '10';
```

---

## 🗑️ PARA LIBERAR UNA RESERVA

```sql
-- Liberar Mesa 5
UPDATE mesas 
SET 
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = NULL,
  hora_entrada = NULL,
  notas = NULL
WHERE numero = '5';
```

---

## 🎨 COLORES DE ESTADOS EN EL CRM

```
🟢 Disponible - Verde
🔴 Ocupada - Rojo
🟠 Reservada - Naranja
🟡 Limpieza - Amarillo
```

---

## ✅ VERIFICAR QUE FUNCIONA

### **1. Ejecuta el SQL en Supabase**
### **2. Espera 5 segundos**
### **3. Ve al CRM Dashboard**
### **4. Debes ver:**
```
✅ Mesa 5 con estado "Reservada"
✅ Nombre: María González
✅ 4 personas
✅ Hora de reserva
✅ Nota: 🎂 Cumpleaños
```

---

## 📝 DATOS DE LA RESERVA DE EJEMPLO

```
Cliente: María González
Teléfono: +52 555 987 6543
Email: maria.gonzalez@email.com
Nivel: Oro
Puntos: 450

Reserva:
├─ Mesa: 5
├─ Personas: 4
├─ Hora: Dentro de 2 horas
└─ Motivo: Cumpleaños
```

---

## 🚀 ARCHIVOS CREADOS

```
✅ RESERVA-RAPIDA.sql
   → Script SQL listo para ejecutar

✅ AGREGAR-reserva-ejemplo.sql
   → Script completo con verificaciones

✅ COMO-AGREGAR-RESERVA.md
   → Este documento con instrucciones
```

---

**¡Ejecuta el SQL y verás la reserva en el CRM!** 📅✅
