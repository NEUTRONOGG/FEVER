# Agente FEVER (Telegram · voz y texto)

Asistente de operación conectado al mismo Supabase que el sistema FEVER. Todo lo que hace aparece al instante en el panel Hostess y en el mapa 3D.

## Qué puede hacer

| Pídele… | Lo que hace en el sistema |
|---|---|
| "¿Cómo va la noche?", "¿qué mesas hay libres?", "¿quién está en la 14?" | Consulta mesas, ocupación, consumo y reservaciones en vivo |
| "Sienta a Mariana López, 6 personas, en la 22 con Ashton" | Ocupa la mesa, registra la visita y crea al cliente si es nuevo (igual que el panel Hostess) |
| "Junta la 20 y la 21 para un grupo de 14" | Mesas unidas |
| "Cambia a los de la 5 a la 12" | Mueve al grupo con su cuenta, RP y mesero |
| "Agenda a Diego, sábado 11:30 pm, 8 personas, RP Pato" | Crea la reservación (aparece en *Por llegar* esa noche) |
| "Cambia la reserva de Diego a 10 personas" | Modifica reservaciones pendientes |
| "Llegó Valeria, pásala a la 16" | Confirma la reservación y ocupa la mesa |
| "Aparta la 7 para Luis a las 12" | Deja la mesa en estado *reservada* |
| "Libera la 14", "cancela la reserva de…", "no llegó…", "cierra todas las mesas" | Pide confirmación con botón ✅ antes de ejecutar |

Por voz: manda una nota de voz. El agente la transcribe, te muestra lo que entendió y responde por escrito. (Para que también responda con nota de voz, pon `RESPONDER_CON_VOZ=si` en `.env`.)

## Dónde corre

En **Cloudflare Workers** (plan Workers Paid), siempre encendido y sin servidores que administrar:

- `https://agente-fever.nicolaspinaya90.workers.dev` recibe los mensajes de Telegram por webhook.
- Cada chat es un Durable Object que guarda su conversación y procesa sus mensajes en orden.
- Otro Durable Object guarda los usuarios registrados y bloqueados.
- Las llaves viven como **secretos cifrados** del Worker; nunca en el código.

| Comando (dentro de `agente-fever/`) | Para qué |
|---|---|
| `npm run desplegar` | Publica los cambios del código en Cloudflare |
| `npm run logs` | Ver en vivo lo que hace el agente en la nube |
| `npx wrangler secret put NOMBRE` | Cambiar una llave (p. ej. `ANTHROPIC_API_KEY`) |
| `npm run local` | Correrlo en tu computadora para pruebas (se niega si la nube está activa) |
| `npm run verificar` | Revisar tipos de ambas versiones |

Las opciones que no son secretas (modelo, voz, zona horaria) están en `vars` de `wrangler.jsonc`.

### Volver a instalar desde cero

1. Crea el bot con [@BotFather](https://t.me/BotFather) y llena `agente-fever/.env` (usa `.env.example`).
2. `npx wrangler login` y `npm run desplegar`.
3. Sube los secretos: `npx wrangler secret put TELEGRAM_BOT_TOKEN` (y `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TELEGRAM_ALLOWED_IDS`, `TELEGRAM_WEBHOOK_SECRET`).
4. Conecta Telegram abriendo una vez `https://<tu-worker>.workers.dev/configurar?clave=<TELEGRAM_WEBHOOK_SECRET>`.

## Comandos

`/start` · `/sucursal` (León / Aguascalientes) · `/resumen` · `/mesas` · `/reservas` · `/nuevo` (olvida la conversación) · `/id` · `/usuarios` (administradores)

## Notas

- Modelo: Claude Haiku 5.5 (rápido y económico). Transcripción: `gpt-4o-mini-transcribe`, la opción más barata de OpenAI. Si cambias a Opus o Sonnet en `.env`, el respaldo automático ante rechazos se activa solo.
- Cada chat trabaja con una sucursal (se elige con `/sucursal`). Para comparar León y Aguascalientes o ver el acumulado, basta con preguntarlo.
- La noche operativa corta a las 6:00: a la 1:00 am "hoy" sigue siendo la noche anterior.
- La conversación de cada chat se reinicia sola después de 6 horas sin actividad, con `/start` o con `/nuevo`.
- Cualquiera que le dé `/start` queda registrado; los administradores (`TELEGRAM_ALLOWED_IDS`) reciben aviso y pueden bloquear con un botón o con `/usuarios`.
- `.env` está en `.gitignore`: las llaves nunca se suben al repositorio.
