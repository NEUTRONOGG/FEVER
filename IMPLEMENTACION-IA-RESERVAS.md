# 🤖 Implementación: Procesar Reservaciones con IA (Claude)

## Resumen
Se implementó un sistema para que Ashton pueda subir archivos (Excel, PDF, Word, imágenes) y la IA de Claude (modelo Haiku 3.5) extraiga automáticamente las reservaciones de los RPs.

## Archivos Creados/Modificados

### 1. API Route: `/app/api/procesar-reservas/route.ts`
- Endpoint que recibe archivos y los procesa con Claude API
- Soporta: Excel (.xlsx, .xls), PDF, Word (.doc, .docx), TXT, imágenes
- Usa modelo `claude-3-5-haiku-20241022` (Haiku 3.5 - más barato y rápido)

### 2. Panel Ashton: `/app/dashboard/rps/ashton/page.tsx`
- Panel dedicado para gestión de RPs con botón "🤖 Procesar con IA (Claude)"
- Dialog completo con:
  - Selector de fecha del evento
  - Selector de RP (opcional)
  - Subida de archivo
  - Vista previa de resultados organizados por RP
  - Lista editable de reservaciones detectadas
  - Botón para guardar en Supabase

### 3. Variables de Entorno: `.env.local.example`
```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-tu_api_key_aqui
```

## Cómo Usar

### Paso 1: Configurar API Key
1. Ve a https://console.anthropic.com/
2. Crea una cuenta y obtén tu API key
3. Copia `.env.local.example` a `.env.local`
4. Agrega tu `ANTHROPIC_API_KEY`

### Paso 2: Acceder al Panel
1. Inicia sesión como Ashton en `/dashboard/rps/ashton`
2. Haz clic en **"🤖 Procesar con IA (Claude)"**

### Paso 3: Procesar Archivo
1. Selecciona la **fecha del evento**
2. (Opcional) Selecciona un RP específico, o deja que la IA detecte automáticamente
3. **Sube tu archivo**:
   - Excel con lista de reservas
   - PDF de reservaciones
   - Word con lista
   - Captura de pantalla de lista de reservas
4. Haz clic en **"Procesar con IA"**
5. Revisa los resultados:
   - Resumen por RP (cuántas reservas cada uno)
   - Lista detallada de cada reservación
   - Puedes eliminar reservaciones individuales si hay errores
6. Haz clic en **"Guardar en Supabase"**

## Qué Detecta la IA

El modelo Claude Haiku 3.5 extrae automáticamente:
- **Nombre del cliente**
- **Teléfono** (si está presente)
- **Hora** (normalizada a formato 24h)
- **Número de personas** (por defecto 2 si no especifica)
- **Nombre del RP** (si está indicado en el documento)
- **Notas adicionales**

## Formatos Soportados de Ejemplo

### Excel/CSV
```
Nombre,Hora,Personas,RP
Juan García,21:00,4,Arlin
María López,22:00,2,Alexa
Carlos Ruiz 5551234567,20:30,6,Ashton
```

### Texto Libre
```
Juan García - 21:00 - 4 personas (Arlin)
María López llega 22h con 2 amigas - Alexa
Carlos Ruiz 5551234567 8:30pm mesa 6 - RP: Ashton
```

## Costos de Claude API

- Modelo: `claude-3-5-haiku-20241022` (Haiku 3.5)
- Precio: ~$0.80 por 1M tokens de entrada, ~$4.00 por 1M tokens de salida
- Un documento típico de 50 reservaciones cuesta aproximadamente $0.02-0.03 USD

## Seguridad

- La API key nunca se expone al cliente
- Solo usuarios autenticados como Ashton pueden usar esta función
- Las reservaciones se guardan con `creado_por: 'Ashton (IA)'` para trazabilidad

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "API key no configurada" | Agrega `ANTHROPIC_API_KEY` a `.env.local` |
| "No se detectaron reservaciones" | Intenta con formato más limpio o pega el texto manualmente |
| Errores de parseo | La IA muestra líneas no reconocidas, revisa y edita manualmente |
| PDF no procesa bien | Convierte a imagen o copia y pega el texto |

## Próximas Mejoras (Opcional)

1. Agregar librería `xlsx` para mejor parseo de Excel
2. Soporte para múltiples archivos a la vez
3. Template descargable para formato estándar de reservas
4. Validación automática de teléfonos duplicados
5. Preview con edición inline de cada campo
