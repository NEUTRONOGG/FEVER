import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const texto = (formData.get('texto') as string) || '';
    const fechaHoy = (formData.get('fechaHoy') as string) || new Date().toISOString().split('T')[0];

    if (!texto.trim()) {
      return NextResponse.json({ error: 'No se proporcionó texto' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key de Anthropic no configurada.' }, { status: 500 });
    }

    const messageContent = [
      { type: 'text', text: `Lista de reservaciones:\n\n${texto}` }
    ];

    const systemPrompt = `Eres un asistente especializado en extraer reservaciones de restaurante.

FECHA ACTUAL: ${fechaHoy}

FORMATO DEL TEXTO:
- Puede haber uno o varios encabezados de día: "MIÉRCOLES 25", "VIERNES 27", "SÁBADO 28"
- Las reservaciones de cada sección pertenecen al encabezado inmediatamente anterior
- Formato típico: "N. Nombre Apellido Xpx (INICIALES)" ej: "1. Alejandro Maciel 8px (AT)"
- Las iniciales entre paréntesis (AT, JM, AV, etc.) son el campo rp_nombre
- Ignora caracteres invisibles Unicode (U+2060, U+200B, etc.)

INFERENCIA DE FECHA (MUY IMPORTANTE):
- "MIÉRCOLES 25" = día 25 del mes donde ese día cae en miércoles
- Busca la fecha PASADA MÁS RECIENTE donde el número del día coincida con el día de semana
- Usa FECHA ACTUAL (${fechaHoy}) como referencia, nunca uses fechas futuras
- Ejemplo: hoy 2026-04-23, texto dice "MIÉRCOLES 25" → fecha correcta: 2026-03-25
- Ejemplo: hoy 2026-04-23, texto dice "VIERNES 18" → fecha correcta: 2026-04-18

PROCESA MÚLTIPLES SECCIONES:
- Cada reservación debe tener la fecha de SU sección

FORMATO DE RESPUESTA (solo JSON, sin texto extra):
{
  "reservaciones": [
    {
      "cliente_nombre": "Nombre Apellido",
      "telefono": null,
      "fecha": "2026-04-18",
      "hora": "20:00",
      "numero_personas": 8,
      "rp_nombre": "AT",
      "notas": null
    }
  ],
  "total_reservaciones": 51
}

REGLAS:
- Cada reservación DEBE tener su propia fecha en YYYY-MM-DD
- Si no hay hora, usa "20:00"
- Si no hay teléfono, usa null
- numero_personas como entero (si no hay, usa 2)
- rp_nombre = iniciales entre paréntesis exactas
- No incluyas encabezados como reservaciones
- Extrae TODAS sin omitir ninguna`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            ...messageContent,
            { type: 'text', text: 'Extrae todas las reservaciones y devuelve SOLO el JSON.' }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `Error en Claude API: ${errorData.error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const claudeResponse = await response.json();
    const contenidoTexto = claudeResponse.content?.[0]?.text || '';
    console.log('Claude respondió:', contenidoTexto.substring(0, 300));

    let resultado;
    try {
      const jsonMatch = contenidoTexto.match(/```json\n?([\s\S]*?)\n?```/) ||
                        contenidoTexto.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : contenidoTexto;
      resultado = JSON.parse(jsonString);
    } catch {
      return NextResponse.json(
        { error: 'Claude no devolvió JSON válido', respuesta_cruda: contenidoTexto.substring(0, 500) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: resultado, modelo_usado: CLAUDE_MODEL });

  } catch (error) {
    console.error('Error en procesar-reservas:', error);
    return NextResponse.json(
      { error: `Error interno: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
