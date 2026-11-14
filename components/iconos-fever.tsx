// Sistema de íconos FEVER: trazo fino dorado dentro de un emblema, unido al título.
import type { ComponentType, ReactNode, SVGProps } from "react"

export type PropsIcono = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string
  strokeWidth?: number | string
  color?: string
}
export type Icono = ComponentType<PropsIcono>

/** Degradado dorado compartido por todos los íconos (se monta una vez en el layout raíz). */
export function DefinicionesFever() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        {/* userSpaceOnUse: también pinta líneas rectas, cuya caja mide 0 de ancho o alto */}
        <linearGradient id="fever-oro" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0" stopColor="#fff1c1" />
          <stop offset="0.45" stopColor="#f5c451" />
          <stop offset="1" stopColor="#c47f17" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const TRAZO_ORO = "url(#fever-oro)"

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
  sm: { caja: 36, icono: 18, radio: 11 },
  md: { caja: 46, icono: 22, radio: 14 },
  lg: { caja: 60, icono: 28, radio: 18 },
  xl: { caja: 76, icono: 36, radio: 22 },
} as const

/** Ícono enmarcado: borde dorado biselado, fondo oscuro con brillo y trazo degradado. */
export function Emblema({
  icono: IconoComp,
  tamano = "md",
  apagado = false,
  className = "",
}: {
  icono: Icono
  tamano?: keyof typeof TAMANOS
  apagado?: boolean
  className?: string
}) {
  const t = TAMANOS[tamano]
  return (
    <span
      aria-hidden="true"
      className={`fever-emblema relative inline-grid shrink-0 place-items-center ${className}`}
      style={{
        width: t.caja,
        height: t.caja,
        borderRadius: t.radio,
        padding: 1,
        background: apagado
          ? "linear-gradient(145deg, rgba(148,163,184,0.45), rgba(51,65,85,0.6))"
          : "linear-gradient(145deg, #fde9a8 0%, #b7791f 38%, #f5c451 68%, #6b4310 100%)",
        boxShadow: apagado ? "none" : "0 10px 28px -12px rgba(245,196,81,0.55), 0 2px 6px rgba(0,0,0,0.5)",
      }}
    >
      <span
        className="grid h-full w-full place-items-center"
        style={{
          borderRadius: t.radio - 1,
          background: "radial-gradient(130% 130% at 28% 18%, #2c1f0b 0%, #120d07 55%, #070503 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,236,179,0.18), inset 0 -8px 16px rgba(0,0,0,0.45)",
        }}
      >
        <IconoComp size={t.icono} strokeWidth={1.6} color={apagado ? "#94a3b8" : TRAZO_ORO} />
      </span>
    </span>
  )
}

/** Emblema + título como una sola pieza, unidos por una línea dorada. */
export function TituloEmblema({
  icono,
  titulo,
  etiqueta,
  descripcion,
  tamano = "lg",
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
  apagado?: boolean
  como?: "h1" | "h2" | "h3"
  claseTitulo?: string
  linea?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Emblema icono={icono} tamano={tamano} apagado={apagado} />
        <div className="min-w-0">
          {etiqueta && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-300/80">{etiqueta}</p>
          )}
          <Etiqueta className={`${claseTitulo} font-bold leading-tight tracking-tight text-white`}>{titulo}</Etiqueta>
        </div>
      </div>
      {linea && (
        <div className="mt-4 flex items-center gap-2" aria-hidden="true">
          <span className="h-1.5 w-1.5 rotate-45 bg-amber-300/90" />
          <span className="h-px flex-1 bg-gradient-to-r from-amber-300/70 via-amber-500/25 to-transparent" />
        </div>
      )}
      {descripcion && <p className="mt-3 text-sm leading-relaxed text-slate-400">{descripcion}</p>}
    </div>
  )
}
