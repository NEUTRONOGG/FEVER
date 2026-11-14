// Configuración compartida por la versión local (Node + .env) y la de Cloudflare (secretos del Worker).
// Se llena una vez con iniciarConfig() desde el punto de entrada correspondiente.

export interface Config {
  telegramToken: string
  telegramSecreto: string
  anthropicKey: string
  openaiKey: string
  supabaseUrl: string
  supabaseKey: string
  usuariosPermitidos: Set<string>
  codigoAcceso: string
  zonaHoraria: string
  modelo: string
  esfuerzo: "low" | "medium" | "high"
  vozRespuesta: string
  responderConVoz: boolean
  nombreAgente: string
  modeloTranscripcion: string
  modeloVoz: string
}

export const config = {} as Config
let iniciada = false

export function iniciarConfig(fuente: Record<string, unknown>) {
  if (iniciada) return config
  const leer = (n: string) => (typeof fuente[n] === "string" ? (fuente[n] as string).trim() : "")
  const requerida = (n: string) => {
    const v = leer(n)
    if (!v) throw new Error(`Falta la variable ${n} (en .env o en los secretos del Worker)`)
    return v
  }
  Object.assign(config, {
    telegramToken: requerida("TELEGRAM_BOT_TOKEN"),
    telegramSecreto: leer("TELEGRAM_WEBHOOK_SECRET"),
    anthropicKey: requerida("ANTHROPIC_API_KEY"),
    openaiKey: requerida("OPENAI_API_KEY"),
    supabaseUrl: requerida("SUPABASE_URL"),
    supabaseKey: requerida("SUPABASE_ANON_KEY"),
    // Administradores: reciben aviso de usuarios nuevos y pueden bloquear
    usuariosPermitidos: new Set(leer("TELEGRAM_ALLOWED_IDS").split(",").map((s) => s.trim()).filter(Boolean)),
    // Si se define, la primera vez se pide este código para registrarse
    codigoAcceso: leer("CODIGO_ACCESO"),
    zonaHoraria: leer("ZONA_HORARIA") || "America/Mexico_City",
    modelo: leer("MODELO_CLAUDE") || "claude-haiku-5-5",
    esfuerzo: (leer("ESFUERZO_CLAUDE") || "medium") as Config["esfuerzo"],
    vozRespuesta: leer("VOZ_RESPUESTA") || "coral",
    // Responder también con nota de voz cuando el mensaje llegó por voz
    responderConVoz: (leer("RESPONDER_CON_VOZ") || "no").toLowerCase() === "si",
    nombreAgente: leer("NOMBRE_AGENTE") || "Agente FEVER",
    modeloTranscripcion: leer("OPENAI_MODELO_TRANSCRIPCION") || "gpt-4o-mini-transcribe",
    modeloVoz: leer("OPENAI_MODELO_VOZ") || "gpt-4o-mini-tts",
  } satisfies Config)
  iniciada = true
  return config
}

// Crea el cliente la primera vez que se usa (ya con la configuración cargada)
export function perezoso<T>(crear: () => T): () => T {
  let valor: T | undefined
  return () => (valor ??= crear())
}
