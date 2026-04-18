'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Star } from 'lucide-react'
import Image from 'next/image'
import FeverLoader from '@/components/FeverLoader'
import MenuSwitcher from '@/components/MenuSwitcher'

const menuData = {
  tequila: [
    { nombre: 'Centenario plata', copa: 120, botella: 1890 },
    { nombre: 'Centenario ultra', copa: 120, botella: 1890 },
    { nombre: 'Centenario reposado', copa: 120, botella: 1890 },
    { nombre: '1800 cristalino', copa: 200, botella: 2990 },
    { nombre: 'Dobel diamante', copa: 240, botella: 2290 },
    { nombre: 'Dobel blanco', copa: 180, botella: 2140 },
    { nombre: 'Don julio 70', copa: 240, botella: 3170 },
    { nombre: 'Don julio reposado', copa: 200, botella: 2340 },
    { nombre: 'Don julio 1942', copa: null, botella: 7990, premium: true },
    { nombre: 'Herradora plata', copa: 150, botella: 2240 },
    { nombre: 'Herradura ultra', copa: 220, botella: 2965 },
    { nombre: 'Dobel diamante 1750ml', copa: null, botella: 5990, premium: true },
    { nombre: '1800 cristalino patona 1750ml', copa: null, botella: 5990, premium: true },
  ],
  vodka: [
    { nombre: 'Smirnoff', copa: 100, botella: 1490 },
    { nombre: 'Stolichnaya', copa: 120, botella: 1840 },
    { nombre: 'Smirnoff tamarindo', copa: 110, botella: 1490 },
    { nombre: 'Absolut', copa: 120, botella: 1690 },
    { nombre: 'Grey goose', copa: 190, botella: 2690, premium: true },
  ],
  mezcal: [
    { nombre: '400 conejos espadín', copa: 150, botella: 1940 },
    { nombre: 'Unión joven', copa: 149, botella: 1890 },
    { nombre: 'Monte lobos Tobala', copa: 180, botella: 2490 },
  ],
  ginebras: [
    { nombre: 'Tanqueray london', copa: 160, botella: 2240 },
    { nombre: 'Tanqueray ten', copa: 180, botella: 2590 },
    { nombre: 'Beefeder', copa: 150, botella: 2090 },
    { nombre: 'Bombay', copa: 150, botella: 1990 },
  ],
  ron: [
    { nombre: 'Bacardi blanco', copa: 100, botella: 1440 },
    { nombre: 'Matusalen platino', copa: 100, botella: 1390 },
    { nombre: 'Matusalen clásico', copa: 120, botella: 1550 },
    { nombre: 'Habana 7', copa: 120, botella: 1940 },
    { nombre: 'Bacardi blanco 1750ml', copa: null, botella: 2990 },
    { nombre: 'Zacapa 23', copa: 240, botella: 2290, premium: true },
  ],
  whisky: [
    { nombre: 'Red label', copa: 130, botella: 1990 },
    { nombre: 'Black label', copa: 190, botella: 2490 },
    { nombre: 'Buchanas 12', copa: 190, botella: 2290 },
    { nombre: 'Buchanas 18', copa: null, botella: 5990, premium: true },
  ],
  brandy: [{ nombre: 'Torres X', copa: 130, botella: 1990 }],
  cognac: [{ nombre: 'Martell vsop', copa: 210, botella: 3140, premium: true }],
  champagne: [
    { nombre: 'Moet brut', copa: null, botella: 3990, premium: true },
    { nombre: 'Moet ice', copa: null, botella: 4790, premium: true },
    { nombre: 'Don persignó lumínus', copa: null, botella: 22290, premium: true },
  ],
  shots: [
    { nombre: 'Perla negra 230', precio: 230 },
    { nombre: 'Bufanda azul 230', precio: 230 },
    { nombre: 'Revolver 350', precio: 350 },
    { nombre: 'Turbina 280', precio: 280 },
  ],
  cocteleria: [
    { nombre: 'Negroni', precio: 180 },
    { nombre: 'Margarita', precio: 180 },
    { nombre: 'Mojito', precio: 180 },
    { nombre: 'Fernanditos', precio: 180 },
    { nombre: 'Hanky panky', precio: 180 },
    { nombre: 'St-germain sprit', precio: 180 },
    { nombre: 'Aperol sprit', precio: 180 },
    { nombre: 'Limonchelo sprit', precio: 180 },
    { nombre: 'Campari sprit', precio: 180 },
    { nombre: 'Moskow mule', precio: 180 },
  ],
  cerveza: [
    { nombre: 'XX', precio: 80 },
    { nombre: 'XX lager', precio: 80 },
    { nombre: 'Ultra', precio: 80 },
    { nombre: 'Bohemia cristal', precio: 80 },
    { nombre: 'Heinekel', precio: 80 },
  ],
  mixologia: [
    { nombre: 'Moon Milk', ingredientes: 'Ron, Aceite de coco, Esencia de vainilla', precio: 180 },
    { nombre: 'Apple balkan', ingredientes: 'Whisky, Miel de maple, Manzana', precio: 180 },
    { nombre: 'Xococol', ingredientes: 'Ginebra, Xoconostle, Leche de almendras, Agua de coco', precio: 180 },
    { nombre: 'Agave soul', ingredientes: 'Mezcal, Bitter cacao, Piloncillo, Contreau', precio: 180 },
    { nombre: 'Harry night', ingredientes: 'Cognac, Cerveza artesanal, Limón', precio: 180 },
    { nombre: 'Mezcal mírage', ingredientes: 'Mezcal, Campari, Toronja, Carbón activado', precio: 180 },
    { nombre: 'Berry ron', ingredientes: 'Bourbon, Frutos rojos, Limón', precio: 180 },
    { nombre: 'Sunrise', ingredientes: 'Ron añejo, Café, Limón, Piloncillo', precio: 180 },
    { nombre: 'Café quina', ingredientes: 'Ginebra, Café, Jengibre, Tónica', precio: 180 },
  ],
}

const categorias = [
  { id: 'tequila', nombre: 'TEQUILA', color: 'gold' },
  { id: 'ron', nombre: 'RON', color: 'black' },
  { id: 'vodka', nombre: 'VODKA', color: 'gold' },
  { id: 'whisky', nombre: 'WHISKY', color: 'black' },
  { id: 'cognac', nombre: 'COGNAC', color: 'gold' },
  { id: 'brandy', nombre: 'BRANDY', color: 'black' },
  { id: 'champagne', nombre: 'CHAMPAGNE', color: 'gold' },
  { id: 'mezcal', nombre: 'MEZCAL', color: 'black' },
  { id: 'cocteleria', nombre: 'COCTELES', color: 'gold' },
  { id: 'ginebras', nombre: 'GINEBRA', color: 'black' },
  { id: 'cerveza', nombre: 'CERVEZA', color: 'gold' },
  { id: 'mixologia', nombre: 'MIXOLOGÍA', color: 'black' },
  { id: 'shots', nombre: 'SHOTS', color: 'gold' },
]

export default function Menu2() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return `$${price.toLocaleString('es-MX')}`
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo FEVER con efecto glitch */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/fever-bg-3.png)',
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Efecto de cursor */}
        <div 
          className="pointer-events-none fixed w-96 h-96 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{
            background: 'radial-gradient(circle, oklch(0.72 0.16 80 / 0.25) 0%, transparent 70%)',
            left: mousePos.x - 192,
            top: mousePos.y - 192,
          }}
        />
      </div>

      {/* Vista de categorías */}
      {!selectedCategory && (
        <div className="min-h-screen flex flex-col relative z-10">
          {/* Header creativo con loader */}
          <header className="p-6 md:p-8 border-b border-[oklch(0.72_0.16_80/0.2)] glass-header">
            <div className="flex flex-col items-center gap-6">
              {/* Container moderno con logo y loader */}
              <div className="header-container">
                <div className="loader-wrapper">
                  <FeverLoader />
                </div>
                <div className="logo-box">
                  <Image
                    src="/fever-logo.png"
                    alt="FEVER"
                    width={180}
                    height={72}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              {/* Subtítulo */}
              <div className="text-center">
                <p className="text-[oklch(0.72_0.16_80)] text-xs md:text-sm uppercase tracking-[0.3em] font-light">
                  The Golden Age
                </p>
                <p className="text-[oklch(0.70_0.07_80)] text-[10px] uppercase tracking-[0.5em] mt-2">
                  Premium Drinks Menu
                </p>
              </div>
            </div>
          </header>

          {/* Grid de categorías */}
          <main className="flex-1 p-4 md:p-8">
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto">
              {categorias.map((categoria, index) => (
                <button
                  key={categoria.id}
                  onClick={() => setSelectedCategory(categoria.id)}
                  className={`
                    category-card
                    ${categoria.color === 'gold' ? 'bg-gold' : 'bg-black'}
                    aspect-[2/1] rounded-2xl overflow-hidden relative
                    transform transition-all duration-500
                    hover:scale-105 hover:rotate-1
                    active:scale-95
                  `}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="shine-effect" />
                  <div className="h-full flex items-center justify-center p-4 relative z-10">
                    <span className={`
                      text-2xl md:text-4xl font-black tracking-wider
                      ${categoria.color === 'gold' ? 'text-black' : 'text-[oklch(0.72_0.16_80)]'}
                    `}>
                      {categoria.nombre}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </main>

          <footer className="border-t border-[oklch(0.72_0.16_80/0.3)] glass-footer">
            <div className="container mx-auto px-4 py-8">
              {/* Botón cambiar menú */}
              <div className="flex justify-center mb-6">
                <MenuSwitcher />
              </div>

              {/* Patrón serpiente estilo The Normal */}
              <div className="flex items-center justify-center mb-6">
                <div className="snake-pattern" />
              </div>
              
              {/* Disclaimer */}
              <div className="text-center space-y-2">
                <p className="text-[oklch(0.70_0.07_80)] text-xs uppercase tracking-widest">
                  Los precios están sujetos a cambio sin previo aviso
                </p>
                <p className="text-[oklch(0.70_0.07_80)] text-xs">
                  Consumo responsable · Prohibida la venta a menores de edad
                </p>
                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[oklch(0.70_0.07_80)] uppercase tracking-wider">
                  <span>Fever Club</span>
                  <span>·</span>
                  <span>León, Gto</span>
                  <span>·</span>
                  <span>The Golden Age</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Vista de productos */}
      {selectedCategory && (
        <div className="min-h-screen relative z-10">
          <header className="sticky top-0 z-50 glass-header-strong border-b border-[oklch(0.72_0.16_80/0.3)]">
            <div className="p-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-[oklch(0.72_0.16_80)]" />
                <span className="font-bold text-[oklch(0.72_0.16_80)] hidden md:inline">VOLVER</span>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-black text-[oklch(0.72_0.16_80)]">
                  {categorias.find(c => c.id === selectedCategory)?.nombre}
                </h2>
              </div>
              <div className="w-16 md:w-24" />
            </div>
          </header>

          <main className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {menuData[selectedCategory as keyof typeof menuData]?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="product-card glass-strong rounded-2xl p-4 md:p-6 relative overflow-hidden group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {item.premium && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[oklch(0.72_0.16_80)] premium-badge">
                        <Star className="w-3 h-3 fill-current text-black" />
                        <span className="text-xs font-black text-black">PREMIUM</span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-[oklch(0.72_0.16_80)] transition-colors">
                      {item.nombre}
                    </h3>
                    {item.ingredientes && (
                      <p className="text-xs md:text-sm text-[oklch(0.70_0.07_80)] mb-4 italic">
                        {item.ingredientes}
                      </p>
                    )}
                    <div className="h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.16_80/0.5)] to-transparent mb-4" />
                    <div className="flex items-center justify-between gap-4">
                      {item.copa !== undefined && (
                        <div className="flex-1">
                          <div className="text-xs text-[oklch(0.70_0.07_80)] mb-1">Copa 45ml</div>
                          <div className="text-2xl font-black text-[oklch(0.72_0.16_80)] group-hover:scale-110 transition-transform origin-left">
                            {formatPrice(item.copa)}
                          </div>
                        </div>
                      )}
                      {item.botella !== undefined && (
                        <div className="flex-1">
                          <div className="text-xs text-[oklch(0.70_0.07_80)] mb-1">Botella</div>
                          <div className="text-2xl font-black text-[oklch(0.72_0.16_80)] group-hover:scale-110 transition-transform origin-left">
                            {formatPrice(item.botella)}
                          </div>
                        </div>
                      )}
                      {item.precio !== undefined && (
                        <div className="text-3xl font-black text-[oklch(0.72_0.16_80)] group-hover:scale-110 transition-transform">
                          {formatPrice(item.precio)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      <style jsx>{`
        /* Header Container Moderno */
        .header-container {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1.5rem 2.5rem;
          background: oklch(0.16 0.04 80 / 0.50);
          backdrop-filter: blur(30px) saturate(180%);
          border-radius: 2rem;
          border: 1px solid oklch(0.72 0.16 80 / 0.3);
          box-shadow: 
            0 10px 40px oklch(0 0 0 / 0.3),
            inset 0 1px 0 oklch(1 0 0 / 0.1),
            0 0 0 1px oklch(0.72 0.16 80 / 0.15);
          position: relative;
          overflow: hidden;
          animation: headerFloat 6s ease-in-out infinite;
        }

        .header-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            oklch(0.72 0.16 80 / 0.1) 0%,
            transparent 50%,
            oklch(0.78 0.20 80 / 0.1) 100%
          );
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes headerFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .loader-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          position: relative;
          z-index: 1;
        }

        .logo-box {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 15px oklch(0.72 0.16 80 / 0.4));
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
          }
        }

        .liquid-orb-1, .liquid-orb-2, .liquid-orb-3 {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
        }

        .liquid-orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, oklch(0.72 0.16 80 / 0.4) 0%, transparent 70%);
          top: 10%;
          left: 10%;
          animation: float-orb 20s ease-in-out infinite;
        }

        .liquid-orb-2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, oklch(0.78 0.20 80 / 0.3) 0%, transparent 70%);
          bottom: 10%;
          right: 10%;
          animation: float-orb 25s ease-in-out infinite 5s;
        }

        .liquid-orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, oklch(0.72 0.16 80 / 0.35) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation: float-orb 18s ease-in-out infinite 10s;
        }

        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -50px) scale(1.1); }
          50% { transform: translate(-30px, 30px) scale(0.9); }
          75% { transform: translate(40px, 40px) scale(1.05); }
        }

        .glass-header {
          background: oklch(0.16 0.04 80 / 0.60);
          backdrop-filter: blur(30px) saturate(180%);
        }

        .glass-header-strong {
          background: oklch(0.16 0.04 80 / 0.80);
          backdrop-filter: blur(40px) saturate(200%);
          box-shadow: 0 8px 32px oklch(0 0 0 / 0.3);
        }

        .glass-footer {
          background: oklch(0.16 0.04 80 / 0.50);
          backdrop-filter: blur(25px) saturate(160%);
        }

        .glass-button {
          background: oklch(0.72 0.16 80 / 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid oklch(0.72 0.16 80 / 0.3);
        }

        .category-card {
          animation: slideInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        @keyframes slideInScale {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .bg-gold {
          background: oklch(0.72 0.16 80 / 0.25);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 2px solid oklch(0.72 0.16 80 / 0.6);
          box-shadow: 
            0 10px 40px oklch(0.72 0.16 80 / 0.3),
            inset 0 1px 0 oklch(1 0 0 / 0.2);
        }

        .bg-black {
          background: oklch(0.12 0.04 80 / 0.25);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 2px solid oklch(0.72 0.16 80 / 0.6);
          box-shadow: 
            0 10px 40px oklch(0 0 0 / 0.5),
            inset 0 1px 0 oklch(0.72 0.16 80 / 0.2);
        }

        .shine-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, oklch(1 0 0 / 0.3) 50%, transparent 100%);
          transform: translateX(-100%);
          opacity: 0;
        }

        .category-card:hover .shine-effect {
          animation: shine 1s ease-in-out;
          opacity: 1;
        }

        @keyframes shine {
          to { transform: translateX(100%); }
        }

        /* Patrón serpiente estilo The Normal */
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

        .product-card {
          animation: slideInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px oklch(0 0 0 / 0.5);
        }

        .premium-badge {
          animation: pulse-badge 2s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
