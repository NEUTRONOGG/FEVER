'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function MenuSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuVersions = [
    { id: 1, nombre: 'Bold Grid', ruta: '/menu-1', icon: '🔥' },
    { id: 2, nombre: 'Premium Animated', ruta: '/menu-2', icon: '✨' },
    { id: 3, nombre: 'Minimal Elegant', ruta: '/menu-3', icon: '💎' }
  ]

  const currentMenu = menuVersions.find(m => m.ruta === pathname)

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="menu-switcher-btn"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden md:inline">Cambiar Menú</span>
        <span className="md:hidden">Menú</span>
        {currentMenu && <span className="ml-2">{currentMenu.icon}</span>}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="menu-switcher-dropdown">
            {menuVersions.map((version) => (
              <button
                key={version.id}
                onClick={() => {
                  router.push(version.ruta)
                  setIsOpen(false)
                }}
                className={`menu-switcher-option ${pathname === version.ruta ? 'active' : ''}`}
              >
                <span className="text-2xl">{version.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm">{version.nombre}</div>
                  <div className="text-xs text-[oklch(0.70_0.07_80)]">
                    {version.id === 1 && 'Diseño directo'}
                    {version.id === 2 && 'Animaciones premium'}
                    {version.id === 3 && 'Estilo minimalista'}
                  </div>
                </div>
                {pathname === version.ruta && (
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.72_0.16_80)] animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .menu-switcher-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: oklch(0.72 0.16 80 / 0.2);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid oklch(0.72 0.16 80 / 0.5);
          border-radius: 1rem;
          color: oklch(0.72 0.16 80);
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 20px oklch(0 0 0 / 0.3),
            inset 0 1px 0 oklch(1 0 0 / 0.1);
        }

        .menu-switcher-btn:hover {
          background: oklch(0.72 0.16 80 / 0.3);
          border-color: oklch(0.72 0.16 80 / 0.8);
          transform: translateY(-2px);
          box-shadow: 
            0 6px 30px oklch(0.72 0.16 80 / 0.4),
            inset 0 1px 0 oklch(1 0 0 / 0.2);
        }

        .menu-switcher-btn:active {
          transform: translateY(0);
        }

        .menu-switcher-dropdown {
          position: absolute;
          bottom: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          background: oklch(0.16 0.04 80 / 0.95);
          backdrop-filter: blur(30px) saturate(200%);
          -webkit-backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid oklch(0.72 0.16 80 / 0.3);
          border-radius: 1rem;
          padding: 0.5rem;
          z-index: 50;
          box-shadow: 
            0 20px 60px oklch(0 0 0 / 0.5),
            inset 0 1px 0 oklch(1 0 0 / 0.1);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .menu-switcher-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 0.75rem;
          color: oklch(0.90 0.05 80);
          transition: all 0.2s ease;
          text-align: left;
        }

        .menu-switcher-option:hover {
          background: oklch(0.72 0.16 80 / 0.15);
          border-color: oklch(0.72 0.16 80 / 0.3);
        }

        .menu-switcher-option.active {
          background: oklch(0.72 0.16 80 / 0.2);
          border-color: oklch(0.72 0.16 80 / 0.5);
        }

        @media (max-width: 768px) {
          .menu-switcher-dropdown {
            width: 260px;
          }
        }
      `}</style>
    </div>
  )
}
