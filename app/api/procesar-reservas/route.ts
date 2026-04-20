import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get('archivo') as File | null;
    const texto = (formData.get('texto') as string) || '';
    const fechaHoy = (formData.get('fechaHoy') as string) || new Date().toISOString().split('T')[0];

    if (!archivo && !texto.trim()) {
      return NextResponse.json({ error: 'No se proporcionó archivo ni texto' }, { status: 400 });
    }

    // Verificar API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Anthropic no configurada.' },
        { status: 500 }
      );
    }

    let messageContent: any[] = [];
    let usePdfBeta = false;

    if (texto.trim()) {
      // Texto pegado directamente — enviar a Claude sin procesar archivo
      messageContent = [{
        type: 'text',
        text: `Lista de reservaciones a procesar:\n\n${texto}`
      }];
    } else {
      // Procesar archivo
      const bytes = await archivo!.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Content = buffer.toString('base64');
      const fileType = archivo!.type;
      const fileName = archivo!.name.toLowerCase();

      // Determinar tipo de media según extensión
      if (fileName.endsWith('.pdf')) {
      // Extraer texto del PDF con pdf-parse
      try {
        const pdfData = await pdfParse(buffer);
        const textoExtraido = pdfData.text?.trim();
        console.log('📄 PDF detectado, texto extraído:', textoExtraido?.substring(0, 200));
        
        if (textoExtraido && textoExtraido.length > 20) {
          // Si se extrajo texto suficiente, enviarlo como texto
          messageContent = [{
            type: 'text',
            text: `Contenido extraído del PDF de reservaciones:\n\n${textoExtraido}`
          }];
          console.log('📄 Texto del PDF extraído exitosamente (' + textoExtraido.length + ' caracteres)');
        } else {
          // Si no hay texto (PDF escaneado/imagen), enviar como documento con beta header
          usePdfBeta = true;
          messageContent = [{
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64Content
            }
          }];
          console.log('📄 PDF sin texto legible, enviando como documento a Claude (beta PDF)');
        }
      } catch (pdfError) {
        console.error('⚠️ Error extrayendo texto del PDF:', pdfError);
        // Fallback: enviar como documento con beta header
        usePdfBeta = true;
        messageContent = [{
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64Content
          }
        }];
        console.log('📄 Fallback: enviando PDF como documento a Claude (beta PDF)');
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Procesar Excel con XLSX
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        
        messageContent = [{
          type: 'text',
          text: `Contenido del archivo Excel de reservaciones:\n\n${csvData}`
        }];
      } catch (excelError) {
        console.error('Error procesando Excel:', excelError);
        messageContent = [{
          type: 'text',
          text: `Error: No se pudo procesar el archivo Excel. Intenta convertirlo a CSV o texto plano.`
        }];
      }
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      messageContent = [{
        type: 'text',
        text: `Archivo Word de reservaciones. Contenido extraído (base64 por simplicidad): ${base64Content.substring(0, 1000)}...`
      }];
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      const textoArchivo = buffer.toString('utf-8');
      messageContent = [{
        type: 'text',
        text: `Contenido del archivo de texto:\n\n${textoArchivo}`
      }];
    } else {
      // Imagen (screenshot de lista de reservas)
      const mediaType = fileType || 'image/jpeg';
      messageContent = [{
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Content
        }
      }];
    }
    } // fin else (modo archivo)
    const systemPrompt = `Eres un asistente especializado en extraer reservaciones de restaurante.

FECHA ACTUAL: ${fechaHoy}

FORMATO DEL TEXTO:
- Puede haber uno o varios encabezados de día: "MIÉRCOLES 25", "VIERNES 27", "SÁBADO 28"
- Las reservaciones de cada sección pertenecen al encabezado inmediatamente anterior
- Formato típico de cada reservación: "N. Nombre Apellido Xpx (INICIALES)" ej: "1. Alejandro Maciel 8px (AT)"
- Las iniciales entre paréntesis (AT, JM, AV, etc.) son el identificador del RP (campo rp_nombre)
- Ignora caracteres invisibles Unicode (U+2060, U+200B, etc.)

INFERENCIA DE FECHA (MUY IMPORTANTE):
- "MIÉRCOLES 25" significa día 25 del mes en que ese día cae en miércoles
- Busca la fecha PASADA MÁS RECIENTE donde el número del día coincida con el día de semana indicado
- Usa la FECHA ACTUAL (${fechaHoy}) como punto de referencia, nunca uses fechas futuras
- Ejemplo: si hoy es 2026-04-17 y el texto dice "MIÉRCOLES 25" → la fecha correcta es 2026-03-25
- Ejemplo: si hoy es 2026-04-17 y el texto dice "VIERNES 27" → la fecha correcta es 2026-03-27

PROCESA MÚLTIPLES SECCIONES:
- Si hay varios encabezados de día, procesa cada sección por separado
- Cada reservación debe tener la fecha de SU sección correspondiente

FORMATO DE RESPUESTA JSON OBLIGATORIO:
{
  "reservaciones": [
    {
      "cliente_nombre": "Alejandro Maciel",
      "telefono": null,
      "fecha": "2026-03-25",
      "hora": "20:00",
      "numero_personas": 8,
      "rp_nombre": "AT",
      "notas": null
    }
  ],
  "total_reservaciones": 51
}

REGLAS:
- Cada reservación DEBE tener su propia "fecha" en formato YYYY-MM-DD
- Si no hay hora explícita, usa "20:00"
- Si no hay teléfono, usa null
- numero_personas como número entero (si no se especifica, usa 2)
- rp_nombre = las iniciales entre paréntesis exactas (ej: "AT", "JM", "AV")
- No incluyas encabezados de sección como reservaciones
- Extrae TODAS las reservaciones sin omitir ninguna`;

    // Llamada a Claude API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };
    // Agregar beta header si se envía PDF como documento
    if (usePdfBeta) {
      headers['anthropic-beta'] = 'pdfs-2024-09-25';
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              ...messageContent,
              {
                type: 'text',
                text: 'Extrae todas las reservaciones de este documento y devuélvelas en el formato JSON especificado.'
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Claude API:', errorData);
      return NextResponse.json(
        { error: `Error en Claude API: ${errorData.error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const claudeResponse = await response.json();
    const contenidoTexto = claudeResponse.content?.[0]?.text || '';
    
    // DEBUG: Log the full response
    console.log('📝 RESPUESTA COMPLETA DE CLAUDE:');
    console.log('=================================');
    console.log(contenidoTexto);
    console.log('=================================');
    console.log('📊 Tokens usados:', JSON.stringify(claudeResponse.usage, null, 2));

    // Extraer JSON de la respuesta
    let resultado;
    try {
      // Buscar JSON en la respuesta (puede estar entre ```json y ``` o solo el JSON)
      const jsonMatch = contenidoTexto.match(/```json\n?([\s\S]*?)\n?```/) || 
                       contenidoTexto.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : contenidoTexto;
      resultado = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      console.log('🔍 Texto recibido:', contenidoTexto.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'No se pudo parsear la respuesta de Claude',
          respuesta_cruda: contenidoTexto.substring(0, 1000),
          sugerencia: 'El documento puede estar vacío o en formato no legible'
        },
        { status: 500 }
      );
    }

    // Guardar en Supabase Storage para tracking de desempeño
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Crear nombre de archivo con fecha y hora
        const ahora = new Date();
        const timestamp = ahora.toISOString().replace(/[:.]/g, '-');
        const fecha = resultado.fecha || ahora.toISOString().split('T')[0];
        const nombreArchivo = archivo?.name ?? 'texto-pegado';
        const fileName = `reservaciones/${fecha}/${timestamp}-${nombreArchivo.split('.')[0]}.json`;
        
        // Preparar datos para almacenar
        const datosAlmacenar = {
          ...resultado,
          archivo_original: archivo?.name ?? 'texto-pegado.txt',
          fecha_procesamiento: ahora.toISOString(),
          modelo_usado: CLAUDE_MODEL,
          tokens_usados: claudeResponse.usage || null
        };
        
        // Guardar en Storage
        const { error: storageError } = await supabase.storage
          .from('reservaciones-procesadas')
          .upload(fileName, JSON.stringify(datosAlmacenar, null, 2), {
            contentType: 'application/json',
            upsert: false
          });
        
        if (storageError) {
          console.warn('⚠️ Error guardando en Storage:', storageError);
          // No fallar la respuesta, solo advertir
        } else {
          console.log('✅ Archivo guardado en Storage:', fileName);
        }
        
        // Guardar registro en tabla de tracking
        const registroTracking = {
          fecha: resultado.fecha || fecha,
          dia_semana: resultado.dia_semana || null,
          rps_procesados: Object.keys(resultado.resumen_por_rp || {}),
          total_reservaciones: resultado.total_reservaciones || 0,
          archivo_original: archivo?.name ?? 'texto-pegado.txt',
          archivo_storage: fileName,
          fecha_procesamiento: ahora.toISOString(),
          modelo_usado: CLAUDE_MODEL
        };
        
        const { error: dbError } = await supabase
          .from('reservaciones_procesadas_tracking')
          .insert(registroTracking);
        
        if (dbError) {
          console.warn('⚠️ Error guardando tracking en BD:', dbError);
        } else {
          console.log('✅ Tracking guardado en BD');
        }
      }
    } catch (storageError) {
      console.warn('⚠️ Error en proceso de almacenamiento:', storageError);
      // No interrumpir la respuesta
    }

    return NextResponse.json({
      success: true,
      data: resultado,
      modelo_usado: CLAUDE_MODEL,
      tokens_usados: claudeResponse.usage || null,
      almacenado: true
    });

  } catch (error) {
    console.error('Error en procesar-reservas:', error);
    return NextResponse.json(
      { error: `Error interno: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Función auxiliar para extraer texto básico de Excel (simplificado)
function extraerTextoDeExcel(buffer: Buffer): string {
  // Nota: Para una extracción completa de Excel, se recomienda usar una librería como xlsx
  // Por ahora, convertimos a representación de texto simple
  try {
    const text = buffer.toString('utf-8');
    // Filtrar caracteres legibles
    return text.replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑüÜ]/g, ' ').substring(0, 50000);
  } catch {
    return '[No se pudo extraer texto del Excel. Usa formato CSV o TXT para mejor resultado.]';
  }
}
