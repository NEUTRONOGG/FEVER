"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Gift, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"

interface EncuestaSatisfaccionProps {
  open: boolean
  onClose: () => void
  mesaNumero: string
  mesero: string
  onComplete: (respuestas: any) => void
}

const preguntas = [
  {
    id: 1,
    pregunta: "¿Cómo calificarías la atención del mesero?",
    tipo: "estrellas",
    icon: Star,
  },
  {
    id: 2,
    pregunta: "¿La comida cumplió tus expectativas?",
    tipo: "emoji",
    icon: Smile,
  },
  {
    id: 3,
    pregunta: "¿El tiempo de espera fue adecuado?",
    tipo: "pulgar",
    icon: ThumbsUp,
  },
  {
    id: 4,
    pregunta: "¿El ambiente del lugar te gustó?",
    tipo: "estrellas",
    icon: Sparkles,
  },
  {
    id: 5,
    pregunta: "¿La relación calidad-precio es buena?",
    tipo: "emoji",
    icon: Smile,
  },
  {
    id: 6,
    pregunta: "¿Recomendarías este lugar?",
    tipo: "pulgar",
    icon: ThumbsUp,
  },
  {
    id: 7,
    pregunta: "¿Volverías a visitarnos?",
    tipo: "emoji",
    icon: Smile,
  },
]

export function EncuestaSatisfaccion({ open, onClose, mesaNumero, mesero, onComplete }: EncuestaSatisfaccionProps) {
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState<any>({})
  const [mostrarRecompensa, setMostrarRecompensa] = useState(false)

  const preguntaActual = preguntas[paso]
  const progreso = ((paso + 1) / preguntas.length) * 100

  const handleRespuesta = (valor: number) => {
    const nuevasRespuestas = {
      ...respuestas,
      [preguntaActual.id]: {
        pregunta: preguntaActual.pregunta,
        valor,
        tipo: preguntaActual.tipo,
      },
    }
    setRespuestas(nuevasRespuestas)

    // Avanzar a la siguiente pregunta
    if (paso < preguntas.length - 1) {
      setTimeout(() => setPaso(paso + 1), 300)
    } else {
      // Última pregunta - mostrar recompensa
      setTimeout(() => {
        setMostrarRecompensa(true)
        lanzarConfetti()
      }, 300)
    }
  }

  const lanzarConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#eab308', '#fbbf24'],
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#eab308', '#fbbf24'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const handleFinalizar = () => {
    const encuestaCompleta = {
      mesaNumero,
      mesero,
      fecha: new Date().toISOString(),
      respuestas,
      promedioGeneral: calcularPromedio(),
      recompensaOtorgada: true,
    }
    onComplete(encuestaCompleta)
    onClose()
    resetear()
  }

  const calcularPromedio = () => {
    const valores = Object.values(respuestas).map((r: any) => r.valor)
    return valores.reduce((a: number, b: number) => a + b, 0) / valores.length
  }

  const resetear = () => {
    setPaso(0)
    setRespuestas({})
    setMostrarRecompensa(false)
  }

  const renderOpciones = () => {
    switch (preguntaActual.tipo) {
      case "estrellas":
        return (
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleRespuesta(num)}
                className="group transition-all duration-300 hover:scale-125"
              >
                <Star
                  className={`w-12 h-12 transition-all duration-300 ${
                    respuestas[preguntaActual.id]?.valor >= num
                      ? "fill-amber-500 text-amber-500"
                      : "text-slate-600 group-hover:text-amber-400"
                  }`}
                />
              </button>
            ))}
          </div>
        )

      case "emoji":
        return (
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleRespuesta(1)}
              className="group transition-all duration-300 hover:scale-125"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <Frown className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Mal</p>
            </button>
            <button
              onClick={() => handleRespuesta(3)}
              className="group transition-all duration-300 hover:scale-125"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-all">
                <Meh className="w-12 h-12 text-amber-500" />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Regular</p>
            </button>
            <button
              onClick={() => handleRespuesta(5)}
              className="group transition-all duration-300 hover:scale-125"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
                <Smile className="w-12 h-12 text-emerald-500" />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Excelente</p>
            </button>
          </div>
        )

      case "pulgar":
        return (
          <div className="flex justify-center gap-8">
            <button
              onClick={() => handleRespuesta(1)}
              className="group transition-all duration-300 hover:scale-125"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <ThumbsDown className="w-14 h-14 text-red-500" />
              </div>
              <p className="text-sm text-slate-400 mt-3 text-center">No</p>
            </button>
            <button
              onClick={() => handleRespuesta(5)}
              className="group transition-all duration-300 hover:scale-125"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
                <ThumbsUp className="w-14 h-14 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-400 mt-3 text-center">Sí</p>
            </button>
          </div>
        )
    }
  }

  if (mostrarRecompensa) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 border-amber-500/30 text-slate-50 max-w-md">
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-bounce">
              <Gift className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-amber-500 mb-2">¡Gracias por tu opinión!</h2>
              <p className="text-slate-300 text-lg">Tu feedback es muy valioso para nosotros</p>
            </div>

            <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-amber-500">¡RECOMPENSA!</h3>
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">5 SHOTS GRATIS</p>
              <p className="text-sm text-slate-300">Válido en tu próxima visita</p>
            </Card>

            <div className="space-y-2">
              <p className="text-sm text-slate-400">Tu calificación promedio:</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    className={`w-8 h-8 ${
                      num <= Math.round(calcularPromedio())
                        ? "fill-amber-500 text-amber-500"
                        : "text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-amber-500">{calcularPromedio().toFixed(1)} / 5.0</p>
            </div>

            <Button
              onClick={handleFinalizar}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 text-lg"
            >
              ¡Genial! Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Encuesta de Satisfacción</DialogTitle>
          <p className="text-slate-400 text-center">Mesa {mesaNumero} • {mesero}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Barra de Progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Pregunta {paso + 1} de {preguntas.length}</span>
              <span>{Math.round(progreso)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <preguntaActual.icon className="w-8 h-8 text-amber-500" />
              </div>
              
              <h3 className="text-2xl font-semibold text-slate-100">
                {preguntaActual.pregunta}
              </h3>

              <div className="pt-4">
                {renderOpciones()}
              </div>
            </div>
          </Card>

          {/* Recompensa Info */}
          <div className="flex items-center justify-center gap-2 text-sm text-amber-500">
            <Gift className="w-4 h-4" />
            <span>Completa la encuesta y gana 5 shots gratis</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
