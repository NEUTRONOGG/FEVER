import type Anthropic from "@anthropic-ai/sdk"
import * as op from "./operaciones.js"

type Herramienta = Anthropic.Beta.Messages.BetaTool

const texto = (description: string) => ({ type: "string", description })
const entero = (description: string) => ({ type: "integer", description })
const objeto = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object" as const,
  properties,
  required,
  additionalProperties: false,
})

const ESTADOS_MESA = ["disponible", "ocupada", "reservada"]
const ESTADOS_RESERVACION = ["pendiente", "confirmada", "cancelada", "no_asistio", "completada"]

// La API permite máximo 24 campos opcionales entre todas las herramientas estrictas:
// las de solo consulta van sin modo estricto (las de escritura lo conservan)
const SIN_ESTRICTO = new Set(["ver_mesas", "ver_reservaciones"])

export const HERRAMIENTAS: Herramienta[] = [
  // ---------- Consultas ----------
  {
    name: "resumen_operacion",
    description: "Resumen en vivo de la noche: mesas disponibles/ocupadas/reservadas, ocupación, personas, consumo abierto y reservaciones de hoy. Úsala para preguntas generales sobre cómo va el lugar.",
    input_schema: objeto({}),
  },
  {
    name: "ver_mesas",
    description: "Lista las mesas con su estado, cliente, personas, consumo, RP, mesero y hora de llegada. Filtra opcionalmente por estado.",
    input_schema: objeto({ estado: { type: "string", enum: ESTADOS_MESA, description: "Filtrar por estado" } }),
  },
  {
    name: "ver_mesa",
    description: "Detalle de una mesa, incluidos sus pedidos.",
    input_schema: objeto({ mesa: texto("Número de mesa, p. ej. \"14\"") }, ["mesa"]),
  },
  {
    name: "ver_reservaciones",
    description: "Lista reservaciones de una fecha (por defecto hoy) o de un rango. Devuelve el id que necesitan las demás herramientas de reservaciones.",
    input_schema: objeto({
      fecha: texto("Fecha AAAA-MM-DD; por defecto hoy"),
      hasta: texto("Fecha final AAAA-MM-DD para consultar un rango"),
      estado: { type: "string", enum: ESTADOS_RESERVACION },
      buscar: texto("Parte del nombre del cliente"),
    }),
  },
  {
    name: "buscar_cliente",
    description: "Busca clientes registrados por nombre o teléfono. Devuelve id, visitas, consumo y nivel.",
    input_schema: objeto({ texto: texto("Nombre, apellido o teléfono") }, ["texto"]),
  },
  {
    name: "ver_rps",
    description: "Lista los RPs activos con su abreviatura.",
    input_schema: objeto({}),
  },
  {
    name: "ver_meseros",
    description: "Lista los meseros activos.",
    input_schema: objeto({}),
  },
  // ---------- Operación ----------
  {
    name: "asignar_mesa",
    description: "Sienta a un cliente que llegó sin reservación (walk-in) en una o varias mesas (varias = mesas unidas para grupos grandes). La mesa puede estar disponible o reservada, nunca ocupada. Si no se indica RP, el sistema asigna uno al azar igual que el panel Hostess. Si el cliente ya existe pasa su cliente_id (de buscar_cliente); si no, se registra solo.",
    input_schema: objeto({
      mesas: { type: "array", items: { type: "string" }, description: "Números de mesa" },
      cliente_nombre: texto("Nombre completo del cliente"),
      numero_personas: entero("Número de personas"),
      cliente_id: texto("id del cliente si ya existe"),
      telefono: texto("Teléfono del cliente"),
      rp: texto("Nombre o abreviatura del RP"),
      mesero: texto("Nombre del mesero"),
    }, ["mesas", "cliente_nombre", "numero_personas"]),
  },
  {
    name: "mover_mesa",
    description: "Acomoda a un grupo ya sentado en otra mesa disponible. La cuenta, pedidos, RP y mesero viajan con ellos; la mesa original queda libre sin generar ticket.",
    input_schema: objeto({ origen: texto("Mesa actual"), destino: texto("Mesa nueva (disponible)") }, ["origen", "destino"]),
  },
  {
    name: "reservar_mesa",
    description: "Aparta una mesa específica (queda en estado reservada en el mapa) para alguien que llegará hoy.",
    input_schema: objeto({
      mesa: texto("Número de mesa"),
      cliente_nombre: texto("Nombre del cliente"),
      numero_personas: entero("Personas"),
      telefono: texto("Teléfono"),
      hora: texto("Hora estimada de llegada HH:MM (24 h)"),
    }, ["mesa", "cliente_nombre", "numero_personas"]),
  },
  {
    name: "crear_reservacion",
    description: "Agenda una reservación (aparece en \"Por llegar\" del panel Hostess el día indicado). No aparta una mesa concreta; la mesa se asigna al llegar.",
    input_schema: objeto({
      cliente_nombre: texto("Nombre del cliente"),
      fecha: texto("AAAA-MM-DD"),
      hora: texto("HH:MM en 24 h"),
      numero_personas: entero("Personas"),
      numero_hombres: entero("Hombres (opcional)"),
      numero_mujeres: entero("Mujeres (opcional)"),
      rp: texto("Nombre o abreviatura del RP"),
      telefono: texto("Teléfono"),
      notas: texto("Notas: cumpleaños, preferencias de mesa, etc."),
    }, ["cliente_nombre", "fecha", "hora", "numero_personas"]),
  },
  {
    name: "modificar_reservacion",
    description: "Cambia datos de una reservación pendiente. Envía solo los campos que cambian.",
    input_schema: objeto({
      id: texto("id de la reservación (de ver_reservaciones)"),
      cliente_nombre: texto("Nuevo nombre"),
      fecha: texto("Nueva fecha AAAA-MM-DD"),
      hora: texto("Nueva hora HH:MM"),
      numero_personas: entero("Nuevo número de personas"),
      numero_hombres: entero("Hombres"),
      numero_mujeres: entero("Mujeres"),
      rp: texto("Nuevo RP"),
      telefono: texto("Nuevo teléfono"),
      notas: texto("Notas (reemplaza las anteriores)"),
    }, ["id"]),
  },
  {
    name: "confirmar_llegada",
    description: "Pasa una reservación a mesa: el cliente llegó. Confirma la reservación y ocupa la mesa indicada (igual que \"Confirmar\" en Por llegar).",
    input_schema: objeto({
      id: texto("id de la reservación"),
      mesa: texto("Mesa donde se sienta"),
      personas_llegaron: entero("Personas que realmente llegaron, si difiere"),
    }, ["id", "mesa"]),
  },
  // ---------- Requieren confirmación con botón ----------
  {
    name: "liberar_mesa",
    description: "Libera una mesa ocupada y cierra su cuenta (genera ticket si hay consumo). Requiere que el usuario confirme con un botón; la herramienta solo prepara la acción.",
    input_schema: objeto({ mesa: texto("Número de mesa") }, ["mesa"]),
  },
  {
    name: "cerrar_todas_las_mesas",
    description: "Cierre de la noche: libera TODAS las mesas ocupadas y genera sus tickets. Requiere confirmación con botón.",
    input_schema: objeto({}),
  },
  {
    name: "cancelar_reserva_de_mesa",
    description: "Quita el apartado de una mesa en estado reservada y la deja disponible. Requiere confirmación con botón.",
    input_schema: objeto({ mesa: texto("Número de mesa") }, ["mesa"]),
  },
  {
    name: "cancelar_reservacion",
    description: "Cancela una reservación pendiente. Requiere confirmación con botón.",
    input_schema: objeto({ id: texto("id de la reservación") }, ["id"]),
  },
  {
    name: "marcar_no_llego",
    description: "Marca que el cliente de una reservación no llegó. Requiere confirmación con botón.",
    input_schema: objeto({ id: texto("id de la reservación") }, ["id"]),
  },
].map((h) => ({ ...h, ...(SIN_ESTRICTO.has(h.name) ? {} : { strict: true }) }) as Herramienta)

export const REQUIEREN_CONFIRMACION = new Set([
  "liberar_mesa",
  "cerrar_todas_las_mesas",
  "cancelar_reserva_de_mesa",
  "cancelar_reservacion",
  "marcar_no_llego",
])

export async function ejecutarHerramienta(nombre: string, args: any, operador: string): Promise<unknown> {
  switch (nombre) {
    case "resumen_operacion": return op.resumenOperacion()
    case "ver_mesas": return op.verMesas(args.estado)
    case "ver_mesa": return op.verMesa(args.mesa)
    case "ver_reservaciones": return op.verReservaciones(args)
    case "buscar_cliente": return op.buscarCliente(args.texto)
    case "ver_rps": return op.verRPs()
    case "ver_meseros": return op.verMeseros()
    case "asignar_mesa": return op.asignarMesa(args, operador)
    case "mover_mesa": return op.moverMesa(args)
    case "reservar_mesa": return op.reservarMesa(args)
    case "crear_reservacion": return op.crearReservacion(args, operador)
    case "modificar_reservacion": return op.modificarReservacion(args)
    case "confirmar_llegada": return op.confirmarLlegada(args, operador)
  }
  throw new op.ErrorOperacion(`Herramienta desconocida: ${nombre}`)
}
