'use client'

import Image from 'next/image'

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
  energizantes: [
    { nombre: 'RedBull', precio: 90 },
    { nombre: 'RedBull Sugar Free', precio: 90 },
    { nombre: 'RedBull Tropical', precio: 90 },
    { nombre: 'RedBull Sandía', precio: 90 },
  ],
  otros: [
    { nombre: 'Agua mineral', precio: 55 },
    { nombre: 'Coca-Cola', precio: 55 },
    { nombre: 'Squirt', precio: 55 },
    { nombre: 'Agua natural', precio: 55 },
    { nombre: 'Coca-Cola sin azucar', precio: 55 },
    { nombre: 'Sprite', precio: 55 },
    { nombre: 'Mundet', precio: 55 },
    { nombre: 'Quina', precio: 55 },
    { nombre: 'Jarra de jugo', precio: 150 },
    { nombre: 'Boost', precio: 90 },
    { nombre: 'Naranjada', precio: 50 },
    { nombre: 'Limonada', precio: 50 },
    { nombre: 'Vaso de jugo', precio: 50 },
  ],
}

const categorias = [
  { id: 'tequila', nombre: 'TEQUILA' },
  { id: 'vodka', nombre: 'VODKA' },
  { id: 'mezcal', nombre: 'MEZCAL' },
  { id: 'ginebras', nombre: 'GINEBRA' },
  { id: 'ron', nombre: 'RON' },
  { id: 'whisky', nombre: 'WHISKY' },
  { id: 'brandy', nombre: 'BRANDY' },
  { id: 'cognac', nombre: 'COGNAC' },
  { id: 'champagne', nombre: 'CHAMPAGNE' },
  { id: 'shots', nombre: 'SHOTS' },
  { id: 'cocteleria', nombre: 'COCTELES' },
  { id: 'cerveza', nombre: 'CERVEZA' },
  { id: 'mixologia', nombre: 'MIXOLOGÍA' },
  { id: 'energizantes', nombre: 'ENERGIZANTES' },
  { id: 'otros', nombre: 'OTROS' },
]

export default function MenuPrint() {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return `$${price.toLocaleString('es-MX')}`
  }

  return (
    <>
      <div className="print-container">
        {/* Fondo FEVER con gradientes */}
        <div className="background-wrapper">
          <div className="background-gradient" />
        </div>

        {/* Header con branding FEVER */}
        <div className="header">
          <div className="logo-container">
            <Image 
              src="/fever-logo.png" 
              alt="FEVER" 
              width={200} 
              height={80} 
              className="logo"
              priority
            />
          </div>
          <p className="subtitle">Menú Digital FEVER</p>
        </div>

        {/* Menu en 3 columnas */}
        <div className="content-wrapper">
          <div className="menu-grid">
            {categorias.map((categoria) => {
              const items = menuData[categoria.id as keyof typeof menuData]
              if (!items || items.length === 0) return null

              return (
                <div key={categoria.id} className="category-section">
                  <h2 className="category-title">{categoria.nombre}</h2>
                  <div className="items-list">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="menu-item">
                        <div className="item-name">{item.nombre}</div>
                        {item.ingredientes && (
                          <div className="item-ingredients">{item.ingredientes}</div>
                        )}
                        <div className="item-prices">
                          {item.copa !== undefined && (
                            <span className="price">Copa: {formatPrice(item.copa)}</span>
                          )}
                          {item.botella !== undefined && (
                            <span className="price">Botella: {formatPrice(item.botella)}</span>
                          )}
                          {item.precio !== undefined && (
                            <span className="price">{formatPrice(item.precio)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Consumo responsable · Prohibida la venta a menores de edad</p>
          <p>Fever Club · León, Gto</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            size: letter;
            margin: 0.75in 0.6in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            padding: 0 !important;
          }

          .header {
            page-break-after: avoid;
            margin-top: 0 !important;
            margin-bottom: 0.4in !important;
          }

          .content-wrapper {
            padding-top: 0.5in;
          }

          .menu-grid {
            gap: 0.25in !important;
          }

          .category-section {
            page-break-inside: avoid;
            margin-top: 0.2in !important;
            margin-bottom: 0.25in !important;
          }

          .footer {
            margin-top: 0.4in !important;
          }
        }

        .print-container {
          width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          padding: 0.6in 0.7in;
          background: #0a0a0a;
          color: #e5e5e5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .background-wrapper {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .background-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(212, 175, 55, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%);
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        .header {
          text-align: center;
          margin-top: 0.3in;
          margin-bottom: 0.3in;
          padding: 0.15in 0.2in;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
          border: 2px solid #d4af37;
          border-radius: 0.15in;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
          position: relative;
          z-index: 1;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 0.08in;
        }

        .logo {
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }

        .subtitle {
          font-size: 10pt;
          letter-spacing: 0.2em;
          margin: 0;
          color: #d4af37;
          font-weight: 500;
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.2in;
          margin-bottom: 0.2in;
          position: relative;
          z-index: 1;
          max-width: 100%;
        }

        .category-section {
          break-inside: avoid;
          margin-bottom: 0.2in;
          margin-top: 0.15in;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 0.08in;
          padding: 0.1in;
        }

        .category-title {
          font-size: 11pt;
          font-weight: 800;
          letter-spacing: 0.15em;
          margin: 0 0 0.08in 0;
          padding: 0.06in 0.08in;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          color: #0a0a0a;
          text-align: center;
          border-radius: 0.05in;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
        }

        .items-list {
          font-size: 7.5pt;
        }

        .menu-item {
          margin-bottom: 0.08in;
          padding: 0.05in;
          padding-bottom: 0.06in;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.04in;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 700;
          margin-bottom: 0.02in;
          text-transform: capitalize;
          color: #f5f5f5;
        }

        .item-ingredients {
          font-size: 6.5pt;
          font-style: italic;
          color: #999;
          margin-bottom: 0.02in;
          line-height: 1.2;
        }

        .item-prices {
          display: flex;
          gap: 0.1in;
          flex-wrap: wrap;
        }

        .price {
          font-weight: 600;
          color: #d4af37;
          font-size: 7pt;
        }

        .footer {
          text-align: center;
          font-size: 7pt;
          color: #999;
          margin-top: 0.2in;
          padding-top: 0.1in;
          border-top: 2px solid rgba(212, 175, 55, 0.3);
          position: relative;
          z-index: 1;
        }

        .footer p {
          margin: 0.03in 0;
        }

        /* Estilos para vista en pantalla */
        @media screen {
          body {
            background: #0a0a0a;
            padding: 20px;
          }

          .print-container {
            box-shadow: 0 0 40px rgba(212, 175, 55, 0.3);
          }
        }
      `}</style>
    </>
  )
}
