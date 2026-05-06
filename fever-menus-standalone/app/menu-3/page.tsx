'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import MenuSwitcher from '@/components/MenuSwitcher'

const menuData = {
  tequila: [
    { nombre: 'Centenario plata', copa: 120, botella: 1890 },
    { nombre: 'Centenario ultra', copa: 120, botella: 2090 },
    { nombre: 'Centenario reposado', copa: 120, botella: 1890 },
    { nombre: '1800 cristalino', copa: 200, botella: 2990 },
    { nombre: 'Dobel diamante', copa: 240, botella: 2890 },
    { nombre: 'Dobel blanco', copa: 180, botella: 2140 },
    { nombre: 'Don julio 70', copa: 240, botella: 3170 },
    { nombre: 'Don julio reposado', copa: 200, botella: 2340 },
    { nombre: 'Don julio 1942', copa: null, botella: 7990 },
    { nombre: 'Herradora plata', copa: 150, botella: 2240 },
    { nombre: 'Herradura ultra', copa: 220, botella: 2965 },
    { nombre: 'Dobel diamante 1750ml', copa: null, botella: 5990 },
    { nombre: '1800 cristalino patona 1750ml', copa: null, botella: 5990 },
  ],
  vodka: [
    { nombre: 'Smirnoff sabor natural', copa: 100, botella: 1490 },
    { nombre: 'Stolichnaya', copa: 120, botella: 1840 },
    { nombre: 'Smirnoff tamarindo', copa: 110, botella: 1490 },
    { nombre: 'Absolut Vodka', copa: 120, botella: 1690 },
    { nombre: 'Grey goose', copa: 190, botella: 2690 },
  ],
  mezcal: [
    { nombre: '400 conejos espadín', copa: 150, botella: 1940 },
    { nombre: 'Unión joven', copa: 149, botella: 1890 },
    { nombre: 'Montelobos Tobala', copa: 180, botella: 2490 },
  ],
  ginebras: [
    { nombre: 'Tanqueray london', copa: 160, botella: 2240 },
    { nombre: 'Tanqueray ten', copa: 180, botella: 2590 },
    { nombre: 'Beefeater', copa: 150, botella: 2090 },
    { nombre: 'Bombay', copa: 150, botella: 1990 },
  ],
  ron: [
    { nombre: 'Bacardi blanco', copa: 100, botella: 1440 },
    { nombre: 'Matusalen platino', copa: 100, botella: 1390 },
    { nombre: 'Matusalen clásico', copa: 120, botella: 1550 },
    { nombre: 'Habana 7', copa: 120, botella: 1940 },
    { nombre: 'Bacardi blanco 1750ml', copa: null, botella: 3490 },
    { nombre: 'Zacapa 23', copa: 240, botella: 2990 },
  ],
  whisky: [
    { nombre: 'Red label', copa: 130, botella: 1990 },
    { nombre: 'Black label', copa: 190, botella: 2490 },
    { nombre: 'Buchanan\'s 12', copa: 190, botella: 2990 },
    { nombre: 'Buchanan\'s 18', copa: null, botella: 5990 },
  ],
  brandy: [{ nombre: 'Torres X', copa: 130, botella: 1990 }],
  cognac: [{ nombre: 'Martell vsop', copa: 210, botella: 3140 }],
  champagne: [
    { nombre: 'Moet brut', copa: null, botella: 3990 },
    { nombre: 'Moet ice', copa: null, botella: 4790 },
    { nombre: 'Dom Perignon Luminous', copa: null, botella: 22290 },
  ],
  shots: [
    { nombre: 'Perlas negras', precio: 190 },
    { nombre: 'Paquete 10 perlas negras', precio: 1500 },
    { nombre: 'Bufandas', precio: 190 },
    { nombre: 'Revolver', precio: 350 },
    { nombre: 'Turbina', precio: 280 },
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
    { nombre: 'HEINEKEN', precio: 80 },
  ],
  mixologia: [
    { nombre: 'Moon Milk', ingredientes: 'Ron, Aceite de coco, Esencia de vainilla', precio: 180 },
    { nombre: 'Apple balkan', ingredientes: 'Whisky, Miel de maple, Manzana', precio: 180 },
    { nombre: 'Xococol', ingredientes: 'Ginebra, Xoconostle, Leche de almendras, Agua de coco', precio: 180 },
    { nombre: 'Agave soul', ingredientes: 'Mezcal, Bitter cacao, Piloncillo, Contreau', precio: 180 },
    { nombre: 'Harry night', ingredientes: 'Cognac, Cerveza artesanal, Limón', precio: 180 },
    { nombre: 'Mezcal Mirage', ingredientes: 'Mezcal, Campari, Toronja, Carbón activado', precio: 180 },
    { nombre: 'Berry ron', ingredientes: 'Bourbon, Frutos rojos, Limón', precio: 180 },
    { nombre: 'Sunrise', ingredientes: 'Ron añejo, Café, Limón, Piloncillo', precio: 180 },
    { nombre: 'Café quina', ingredientes: 'Ginebra, Café, Jengibre, Tónica', precio: 180 },
  ],
}

const categorias = [
  { id: 'tequila', nombre: 'TEQUILA' },
  { id: 'ron', nombre: 'RON' },
  { id: 'vodka', nombre: 'VODKA' },
  { id: 'whisky', nombre: 'WHISKY' },
  { id: 'cognac', nombre: 'COGNAC' },
  { id: 'brandy', nombre: 'BRANDY' },
  { id: 'champagne', nombre: 'CHAMPAGNE' },
  { id: 'mezcal', nombre: 'MEZCAL' },
  { id: 'cocteleria', nombre: 'COCTELES' },
  { id: 'ginebras', nombre: 'GINEBRA' },
  { id: 'cerveza', nombre: 'CERVEZA' },
  { id: 'shots', nombre: 'SHOTS' },
  { id: 'mixologia', nombre: 'MIXOLOGÍA' },
]

export default function Menu3() {
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
            backgroundImage: 'url(/fever-bg-1.png)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {!selectedCategory && (
        <div className="min-h-screen flex flex-col">
          <header className="p-6 md:p-8 border-b border-[oklch(0.72_0.16_80/0.2)] glass-minimal">
            <div className="flex flex-col items-center gap-6">
              <div className="header-container">
                <div className="logo-box-large">
                  <Image src="/fever-logo.png" alt="FEVER" width={280} height={112} className="logo-main" priority />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[oklch(0.72_0.16_80)] text-xs md:text-sm tracking-wide font-light">
                  Consumo responsable · Prohibida la venta a menores de edad
                </p>
                <p className="text-[oklch(0.70_0.07_80)] text-[10px] uppercase tracking-[0.5em] mt-2">
                  Menu
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">
            <div className="space-y-2">
              {categorias.map((categoria, index) => (
                <button
                  key={categoria.id}
                  onClick={() => setSelectedCategory(categoria.id)}
                  className="category-minimal w-full"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between p-5 rounded-xl glass-card-minimal hover:glass-card-hover transition-all duration-300 group">
                    <span className="text-lg md:text-xl font-light text-foreground tracking-wider">
                      {categoria.nombre}
                    </span>
                    <ChevronRight className="w-5 h-5 text-[oklch(0.72_0.16_80)] transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </main>

          <footer className="border-t border-[oklch(0.72_0.16_80/0.2)] glass-minimal">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-center mb-6">
                <MenuSwitcher />
              </div>
              <div className="text-center">
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
          <header className="sticky top-0 z-50 glass-minimal border-b border-[oklch(0.72_0.16_80/0.2)]">
            <div className="p-4 md:p-6 flex items-center justify-between max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-[oklch(0.72_0.16_80)] hover:text-[oklch(0.78_0.20_80)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-light tracking-wider">Volver</span>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-light text-[oklch(0.72_0.16_80)] tracking-wider">
                  {categorias.find(c => c.id === selectedCategory)?.nombre}
                </h2>
              </div>
              <div className="w-20" />
            </div>
          </header>

          <main className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="space-y-1">
              {menuData[selectedCategory as keyof typeof menuData]?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="product-row"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-center justify-between p-4 md:p-5 rounded-lg glass-card-minimal hover:glass-card-hover transition-all duration-300 group">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-sm md:text-base font-light text-foreground group-hover:text-[oklch(0.72_0.16_80)] transition-colors">
                        {item.nombre}
                      </h3>
                      {item.ingredientes && (
                        <p className="text-xs text-[oklch(0.70_0.07_80)] mt-1 italic">
                          {item.ingredientes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 shrink-0">
                      {item.copa !== undefined && (
                        <div className="text-right">
                          <div className="text-[10px] text-[oklch(0.70_0.07_80)] mb-0.5 uppercase tracking-wider">
                            Copa
                          </div>
                          <div className="text-sm md:text-base font-light text-[oklch(0.72_0.16_80)] tabular-nums">
                            {formatPrice(item.copa)}
                          </div>
                        </div>
                      )}
                      {item.botella !== undefined && (
                        <div className="text-right">
                          <div className="text-[10px] text-[oklch(0.70_0.07_80)] mb-0.5 uppercase tracking-wider">
                            Botella
                          </div>
                          <div className="text-sm md:text-base font-light text-[oklch(0.72_0.16_80)] tabular-nums">
                            {formatPrice(item.botella)}
                          </div>
                        </div>
                      )}
                      {item.precio !== undefined && (
                        <div className="text-base md:text-lg font-light text-[oklch(0.72_0.16_80)] tabular-nums">
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
          gap: 2rem;
          padding: 2.5rem 3rem;
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

        .glass-minimal {
          background: oklch(0.16 0.04 80 / 0.40);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
        }

        .glass-card-minimal {
          background: oklch(0.16 0.04 80 / 0.30);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid oklch(0.72 0.16 80 / 0.4);
          box-shadow: 
            0 8px 32px oklch(0 0 0 / 0.3),
            inset 0 1px 0 oklch(1 0 0 / 0.1);
        }

        .glass-card-hover {
          background: oklch(0.20 0.06 80 / 0.50);
          backdrop-filter: blur(25px) saturate(200%);
          -webkit-backdrop-filter: blur(25px) saturate(200%);
          border-color: oklch(0.72 0.16 80 / 0.6);
          box-shadow: 
            0 12px 40px oklch(0 0 0 / 0.4),
            inset 0 1px 0 oklch(1 0 0 / 0.2);
        }

        .category-minimal {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .product-row {
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .price-tag {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
