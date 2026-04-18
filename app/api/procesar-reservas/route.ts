import { NextRequest, NextResponse } from 'next/server';

// Modelo Claude Haiku 3.5 - más barato y rápido para extracción de datos
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';

interface ReservaExtraida {
  cliente_nombre: string;
  telefono?: string;
  fecha?: string;
  hora?: string;
  numero_personas: number;
  rp_nombre?: string;
  notas?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get('archivo') as File;
    const fechaEvento = formData.get('fechaEvento') as string;

    if (!archivo) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Verificar API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Anthropic no configurada. Agrega ANTHROPIC_API_KEY en variables de entorno.' },
        { status: 500 }
      );
    }

    // Convertir archivo a base64 según tipo
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');
    const fileType = archivo.type;
    const fileName = archivo.name.toLowerCase();

    let messageContent: any[] = [];

    // Determinar tipo de media según extensión
    if (fileName.endsWith('.pdf')) {
      messageContent = [{
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Content
        }
      }];
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Para Excel, convertimos a texto CSV-like o usamos descripción
      const textoExtraido = extraerTextoDeExcel(buffer);
      messageContent = [{
        type: 'text',
        text: `Contenido del archivo Excel de reservaciones:\n\n${textoExtraido}`
      }];
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      messageContent = [{
        type: 'text',
        text: `Archivo Word de reservaciones. Contenido extraído (base64 por simplicidad): ${base64Content.substring(0, 1000)}...`
      }];
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      const texto = buffer.toString('utf-8');
      messageContent = [{
        type: 'text',
        text: `Contenido del archivo de texto:\n\n${texto}`
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

    // Prompt para Claude
    const systemPrompt = `Eres un asistente especializado en extraer datos de reservaciones de restaurantes.
Tu tarea es analizar el documento proporcionado y extraer TODAS las reservaciones en formato estructurado.

INSTRUCCIONES:
1. Extrae cada reservación con: nombre del cliente, teléfono (si existe), fecha, hora, número de personas, nombre del RP, y notas adicionales.
2. La fecha del evento general es: ${fechaEvento || 'la que aparezca en el documento'}.
3. Si una reserva no tiene fecha específica, usa "${fechaEvento || 'fecha del evento'}".
4. Normaliza las horas al formato 24h (HH:MM).
5. Si no hay número de personas explícito, asume 2 por defecto.
6. Identifica claramente a qué RP pertenece cada reservación.

FORMATO DE RESPUESTA (JSON obligatorio):
{
  "reservaciones": [
    {
      "cliente_nombre": "string",
      "telefono": "string o null",
      "fecha": "YYYY-MM-DD",
      "hora": "HH:MM",
      "numero_personas": number,
      "rp_nombre": "string",
      "notas": "string o null"
    }
  ],
  "resumen_por_rp": {
    "Nombre del RP": 5,
    "Otro RP": 3
  },
  "total_reservaciones": 8,
  "errores_detectados": ["si hay líneas que no entendiste"]
}`;

    // Llamada a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
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

    // Extraer JSON de la respuesta
    let resultado;
    try {
      // Buscar JSON en la respuesta (puede estar entre ```json y ``` o solo el JSON)
      const jsonMatch = contenidoTexto.match(/```json\n?([\s\S]*?)\n?```/) || 
                       contenidoTexto.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : contenidoTexto;
      resultado = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parseando JSON:', parseError);
      console.log('Respuesta de Claude:', contenidoTexto);
      return NextResponse.json(
        { 
          error: 'No se pudo parsear la respuesta de Claude',
          respuesta_cruda: contenidoTexto,
          sugerencia: 'Intenta con un formato de documento más claro o revisa la API key'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultado,
      modelo_usado: CLAUDE_MODEL,
      tokens_usados: claudeResponse.usage || null
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
