import OpenAI, { toFile } from "openai"
import { config } from "./config.js"

const openai = new OpenAI({ apiKey: config.openaiKey })

// Vocabulario del lugar para que la transcripción no confunda nombres y términos
const VOCABULARIO = "FEVER, hostess, RP, mesa, mesas unidas, reservación, walk-in, cortesía, botella, cover, liberar mesa, cerrar cuenta, cabina, barra."

export async function transcribir(audio: Buffer, nombreArchivo = "voz.ogg"): Promise<string> {
  const r = await openai.audio.transcriptions.create({
    file: await toFile(audio, nombreArchivo, { type: "audio/ogg" }),
    model: config.modeloTranscripcion,
    language: "es",
    prompt: VOCABULARIO,
  })
  return r.text.trim()
}

// Devuelve OGG/Opus, el formato que Telegram reproduce como nota de voz
export async function sintetizar(texto: string): Promise<Buffer> {
  const r = await openai.audio.speech.create({
    model: config.modeloVoz,
    voice: config.vozRespuesta,
    input: texto.slice(0, 4000),
    instructions: "Español de México. Tono cálido, seguro y ágil, como una hostess profesional de un antro. Lee números de mesa y horas con claridad.",
    response_format: "opus",
  })
  return Buffer.from(await r.arrayBuffer())
}
