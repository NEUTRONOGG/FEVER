import "dotenv/config"

function requerida(nombre: string): string {
  const valor = process.env[nombre]?.trim()
  if (!valor) {
    console.error(`❌ Falta la variable ${nombre} en agente-fever/.env (usa .env.example como guía)`)
    process.exit(1)
  }
  return valor
}

export const config = {
  telegramToken: requerida("TELEGRAM_BOT_TOKEN"),
  anthropicKey: requerida("ANTHROPIC_API_KEY"),
  openaiKey: requerida("OPENAI_API_KEY"),
  supabaseUrl: requerida("SUPABASE_URL"),
  supabaseKey: requerida("SUPABASE_ANON_KEY"),
  // IDs de Telegram autorizados (separados por coma). Vacío = nadie puede operar.
  usuariosPermitidos: new Set(
    (process.env.TELEGRAM_ALLOWED_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  ),
  zonaHoraria: process.env.ZONA_HORARIA?.trim() || "America/Mexico_City",
  modelo: process.env.MODELO_CLAUDE?.trim() || "claude-haiku-5-5",
  esfuerzo: (process.env.ESFUERZO_CLAUDE?.trim() || "medium") as "low" | "medium" | "high",
  vozRespuesta: process.env.VOZ_RESPUESTA?.trim() || "coral",
  // Responder también con nota de voz cuando el mensaje llegó por voz
  responderConVoz: (process.env.RESPONDER_CON_VOZ ?? "no").toLowerCase() === "si",
  // Si se define, la primera vez se pide este código para registrarse
  codigoAcceso: process.env.CODIGO_ACCESO?.trim() || "",
  nombreAgente: process.env.NOMBRE_AGENTE?.trim() || "Agente FEVER",
  modeloTranscripcion: process.env.OPENAI_MODELO_TRANSCRIPCION?.trim() || "gpt-4o-mini-transcribe",
  modeloVoz: process.env.OPENAI_MODELO_VOZ?.trim() || "gpt-4o-mini-tts",
}
