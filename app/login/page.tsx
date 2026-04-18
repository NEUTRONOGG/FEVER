"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const handleLoginPOS = () => {
    localStorage.setItem("userRole", "staff")
    localStorage.setItem("userName", "Staff")
    router.push("/dashboard/selector-rol")
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {/* Fondo negro con gradientes naranjas sutiles */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-16">
          {/* Logo más grande */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/fever-logo.png"
              alt="FEVER Logo"
              width={350}
              height={120}
              className="object-contain mx-auto"
              priority
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-400 uppercase tracking-[0.3em] font-light">THE GOLDEN AGE</p>
            <h1 className="text-4xl font-bold text-white tracking-tight">Selecciona tu perfil para continuar</h1>
          </div>
        </div>

        <div className="flex justify-center">
          {/* Card POS - Único acceso visible */}
          <Card className="w-full max-w-sm border-orange-500/20 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-2xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
            {/* Efecto shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="relative mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">POS</CardTitle>
              <CardDescription className="text-slate-400">
                Sistema operativo del restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 relative z-10">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-6" />
              <ul className="space-y-3 mb-8 text-sm text-slate-400">
                <li className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                  Hostess - Registro de clientes
                </li>
                <li className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                  Mesero - Toma de pedidos
                </li>
                <li className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                  Cadena - Control de acceso
                </li>
                <li className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                  RP - Gestión VIP
                </li>
                <li className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                  Selector de roles
                </li>
              </ul>
              <Button
                onClick={handleLoginPOS}
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-300 rounded-xl text-base"
              >
                Acceder al POS
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center space-y-4">
          <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <p className="text-sm text-slate-500">
            Sistema de gestión integral para restaurante FEVER
          </p>
        </div>
      </div>

    </div>
  )
}
