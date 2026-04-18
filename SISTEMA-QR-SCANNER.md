# 📱 SISTEMA DE LECTURA QR

Sistema completo de escaneo de códigos QR para Hostess y Cadena con entrada manual como fallback.

---

## 📋 CARACTERÍSTICAS IMPLEMENTADAS

### 🎯 **Componente QRScanner Reutilizable**

**Ubicación**: `/components/QRScanner.tsx`

#### Funcionalidades
- **Escaneo por Cámara**: Acceso a cámara trasera del dispositivo
- **Entrada Manual**: Fallback cuando la cámara no está disponible
- **Switch Dinámico**: Cambio entre cámara y entrada manual
- **UI Moderna**: Overlay de escaneo con animación
- **Responsive**: Funciona en móvil, tablet y desktop

#### Características Técnicas
- Acceso a `navigator.mediaDevices.getUserMedia`
- Canvas para procesamiento de imagen
- Detección automática de QR (preparado para jsQR)
- Manejo de errores de permisos
- Limpieza automática de recursos

---

### 👥 **HOSTESS - Escaneo de Clientes**

**Ubicación**: `/app/dashboard/hostess/page.tsx`

#### Funcionalidades
- **Botón "Escanear QR"**: En el header del dashboard
- **Búsqueda Automática**: Por teléfono del cliente
- **Asignación Rápida**: Carga datos del cliente automáticamente
- **Integración Completa**: Con sistema de asignación de mesas

#### Flujo de Trabajo
1. Hostess hace clic en "Escanear QR"
2. Se abre la cámara o entrada manual
3. Escanea QR del cliente (contiene teléfono)
4. Sistema busca cliente en base de datos
5. Carga datos automáticamente en formulario
6. Hostess asigna mesa y confirma

#### Beneficios
- ⚡ Registro más rápido
- ✅ Menos errores de captura
- 📊 Datos precisos del cliente
- 🎯 Experiencia mejorada

---

### 🚪 **CADENA - Control de Acceso**

**Ubicación**: `/app/dashboard/cadena/page.tsx`

#### Funcionalidades
- **Botón "Escanear QR"**: Primer botón en el grid de acciones
- **Registro Automático**: Entrada del cliente
- **Identificación**: Muestra nombre del cliente
- **Contador Automático**: Suma 1 persona al total

#### Flujo de Trabajo
1. Cliente llega a la entrada
2. Cadena escanea QR del cliente
3. Sistema busca cliente por teléfono
4. Registra entrada automáticamente
5. Muestra confirmación con nombre
6. Actualiza contador de personas

#### Beneficios
- 🚀 Acceso más rápido
- 📈 Control preciso de aforo
- 👤 Identificación de clientes
- 📊 Registro automático

---

## 🎨 DISEÑO Y UX

### Componente QRScanner

#### Modo Cámara
- **Fondo**: Negro con 90% opacidad
- **Overlay**: Cuadro azul con esquinas animadas
- **Video**: Aspect ratio cuadrado
- **Botón Cerrar**: Esquina superior derecha
- **Botón Manual**: Parte inferior

#### Modo Manual
- **Input**: Campo de teléfono (10 dígitos)
- **Validación**: Solo números, máximo 10
- **Botón Submit**: Deshabilitado hasta completar
- **Botón Cámara**: Opción para volver

#### Colores
- **Azul**: Elementos principales (#3B82F6)
- **Gris Oscuro**: Fondo del modal (#0F172A)
- **Blanco**: Texto principal
- **Rojo**: Mensajes de error

---

## 🔄 FLUJO TÉCNICO

### Inicialización
```typescript
1. Usuario hace clic en botón QR
2. Se monta componente QRScanner
3. Intenta acceder a la cámara
4. Si falla → Muestra entrada manual
5. Si éxito → Inicia escaneo
```

### Escaneo
```typescript
1. Video stream activo
2. Canvas captura frames cada 100ms
3. Procesa imagen buscando QR
4. Al detectar → Llama onScan(data)
5. Cierra scanner automáticamente
```

### Entrada Manual
```typescript
1. Usuario ingresa teléfono
2. Valida 10 dígitos
3. Hace clic en "Buscar Cliente"
4. Llama onScan(telefono)
5. Cierra scanner
```

---

## 📊 INTEGRACIÓN CON BASE DE DATOS

### Hostess
```typescript
handleQRScan(qrData: string) {
  // qrData = teléfono del cliente
  1. Busca en tabla 'clientes' por teléfono
  2. Si encuentra → Carga datos en formulario
  3. Hostess completa asignación de mesa
  4. Guarda en 'mesas_clientes'
}
```

### Cadena
```typescript
handleQRScan(qrData: string) {
  // qrData = teléfono del cliente
  1. Busca en tabla 'clientes' por teléfono
  2. Si encuentra → Registra entrada
  3. Crea registro en 'registrosFlujo'
  4. Incrementa contador de personas
  5. Muestra confirmación
}
```

---

## 🔐 PERMISOS Y SEGURIDAD

### Permisos de Cámara
- **Solicitud Automática**: Al abrir scanner
- **Manejo de Rechazo**: Muestra entrada manual
- **Limpieza**: Cierra stream al desmontar
- **Privacidad**: Solo procesa en cliente

### Validaciones
- **Teléfono**: 10 dígitos numéricos
- **Cliente Existente**: Verifica en BD
- **Datos Válidos**: No acepta strings vacíos

---

## 📱 RESPONSIVE DESIGN

### Móvil (<768px)
- Scanner ocupa toda la pantalla
- Botones full-width
- Input grande y legible
- Fácil acceso con pulgar

### Tablet (768px - 1024px)
- Modal centrado con max-width
- Botones adaptados
- Video optimizado

### Desktop (>1024px)
- Modal de 500px max-width
- Centrado en pantalla
- Hover effects en botones

---

## 🚀 CARACTERÍSTICAS AVANZADAS

### Auto-detección
- Intenta cámara primero
- Fallback a manual automático
- Sin intervención del usuario

### Limpieza de Recursos
- Cierra stream al desmontar
- Limpia intervalos
- Libera memoria

### Feedback Visual
- Animación de escaneo (pulse)
- Mensajes de error claros
- Confirmaciones visuales

---

## 🔧 INSTALACIÓN Y USO

### Para Agregar a Otra Página

```typescript
// 1. Importar componente
import QRScanner from "@/components/QRScanner"

// 2. Agregar estado
const [mostrarQRScanner, setMostrarQRScanner] = useState(false)

// 3. Crear función handler
const handleQRScan = async (qrData: string) => {
  // Tu lógica aquí
  console.log("QR escaneado:", qrData)
  setMostrarQRScanner(false)
}

// 4. Agregar botón
<Button onClick={() => setMostrarQRScanner(true)}>
  <QrCode className="w-4 h-4 mr-2" />
  Escanear QR
</Button>

// 5. Renderizar scanner
{mostrarQRScanner && (
  <QRScanner
    onScan={handleQRScan}
    onClose={() => setMostrarQRScanner(false)}
  />
)}
```

---

## 📝 FORMATO DEL QR

### Contenido Esperado
```
Teléfono del cliente (10 dígitos)
Ejemplo: 5551234567
```

### Generación del QR
```typescript
// El QR debe contener solo el teléfono
const qrContent = cliente.telefono // "5551234567"
```

---

## 🎯 CASOS DE USO

### Caso 1: Hostess - Cliente Regular
1. Cliente llega con QR en su app
2. Hostess escanea QR
3. Sistema carga: nombre, teléfono, historial
4. Hostess asigna mesa
5. Cliente pasa directo

### Caso 2: Cadena - Acceso Rápido
1. Cliente en fila de entrada
2. Cadena escanea QR
3. Sistema registra entrada
4. Muestra: "✅ Entrada registrada: Juan Pérez"
5. Cliente entra

### Caso 3: Sin Cámara - Entrada Manual
1. Usuario hace clic en QR
2. Cámara no disponible
3. Muestra entrada manual automáticamente
4. Usuario ingresa teléfono
5. Busca y procesa

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Cámara No Funciona
- **Causa**: Permisos denegados
- **Solución**: Usar entrada manual
- **Prevención**: Mensaje claro al usuario

### QR No Se Detecta
- **Causa**: Librería jsQR no cargada
- **Solución**: Usar entrada manual
- **Mejora**: Implementar jsQR completo

### Cliente No Encontrado
- **Causa**: Teléfono no registrado
- **Solución**: Mensaje "Cliente no encontrado"
- **Acción**: Registrar manualmente

---

## 📈 MÉTRICAS Y ANALYTICS

### Datos a Trackear
- Escaneos exitosos vs fallidos
- Uso de cámara vs entrada manual
- Tiempo promedio de escaneo
- Clientes encontrados vs no encontrados

### Implementación Futura
```typescript
// Agregar tracking
const handleQRScan = async (qrData: string) => {
  analytics.track('qr_scan', {
    method: useManual ? 'manual' : 'camera',
    success: clienteEncontrado,
    timestamp: new Date()
  })
}
```

---

## 🔮 MEJORAS FUTURAS

- [ ] Implementar jsQR completa
- [ ] Soporte para múltiples formatos de QR
- [ ] Historial de escaneos
- [ ] Estadísticas de uso
- [ ] Modo offline con cache
- [ ] Generación de QR para clientes
- [ ] Escaneo de múltiples códigos
- [ ] Integración con NFC

---

## 📚 ARCHIVOS MODIFICADOS

### Componente Nuevo
- `/components/QRScanner.tsx` - Componente reutilizable

### Páginas Modificadas
- `/app/dashboard/hostess/page.tsx` - Integración completa
- `/app/dashboard/cadena/page.tsx` - Integración completa

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear componente QRScanner
- [x] Implementar acceso a cámara
- [x] Agregar entrada manual
- [x] Integrar en Hostess
- [x] Integrar en Cadena
- [x] Manejo de errores
- [x] Limpieza de recursos
- [x] Diseño responsive
- [x] Documentación completa

---

*Sistema implementado el 30 de octubre de 2025*
*Versión 1.0*
