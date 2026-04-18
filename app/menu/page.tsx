'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FeverLoader from '@/components/FeverLoader'

export default function MenuSelector() {
  const router = useRouter()

  const menuVersions = [
    {
      id: 1,
      nombre: 'Bold Grid',
      descripcion: 'Diseño directo estilo The Normal Club',
      ruta: '/menu-1',
      color: 'from-amber-500 to-yellow-600',
      icon: '🔥'
    },
    {
      id: 2,
      nombre: 'Premium Animated',
      descripcion: 'Animaciones avanzadas y efectos premium',
      ruta: '/menu-2',
      color: 'from-purple-500 to-pink-600',
      icon: '✨'
    },
    {
      id: 3,
      nombre: 'Minimal Elegant',
      descripcion: 'Diseño minimalista tipo Apple',
      ruta: '/menu-3',
      color: 'from-cyan-500 to-blue-600',
      icon: '💎'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo FEVER */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/fever-bg-3.png)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Contenido */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header con logo */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="loader-wrapper">
              <FeverLoader />
            </div>
            <Image
              src="/fever-logo.png"
              alt="FEVER"
              width={200}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[oklch(0.72_0.16_80)] mb-3 tracking-wider">
            SELECCIONA TU MENÚ
          </h1>
          <p className="text-[oklch(0.70_0.07_80)] text-sm md:text-base uppercase tracking-[0.3em]">
            The Golden Age
          </p>
        </div>

        {/* Grid de versiones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl w-full">
          {menuVersions.map((version, index) => (
            <button
              key={version.id}
              onClick={() => router.push(version.ruta)}
              className="menu-version-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradiente de fondo */}
              <div className={`absolute inset-0 bg-gradient-to-br ${version.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              
              {/* Contenido */}
              <div className="relative z-10 p-8 flex flex-col items-center text-center">
                {/* Icono */}
                <div className="text-6xl md:text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                  {version.icon}
                </div>

                {/* Nombre */}
                <h2 className="text-2xl md:text-3xl font-black text-[oklch(0.72_0.16_80)] mb-3 tracking-wider">
                  {version.nombre}
                </h2>

                {/* Descripción */}
                <p className="text-[oklch(0.70_0.07_80)] text-sm md:text-base mb-6">
                  {version.descripcion}
                </p>

                {/* Botón */}
                <div className="px-6 py-3 rounded-xl bg-[oklch(0.72_0.16_80)] text-black font-bold uppercase tracking-wider text-sm transform group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[oklch(0.72_0.16_80/0.5)]">
                  Ver Menú
                </div>
              </div>

              {/* Borde brillante */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[oklch(0.72_0.16_80/0.3)] group-hover:border-[oklch(0.72_0.16_80)] transition-all duration-500" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center mb-4">
            <div className="snake-pattern" />
          </div>
          <p className="text-[oklch(0.70_0.07_80)] text-xs uppercase tracking-widest">
            Fever Club · León, Gto · The Golden Age
          </p>
        </div>
      </div>

      {/* Estilos */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .loader-wrapper {
          display: inline-block;
        }

        .menu-version-card {
          position: relative;
          background: oklch(0.16 0.04 80 / 0.40);
          backdrop-filter: blur(30px) saturate(180%);
          -webkit-backdrop-filter: blur(30px) saturate(180%);
          border-radius: 1.5rem;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
          box-shadow: 
            0 10px 40px oklch(0 0 0 / 0.3),
            inset 0 1px 0 oklch(1 0 0 / 0.1);
        }

        .menu-version-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 
            0 20px 60px oklch(0 0 0 / 0.5),
            inset 0 1px 0 oklch(1 0 0 / 0.2);
        }

        .snake-pattern {
          width: 200px;
          height: 3px;
          background: repeating-linear-gradient(
            90deg,
            oklch(0.72 0.16 80) 0px,
            oklch(0.72 0.16 80) 10px,
            transparent 10px,
            transparent 15px,
            oklch(0.72 0.16 80) 15px,
            oklch(0.72 0.16 80) 20px,
            transparent 20px,
            transparent 30px
          );
          position: relative;
          animation: snake-glow 2s ease-in-out infinite;
        }

        .snake-pattern::before,
        .snake-pattern::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 3px;
          background: oklch(0.72 0.16 80);
          border-radius: 50%;
          top: 0;
        }

        .snake-pattern::before {
          left: -5px;
        }

        .snake-pattern::after {
          right: -5px;
        }

        @keyframes snake-glow {
          0%, 100% {
            opacity: 0.6;
            box-shadow: 0 0 10px oklch(0.72 0.16 80 / 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 20px oklch(0.72 0.16 80 / 0.6);
          }
        }
      `}</style>
    </div>
  )
}
