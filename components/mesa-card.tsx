"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, DollarSign } from "lucide-react"

type EstadoMesa = "disponible" | "ocupada" | "reservada" | "cuenta"

interface Mesa {
  id: number
  numero: string
  capacidad: number
  estado: EstadoMesa
  mesero?: string
  clientes?: number
  total?: number
  tiempoOcupada?: string
}

interface MesaCardProps {
  mesa: Mesa
  onClick: () => void
}

export function MesaCard({ mesa, onClick }: MesaCardProps) {
  const getEstadoColor = () => {
    switch (mesa.estado) {
      case "disponible":
        return "border-emerald-500 bg-emerald-500/10"
      case "ocupada":
        return "border-blue-500 bg-blue-500/10"
      case "reservada":
        return "border-amber-500 bg-amber-500/10"
      case "cuenta":
        return "border-purple-500 bg-purple-500/10"
      default:
        return "border-slate-700 bg-slate-900"
    }
  }

  return (
    <Card className={`cursor-pointer transition-all hover:scale-105 border-2 ${getEstadoColor()}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-50">Mesa {mesa.numero}</h3>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{mesa.capacidad}</span>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300 capitalize">{mesa.estado}</span>
            {mesa.estado !== "disponible" && mesa.clientes && (
              <span className="text-xs text-slate-400">
                {mesa.clientes} {mesa.clientes === 1 ? "persona" : "personas"}
              </span>
            )}
          </div>

          {/* Info adicional */}
          {mesa.estado === "ocupada" && (
            <div className="space-y-2 pt-2 border-t border-slate-700">
              {mesa.mesero && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Mesero:</span>
                  <span className="text-slate-300 font-medium">{mesa.mesero}</span>
                </div>
              )}
              {mesa.tiempoOcupada && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{mesa.tiempoOcupada}</span>
                </div>
              )}
              {mesa.total !== undefined && mesa.total > 0 && (
                <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                  <DollarSign className="w-3 h-3" />
                  <span>${mesa.total.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {mesa.estado === "cuenta" && mesa.total !== undefined && (
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total:</span>
                <span className="text-lg font-bold text-purple-500">${mesa.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
