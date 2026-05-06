"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LayoutDashboard, UtensilsCrossed, Users, BarChart3, QrCode, LogOut, Menu, X, Sparkles, Receipt, Gift, TrendingUp, UserCog, Calendar, History, ShoppingCart, Award, DollarSign, ShoppingBag } from "lucide-react"
import EmergencyNotification from "@/components/EmergencyNotification"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Detectar si es una ruta POS (sin sidebar)
  const isPOSRoute = pathname?.includes('/selector-rol') || 
                     pathname?.includes('/hostess') || 
                     pathname?.includes('/mesero') || 
                     pathname?.includes('/cadena') || 
                     pathname?.includes('/rp-login') ||
                     pathname?.includes('/rp')

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    // No redirigir si estamos en selector-rol o rp-login
    if (!role && !pathname?.includes('/selector-rol') && !pathname?.includes('/rp-login')) {
      router.push("/login")
    } else {
      setUserRole(role || "")
      setUserName(name || "Usuario")
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    router.push("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Reservaciones", href: "/dashboard/reservaciones", icon: Calendar },
    { name: "Reservaciones RPs", href: "/dashboard/reservaciones-rps", icon: Calendar },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Mesas", href: "/dashboard/mesas-clientes", icon: UtensilsCrossed },
    { name: "Monitor Pedidos", href: "/dashboard/monitor-pedidos", icon: ShoppingCart },
    { name: "Historial Consumos", href: "/dashboard/historial-consumos", icon: History },
    { name: "POS", href: "/dashboard/pos", icon: Receipt },
    { name: "Métricas RPs", href: "/dashboard/rp-metricas", icon: Award },
    { name: "Bonos RPs", href: "/dashboard/bonos", icon: DollarSign },
    { name: "Rendimiento RPs", href: "/dashboard/admin/rendimiento-rps", icon: TrendingUp },
    { name: "Estadísticas", href: "/dashboard/estadisticas", icon: TrendingUp },
    { name: "Reportes", href: "/dashboard/reportes-clientes", icon: BarChart3 },
    { name: "Rewards", href: "/dashboard/rewards", icon: Gift },
    { name: "FeverShop", href: "/dashboard/fevershop", icon: ShoppingBag },
    { name: "Gestión RPs", href: "/dashboard/gestion-rp", icon: UserCog },
  ]

  // Si es ruta POS, mostrar sin sidebar
  if (isPOSRoute) {
    return (
      <div className="min-h-screen bg-background">
        <main className="p-6">{children}</main>
      </div>
    )
  }

  // Layout normal con sidebar para Admin
  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed top-4 left-4 z-50 h-[calc(100vh-2rem)] w-72
        rounded-3xl shadow-2xl
        transform transition-all duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
        style={{
          background: `
            radial-gradient(ellipse 150% 100% at 50% 0%, 
              oklch(0.60 0.13 80 / 0.25), 
              oklch(0.50 0.10 78 / 0.15) 30%, 
              transparent 70%),
            radial-gradient(ellipse 120% 80% at 20% 100%, 
              oklch(0.58 0.12 82 / 0.20), 
              oklch(0.48 0.09 80 / 0.12) 35%, 
              transparent 75%),
            linear-gradient(135deg, 
              oklch(0.18 0.04 80 / 0.85) 0%, 
              oklch(0.15 0.03 78 / 0.80) 50%,
              oklch(0.12 0.02 82 / 0.85) 100%)
          `,
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid oklch(0.25 0.08 80 / 0.3)',
          boxShadow: `
            0 20px 60px oklch(0 0 0 / 0.5),
            inset 0 1px 0 oklch(1 0 0 / 0.1),
            0 0 0 1px oklch(0.72 0.16 80 / 0.15),
            0 10px 40px oklch(0.72 0.16 80 / 0.15)
          `
        }}
      >
        <div className="flex flex-col h-full">
          <div className="relative flex items-center gap-3 p-6 border-b backdrop-blur-xl"
            style={{
              borderColor: 'oklch(0.30 0.09 80 / 0.25)',
              background: 'linear-gradient(180deg, oklch(0.20 0.06 80 / 0.15) 0%, transparent 100%)'
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <Image
                src="/images/fever-logo.png"
                alt="FEVER Logo"
                width={220}
                height={73}
                className="object-contain"
                priority
              />
              <p className="text-[11px] uppercase tracking-[0.3em] font-light mt-3 text-center"
                style={{ color: 'oklch(0.70 0.14 80)' }}
              >The Golden Age</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground glass-hover rounded-xl"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav 
            className="flex-1 p-4 space-y-2 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 transparent'
            }}
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
                    ${
                      isActive
                        ? "text-amber-400 border shadow-lg"
                        : "text-slate-300 hover:text-slate-50 border border-transparent"
                    }
                  `}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, oklch(0.65 0.14 80 / 0.25) 0%, oklch(0.60 0.12 78 / 0.20) 100%)',
                    borderColor: 'oklch(0.72 0.16 80 / 0.35)',
                    boxShadow: '0 8px 24px oklch(0.72 0.16 80 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.1)'
                  } : {
                    background: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'oklch(0.15 0.03 80 / 0.5)'
                      e.currentTarget.style.borderColor = 'oklch(0.30 0.07 80 / 0.25)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span className="font-medium text-[15px]">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t backdrop-blur-xl"
            style={{
              borderColor: 'oklch(0.30 0.09 80 / 0.25)',
              background: 'linear-gradient(0deg, oklch(0.20 0.06 80 / 0.15) 0%, transparent 100%)'
            }}
          >
            <div className="rounded-2xl px-3 py-2.5"
              style={{
                background: 'oklch(0.16 0.04 80 / 0.65)',
                backdropFilter: 'blur(32px) saturate(200%)',
                border: '1px solid oklch(0.30 0.09 80 / 0.25)',
                boxShadow: `
                  0 8px 32px oklch(0 0 0 / 0.35),
                  inset 0 1px 0 oklch(1 0 0 / 0.08),
                  0 0 0 1px oklch(0.72 0.16 80 / 0.08),
                  0 4px 16px oklch(0.72 0.16 80 / 0.05)
                `
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 flex items-center justify-center shadow-lg"
                  style={{
                    boxShadow: '0 4px 16px oklch(0.72 0.16 80 / 0.4)'
                  }}
                >
                  <span className="text-sm font-bold text-slate-900">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-50 block truncate">{userName}</span>
                  <span className="text-xs capitalize font-medium"
                    style={{ color: 'oklch(0.72 0.16 80)' }}
                  >{userRole}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 rounded-xl"
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 glass-strong border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground glass-hover rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <Image
            src="/images/fever-logo.png"
            alt="FEVER"
            width={130}
            height={45}
            className="object-contain"
            priority
          />
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>

      {/* Notificación de Emergencia Global */}
      <EmergencyNotification />
    </div>
  )
}
