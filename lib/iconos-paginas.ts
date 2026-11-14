// Ícono de cada pantalla: el mismo en el menú lateral y en el título de la página.
import {
  Armchair, Award, BadgeDollarSign, Boxes, CalendarCheck, CalendarDays, ChartNoAxesCombined, ChartPie,
  ClipboardList, ConciergeBell, CreditCard, Crown, FileChartColumn, Gift, HandPlatter, Handshake, History,
  KeyRound, LayoutDashboard, LayoutGrid, QrCode, Receipt, ShoppingBag, TrendingUp, UserCog, Users, Wallet,
} from "lucide-react"
import { CuerdaVip, type Icono } from "@/components/iconos-fever"

export const ICONOS_PAGINA = {
  dashboard: LayoutDashboard,
  reservaciones: CalendarDays,
  reservacionesRps: CalendarCheck,
  clientes: Users,
  mesas: Armchair,
  monitorPedidos: ClipboardList,
  historialConsumos: History,
  pos: CreditCard,
  metricasRps: Award,
  bonosRps: BadgeDollarSign,
  rendimientoRps: TrendingUp,
  abreviaturasRps: KeyRound,
  estadisticas: ChartNoAxesCombined,
  reportes: FileChartColumn,
  reportesAnalytics: ChartPie,
  rewards: Gift,
  fevershop: ShoppingBag,
  gestionRps: UserCog,
  gestionMeseros: HandPlatter,
  inventario: Boxes,
  menuQr: QrCode,
  mesasConsumo: Receipt,
  mesasPlano: LayoutGrid,
  ventas: Wallet,
  socios: Handshake,
  hostess: ConciergeBell,
  mesero: HandPlatter,
  cadena: CuerdaVip,
  rp: Crown,
} satisfies Record<string, Icono>
