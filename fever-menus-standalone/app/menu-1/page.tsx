'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const menuData = {
  tequila: [
    { nombre: 'Centenario Plata', ml: '700ml', copa: 120, botella: 1890 },
    { nombre: 'Centenario Ultra Cristalino', ml: '695ml', copa: 120, botella: 2090 },
    { nombre: 'Centenario Reposado', ml: '700ml', copa: 120, botella: 1890 },
    { nombre: '1800 Cristalino', ml: '700ml', copa: 200, botella: 2990 },
    { nombre: '1800 Cristalino', ml: '1750ml', copa: null, botella: 5990 },
    { nombre: 'Maestro Dobel Diamante', ml: '700ml', copa: 240, botella: 2890 },
    { nombre: 'Maestro Dobel Diamante', ml: '1750ml', copa: null, botella: 5990 },
    { nombre: 'Maestro Dobel Diamante', ml: '3000ml', copa: null, botella: 9990 },
    { nombre: 'Maestro Tequilero Blanco', ml: '700ml', copa: 180, botella: 2140 },
    { nombre: 'Don Julio 70', ml: '700ml', copa: 240, botella: 3170 },
    { nombre: 'Don Julio Reposado', ml: '700ml', copa: 200, botella: 2340 },
    { nombre: 'Don Julio 1942', ml: '750ml', copa: null, botella: 7990 },
    { nombre: 'Herradura Plata', ml: '700ml', copa: 150, botella: 2240 },
    { nombre: 'Herradura Ultra Añejo', ml: '700ml', copa: 220, botella: 2965 },
  ],
  vodka: [
    { nombre: 'Smirnoff Proff', ml: '750ml', copa: 100, botella: 1490 },
    { nombre: 'Stolichnaya', ml: '750ml', copa: 120, botella: 1840 },
    { nombre: 'Smirnoff Tamarindo', ml: '750ml', copa: 110, botella: 1490 },
    { nombre: 'Absolut Azul', ml: '750ml', copa: 120, botella: 1690 },
    { nombre: 'Grey Goose', ml: '700ml', copa: 190, botella: 2690 },
  ],
  mezcal: [
    { nombre: '400 Conejos Espadín', ml: '700ml', copa: 150, botella: 1940 },
    { nombre: 'Unión El Joven', ml: '700ml', copa: 149, botella: 1890 },
  ],
  ginebra: [
    { nombre: 'Tanqueray London', ml: '750ml', copa: 160, botella: 2240 },
    { nombre: 'Tanqueray No Ten', ml: '700ml', copa: 180, botella: 2590 },
    { nombre: 'Bombay Sapphire', ml: '700ml', copa: 150, botella: 1990 },
  ],
  ron: [
    { nombre: 'Bacardí Blanco', ml: '700ml', copa: 100, botella: 1440 },
    { nombre: 'Bacardí Blanco', ml: '1750ml', copa: null, botella: 2990 },
    { nombre: 'Matusalem Platino', ml: '750ml', copa: 100, botella: 1390 },
    { nombre: 'Matusalem Clásico', ml: '750ml', copa: 120, botella: 1550 },
    { nombre: 'Zacapa 23 Años', ml: '750ml', copa: 240, botella: 2990 },
  ],
  whisky: [
    { nombre: 'Johnnie Walker Red Label', ml: '700ml', copa: 130, botella: 1990 },
    { nombre: 'Johnnie Walker Black Label', ml: '750ml', copa: 190, botella: 2490 },
    { nombre: "Buchanan's 12 Años", ml: '750ml', copa: 190, botella: 2990 },
    { nombre: "Buchanan's 18 Años", ml: '750ml', copa: null, botella: 5990 },
  ],
  brandy: [
    { nombre: 'Torres 10', ml: '700ml', copa: 130, botella: 1990 },
  ],
  cognac: [
    { nombre: 'Martell VSOP', ml: '700ml', copa: 210, botella: 3140 },
  ],
  champagne: [
    { nombre: 'Moët Chandon Brut', ml: '750ml', copa: null, botella: 3990 },
    { nombre: 'Moët Ice Imperial', ml: '750ml', copa: null, botella: 4790 },
  ],
  otros: [
    { nombre: 'Agua Ciel', ml: '600ml', precio: 55 },
    { nombre: 'Peñafiel Lata', ml: '355ml', precio: 55 },
    { nombre: 'Schweppes Lata', ml: '355ml', precio: 55 },
    { nombre: 'Squirt Lata', ml: '355ml', precio: 55 },
    { nombre: 'Coca Cola Lata', ml: '355ml', precio: 55 },
    { nombre: 'Coca Cola Zero', ml: '355ml', precio: 55 },
    { nombre: 'Sprite Lata', ml: '355ml', precio: 55 },
    { nombre: 'Sidral Lata', ml: '355ml', precio: 55 },
    { nombre: 'Jarra de Jugo', precio: 150 },
    { nombre: 'Naranjada', ml: '325ml', precio: 50 },
    { nombre: 'Limonada', ml: '325ml', precio: 50 },
    { nombre: 'Vaso de Jugo', ml: '236ml', precio: 50 },
  ],
  cerveza: [
    { nombre: 'Modelo Especial', ml: '355ml', precio: 80 },
    { nombre: 'Corona Extra', ml: '355ml', precio: 80 },
    { nombre: 'Victoria Media', ml: '355ml', precio: 80 },
    { nombre: 'Stella Artois', ml: '330ml', precio: 80 },
    { nombre: 'Michelob Ultra', ml: '355ml', precio: 80 },
  ],
  energizantes: [
    { nombre: 'Red Bull', ml: '250ml', precio: 90 },
    { nombre: 'Red Bull Sugar Free', ml: '250ml', precio: 90 },
    { nombre: 'Red Bull Tropical', ml: '250ml', precio: 90 },
    { nombre: 'Red Bull Sandía', ml: '250ml', precio: 90 },
    { nombre: 'Boost Lata', ml: '235ml', precio: 90 },
  ],
  shots: [
    { nombre: 'Perla Negra', precio: 190 },
    { nombre: 'Paquete de 10 Perlas Negras', precio: 1500 },
    { nombre: 'Bufanda', precio: 190 },
    { nombre: 'Revolver', precio: 350 },
    { nombre: 'Turbina', precio: 280 },
  ],
  cocteles: [
    { nombre: 'Limoncello Spritz', precio: 180 },
    { nombre: 'Aperol Spritz', precio: 180 },
    { nombre: 'St-Germain Spritz', precio: 180 },
    { nombre: 'Campari Spritz', precio: 180 },
    { nombre: 'Negroni', precio: 180 },
    { nombre: 'Margarita', precio: 180 },
    { nombre: 'Mojito', precio: 180 },
    { nombre: 'Fernanditos', precio: 180 },
    { nombre: 'Hanky Panky', precio: 180 },
    { nombre: 'Moskow Mule', precio: 180 },
  ],
  mixología: [
    { nombre: 'Tequila Sunrise', ingredientes: 'Tequila, Jugo de Naranja, Granadina', precio: 180 },
    { nombre: 'Moon Milk', ingredientes: 'Ron, Aceite de Coco, Esencia de Vainilla', precio: 180 },
    { nombre: 'Apple Balkan', ingredientes: 'Whisky, Miel de Maple, Manzana', precio: 180 },
    { nombre: 'Xococol', ingredientes: 'Ginebra, Xoconostle, Leche de Almendras, Agua de Coco', precio: 180 },
    { nombre: 'Agave Soul', ingredientes: 'Mezcal, Bitter Cacao, Piloncillo, Contreau', precio: 180 },
    { nombre: 'Harry Night', ingredientes: 'Cognac, Cerveza Artesanal, Limón', precio: 180 },
    { nombre: 'Mezcal Mirage', ingredientes: 'Mezcal, Campari, Toronja, Carbón Activado', precio: 180 },
    { nombre: 'Berry Ron', ingredientes: 'Bourbon, Frutos Rojos, Limón', precio: 180 },
    { nombre: 'Café Quina', ingredientes: 'Ginebra, Café, Jengibre, Tónica', precio: 180 },
  ],
  licores: [
    { nombre: 'Hpnotiq', ml: '750ml', precio: 2490 },
    { nombre: 'Herbal Jagermeister', ml: '700ml', precio: 1990 },
  ],
}

const categorias = [
  { id: 'tequila', nombre: 'TEQUILA', color: 'gold' },
  { id: 'vodka', nombre: 'VODKA', color: 'black' },
  { id: 'mezcal', nombre: 'MEZCAL', color: 'gold' },
  { id: 'ginebra', nombre: 'GINEBRA', color: 'black' },
  { id: 'ron', nombre: 'RON', color: 'gold' },
  { id: 'whisky', nombre: 'WHISKY', color: 'black' },
  { id: 'brandy', nombre: 'BRANDY', color: 'gold' },
  { id: 'cognac', nombre: 'COGNAC', color: 'black' },
  { id: 'champagne', nombre: 'CHAMPAGNE', color: 'gold' },
  { id: 'otros', nombre: 'OTROS', color: 'black' },
  { id: 'cerveza', nombre: 'CERVEZA', color: 'gold' },
  { id: 'energizantes', nombre: 'ENERGIZANTES', color: 'black' },
  { id: 'shots', nombre: 'SHOTS', color: 'gold' },
  { id: 'cocteles', nombre: 'COCTELES', color: 'black' },
  { id: 'mixología', nombre: 'MIXOLOGÍA', color: 'gold' },
  { id: 'licores', nombre: 'LICORES', color: 'black' },
]

export default function Menu1() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return `$${price.toLocaleString('es-MX')}`
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo FEVER */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/fever-bg-2.png)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {!selectedCategory && (
        <div className="min-h-screen flex flex-col">
          <header className="p-6 md:p-8 border-b border-[oklch(0.72_0.16_80/0.3)] glass-header">
            <div className="flex flex-col items-center gap-6">
              <div className="header-container">
                <div className="logo-box-large">
                  <Image src="/fever-logo.png" alt="FEVER" width={280} height={112} className="logo-main" priority />
                </div>
              </div>
              <div className="text-center">
                <p className="slogan-text">
                  WHAT'S ETERNAL NEVER FADES
                </p>
                <p className="text-[oklch(0.70_0.07_80)] text-[10px] uppercase tracking-[0.5em] mt-2">
                  Selecciona una categoría
                </p>
              </div>
              
              {/* Botones FEVERSHOP y Feverpass */}
              <div className="flex gap-3 mt-4">
                <a
                  href="/fevershop"
                  className="fevershop-btn"
                >
                  <span className="fevershop-btn-content">
                    <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="45" fill="url(#coinGrad)" stroke="#f97316" strokeWidth="3"/>
                      <defs>
                        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24"/>
                          <stop offset="50%" stopColor="#f59e0b"/>
                          <stop offset="100%" stopColor="#f97316"/>
                        </linearGradient>
                      </defs>
                      <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="20" fontWeight="900">FC</text>
                    </svg>
                    FEVERSHOP
                  </span>
                </a>
                <a
                  href="/feverpass"
                  className="feverpass-btn"
                >
                  <span className="feverpass-btn-content">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <path d="M3 10h18"/>
                      <path d="M7 15h4"/>
                    </svg>
                    Feverpass
                  </span>
                </a>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
              {categorias.map((categoria, index) => (
                <button
                  key={categoria.id}
                  onClick={() => setSelectedCategory(categoria.id)}
                  className={`
                    category-btn
                    ${categoria.color === 'gold' ? 'bg-gold' : 'bg-black-fever'}
                    aspect-[2/1] rounded-xl md:rounded-2xl overflow-hidden
                    transform transition-all duration-300
                    hover:scale-105 hover:shadow-2xl
                    active:scale-95
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="h-full flex items-center justify-center p-4 glass-overlay">
                    <span className={`
                      text-xl md:text-3xl font-black tracking-wider
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
              <div className="text-center space-y-3">
                <p className="text-[oklch(0.70_0.07_80)] text-xs">
                  Consumo responsable · Prohibida la venta a menores de edad
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] text-[oklch(0.70_0.07_80)] uppercase tracking-wider">
                  <span>Fever Club</span>
                  <span>·</span>
                  <span>León, Gto</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {selectedCategory && (
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 glass-header-strong border-b border-[oklch(0.72_0.16_80/0.3)]">
            <div className="p-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-[oklch(0.72_0.16_80)] hover:text-[oklch(0.78_0.20_80)] transition-colors glass-btn"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Categorías</span>
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-[oklch(0.72_0.16_80)]">
                  {categorias.find(c => c.id === selectedCategory)?.nombre}
                </h2>
              </div>
              <div className="w-20" />
            </div>
          </header>

          <main className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              {menuData[selectedCategory as keyof typeof menuData]?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="product-item glass-card rounded-xl md:rounded-2xl p-4 md:p-6"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-foreground">
                        {item.nombre}
                      </h3>
                      {item.ml && (
                        <p className="text-[10px] md:text-xs text-[oklch(0.72_0.16_80)] tracking-[0.15em] uppercase opacity-70 mt-0.5">
                          ✦ {item.ml} ✦
                        </p>
                      )}
                      {item.ingredientes && (
                        <p className="text-xs md:text-sm text-[oklch(0.70_0.07_80)] italic mt-1">
                          {item.ingredientes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 shrink-0">
                      {item.copa !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-[oklch(0.70_0.07_80)] mb-1">Copa</div>
                          <div className="text-base md:text-lg font-bold text-[oklch(0.72_0.16_80)]">
                            {formatPrice(item.copa)}
                          </div>
                        </div>
                      )}
                      {item.botella !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-[oklch(0.70_0.07_80)] mb-1">Botella</div>
                          <div className="text-base md:text-lg font-bold text-[oklch(0.72_0.16_80)]">
                            {formatPrice(item.botella)}
                          </div>
                        </div>
                      )}
                      {item.precio !== undefined && (
                        <div className="text-lg md:text-xl font-bold text-[oklch(0.72_0.16_80)]">
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
        .header-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 2.5rem 3rem;
          border-radius: 1.5rem;
          background: oklch(0.16 0.04 80 / 0.40);
          backdrop-filter: blur(30px) saturate(180%);
          -webkit-backdrop-filter: blur(30px) saturate(180%);
          box-shadow: 
            0 10px 40px oklch(0 0 0 / 0.3),
            inset 0 1px 0 oklch(1 0 0 / 0.1),
            0 0 0 1px oklch(0.72 0.16 80 / 0.15);
          position: relative;
          overflow: hidden;
          animation: headerFloat 6s ease-in-out infinite;
          max-width: 90%;
          margin: 0 auto;
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

        .logo-box-large {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-main {
          width: auto;
          height: auto;
          max-width: min(240px, 70vw);
          object-fit: contain;
          filter: drop-shadow(0 0 15px oklch(0.72 0.16 80 / 0.4))
                  drop-shadow(0 0 30px oklch(0.72 0.16 80 / 0.2));
          animation: logoGlow 3s ease-in-out infinite;
          transition: transform 0.3s ease;
        }

        .logo-main:hover {
          transform: scale(1.05);
        }

        .slogan-text {
          color: oklch(0.72 0.16 80);
          font-size: clamp(0.65rem, 2vw, 0.875rem);
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.85;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        @keyframes logoGlow {
          0%, 100% {
            filter: drop-shadow(0 0 20px oklch(0.72 0.16 80 / 0.5))
                    drop-shadow(0 0 40px oklch(0.72 0.16 80 / 0.3));
          }
          50% {
            filter: drop-shadow(0 0 30px oklch(0.72 0.16 80 / 0.7))
                    drop-shadow(0 0 60px oklch(0.72 0.16 80 / 0.4));
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            padding: 2rem 1.5rem;
            max-width: 95%;
          }
          
          .logo-main {
            max-width: min(200px, 65vw);
          }
        }

        .glass-header, .glass-footer {
          background: oklch(0.16 0.04 80 / 0.70);
          backdrop-filter: blur(32px) saturate(200%);
        }

        .glass-header-strong {
          background: oklch(0.16 0.04 80 / 0.85);
          backdrop-filter: blur(40px) saturate(220%);
        }

        .glass-overlay {
          background: linear-gradient(135deg, oklch(1 0 0 / 0.05) 0%, transparent 100%);
        }

        .glass-card {
          background: oklch(0.16 0.04 80 / 0.70);
          backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid oklch(0.35 0.09 80 / 0.30);
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          transform: translateX(8px);
          background: oklch(0.18 0.05 80 / 0.85);
          border-color: oklch(0.72 0.16 80 / 0.5);
        }

        .glass-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          background: oklch(0.72 0.16 80 / 0.1);
          backdrop-filter: blur(10px);
        }

        .category-btn {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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

        .bg-black-fever {
          background: oklch(0.12 0.04 80 / 0.25);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 2px solid oklch(0.72 0.16 80 / 0.6);
          box-shadow: 
            0 10px 40px oklch(0 0 0 / 0.5),
            inset 0 1px 0 oklch(0.72 0.16 80 / 0.2);
        }

        .product-item {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .fevershop-btn {
          display: inline-flex;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 2px solid rgba(251, 191, 36, 0.4);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 20px rgba(251, 191, 36, 0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .fevershop-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
          animation: shimmer 3s infinite;
        }

        .fevershop-btn:hover {
          transform: translateY(-3px) scale(1.05);
          border-color: rgba(251, 191, 36, 0.7);
          box-shadow: 
            0 15px 40px rgba(251, 191, 36, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 40px rgba(251, 191, 36, 0.4);
        }

        .fevershop-btn-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          color: #fbbf24;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .feverpass-btn {
          display: inline-flex;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(219, 39, 119, 0.1) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 2px solid rgba(147, 51, 234, 0.4);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 20px rgba(147, 51, 234, 0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .feverpass-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.3), transparent);
          animation: shimmer 3s infinite;
        }

        .feverpass-btn:hover {
          transform: translateY(-3px) scale(1.05);
          border-color: rgba(147, 51, 234, 0.7);
          box-shadow: 
            0 15px 40px rgba(147, 51, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 40px rgba(147, 51, 234, 0.4);
        }

        .feverpass-btn-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          color: #a855f7;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
