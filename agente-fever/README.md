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

## Instalación

1. Crea el bot con [@BotFather](https://t.me/BotFather) (`/newbot`) y copia el token.
2. En `agente-fever/.env` llena `TELEGRAM_BOT_TOKEN`, `ANTHROPIC_API_KEY` y `OPENAI_API_KEY`. Supabase ya viene configurado.
3. Arranca el agente:
   ```bash
   cd agente-fever
   npm install
   npm start
   ```
4. Escríbele `/id` a tu bot, copia el número que te responde en `TELEGRAM_ALLOWED_IDS` (varios separados por coma) y reinicia con `npm start`.

Solo los IDs de `TELEGRAM_ALLOWED_IDS` pueden operar; a cualquier otra persona el bot solo le dice su ID.

## Para que esté siempre encendido

El agente usa *long polling*: funciona en cualquier computadora o servidor con internet, sin abrir puertos. Para dejarlo corriendo 24/7 en un servidor:

```bash
npm install -g pm2
pm2 start "npm start" --name agente-fever
pm2 save && pm2 startup
```

## Comandos

`/resumen` · `/mesas` · `/reservas` · `/nuevo` (olvida la conversación) · `/id`

## Notas

- Modelo: Claude Haiku 5.5 (rápido y económico). Transcripción: `gpt-4o-mini-transcribe`, la opción más barata de OpenAI. Si cambias a Opus o Sonnet en `.env`, el respaldo automático ante rechazos se activa solo.
- La noche operativa corta a las 6:00: a la 1:00 am "hoy" sigue siendo la noche anterior.
- La conversación de cada chat se reinicia sola después de 6 horas sin actividad o al usar `/nuevo`.
- `.env` está en `.gitignore`: las llaves nunca se suben al repositorio.
