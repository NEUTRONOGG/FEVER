// Sistema de íconos FEVER: placa con degradado neón y resplandor (el estilo original del sistema),
// unida al título como una sola pieza.
import type { ComponentType, ReactNode, SVGProps } from "react"

export type PropsIcono = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string
  strokeWidth?: number | string
  color?: string
}
export type Icono = ComponentType<PropsIcono>

/** Degradado por defecto: el ámbar del sistema. */
export const DEGRADADO_FEVER = "from-amber-400 via-amber-500 to-orange-600"

/** Cuerda de terciopelo con postes: el acceso del antro (área Cadena). */
export function CuerdaVip({ size = 24, strokeWidth = 2, color = "currentColor", ...props }: PropsIcono) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="5" cy="4.5" r="1.5" />
      <circle cx="19" cy="4.5" r="1.5" />
      <path d="M5 6v13" />
      <path d="M19 6v13" />
      <path d="M2.5 20h5" />
      <path d="M16.5 20h5" />
      <path d="M5 8.5c3.5 5 10.5 5 14 0" />
    </svg>
  )
}

const TAMANOS = {
  xs: { caja: 28, icono: 15, radio: 9 },
  sm: { caja: 38, icono: 19, radio: 12 },
  md: { caja: 48, icono: 24, radio: 14 },
  lg: { caja: 64, icono: 32, radio: 18 },
  xl: { caja: 80, icono: 40, radio: 22 },
} as const

/** Ícono blanco sobre placa con degradado neón, brillo superior y resplandor detrás. */
export function Emblema({
  icono: IconoComp,
  tamano = "md",
  degradado = DEGRADADO_FEVER,
  apagado = false,
  className = "",
}: {
  icono: Icono
  tamano?: keyof typeof TAMANOS
  /** Clases de degradado de Tailwind, p. ej. "from-purple-500 to-pink-500" */
  degradado?: string
  apagado?: boolean
  className?: string
}) {
  const t = TAMANOS[tamano]
  const fondo = apagado ? "from-slate-600 to-slate-700" : degradado
  return (
    <span aria-hidden="true" className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: t.caja, height: t.caja }}>
      {!apagado && (
        <span
          className={`absolute inset-0 bg-gradient-to-br ${fondo} opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-80`}
          style={{ borderRadius: t.radio }}
        />
      )}
      <span
        className={`relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br ${fondo} shadow-lg ring-1 ring-inset ring-white/25`}
        style={{ borderRadius: t.radio }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        <IconoComp size={t.icono} strokeWidth={1.9} color="white" className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
      </span>
    </span>
  )
}

/** Emblema + título como una sola pieza, unidos por una línea con el mismo degradado. */
export function TituloEmblema({
  icono,
  titulo,
  etiqueta,
  descripcion,
  tamano = "lg",
  degradado = DEGRADADO_FEVER,
  apagado = false,
  como: Etiqueta = "h3",
  claseTitulo = "text-2xl",
  linea = true,
}: {
  icono: Icono
  titulo: ReactNode
  etiqueta?: ReactNode
  descripcion?: ReactNode
  tamano?: keyof typeof TAMANOS
  degradado?: string
  apagado?: boolean
  como?: "h1" | "h2" | "h3"
  claseTitulo?: string
  linea?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Emblema icono={icono} tamano={tamano} degradado={degradado} apagado={apagado} />
        <div className="min-w-0">
          {etiqueta && (
            <p className={`mb-1 bg-gradient-to-r ${degradado} bg-clip-text text-[10px] font-bold uppercase tracking-[0.3em] text-transparent`}>{etiqueta}</p>
          )}
          <Etiqueta className={`${claseTitulo} font-bold leading-tight tracking-tight text-white`}>{titulo}</Etiqueta>
        </div>
      </div>
      {linea && <div className={`mt-4 h-px bg-gradient-to-r ${degradado} opacity-40`} aria-hidden="true" />}
      {descripcion && <p className="mt-3 text-sm leading-relaxed text-slate-400">{descripcion}</p>}
    </div>
  )
}
