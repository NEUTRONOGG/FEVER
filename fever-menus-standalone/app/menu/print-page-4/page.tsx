'use client'

import Image from 'next/image'

const menuData = {
  tequila: [
    { nombre: 'Centenario Plata 700ml', precio: null },
    { nombre: 'Centenario Ultra Cristalino 695ml', precio: null },
    { nombre: 'Centenario Reposado 700ml', precio: null },
    { nombre: '1800 Cristalino 700ml', precio: null },
    { nombre: '1800 Cristalino 1750ml', precio: null },
    { nombre: 'Maestro Dobel Diamante 700ml', precio: null },
    { nombre: 'Maestro Dobel Diamante 1750ml', precio: null },
    { nombre: 'Maestro Dobel Diamante 3000ml', precio: 9990 },
    { nombre: 'Maestro Tequilero Blanco 700ml', precio: null },
    { nombre: 'Don Julio 70 700ml', precio: null },
    { nombre: 'Don Julio Reposado 700ml', precio: null },
    { nombre: 'Don Julio 1942 750ml', precio: null },
    { nombre: 'Herradura Plata 700ml', precio: null },
    { nombre: 'Herradura Ultra Añejo 700ml', precio: null },
  ],
  vodka: [
    { nombre: 'Smirnoff Proff 750ml', precio: null },
    { nombre: 'Stolichnaya 750ml', precio: null },
    { nombre: 'Smirnoff Tamarindo 750ml', precio: null },
    { nombre: 'Absolut Azul 750ml', precio: null },
    { nombre: 'Grey Goose 700ml', precio: null },
  ],
  mezcal: [
    { nombre: '400 Conejos Espadín 700ml', precio: null },
    { nombre: 'Unión El Joven 700ml', precio: null },
  ],
  ginebra: [
    { nombre: 'Tanqueray London 750ml', precio: null },
    { nombre: 'Tanqueray No Ten 700ml', precio: null },
    { nombre: 'Bombay Sapphire 700ml', precio: null },
  ],
  ron: [
    { nombre: 'Bacardí Blanco 700ml', precio: null },
    { nombre: 'Bacardí Blanco 1750ml', precio: null },
    { nombre: 'Matusalem Platino 750ml', precio: null },
    { nombre: 'Matusalem Clásico 750ml', precio: null },
    { nombre: 'Zacapa 23 Años 750ml', precio: null },
  ],
  whisky: [
    { nombre: 'Johnnie Walker Red Label 700ml', precio: null },
    { nombre: 'Johnnie Walker Black Label 750ml', precio: null },
    { nombre: "Buchanan's 12 Años 750ml", precio: null },
    { nombre: "Buchanan's 18 Años 750ml", precio: null },
  ],
  brandy: [
    { nombre: 'Torres 10 700ml', precio: null },
  ],
  cognac: [
    { nombre: 'Martell VSOP 700ml', precio: null },
  ],
  champagne: [
    { nombre: 'Moët Chandon Brut 750ml', precio: null },
    { nombre: 'Moët Ice Imperial 750ml', precio: null },
  ],
  otros: [
    { nombre: 'Agua Ciel 600ml', precio: null },
    { nombre: 'Peñafiel Lata 355ml', precio: null },
    { nombre: 'Schweppes Lata 355ml', precio: null },
    { nombre: 'Squirt Lata 355ml', precio: null },
    { nombre: 'Coca Cola Lata 355ml', precio: null },
    { nombre: 'Coca Cola Zero 355ml', precio: null },
    { nombre: 'Sprite Lata 355ml', precio: null },
    { nombre: 'Sidral Lata 355ml', precio: null },
    { nombre: 'Jarra de Jugo', precio: null },
    { nombre: 'Naranjada 325ml', precio: null },
    { nombre: 'Limonada 325ml', precio: null },
    { nombre: 'Vaso de Jugo 236ml', precio: null },
  ],
  cerveza: [
    { nombre: 'Modelo Especial 355ml', precio: null },
    { nombre: 'Corona Extra 355ml', precio: null },
    { nombre: 'Victoria Media 355ml', precio: null },
    { nombre: 'Stella Artois 330ml', precio: null },
    { nombre: 'Michelob Ultra 355ml', precio: null },
  ],
  energizantes: [
    { nombre: 'Red Bull 250ml', precio: null },
    { nombre: 'Red Bull Sugar Free 250ml', precio: null },
    { nombre: 'Red Bull Tropical 250ml', precio: null },
    { nombre: 'Red Bull Sandía 250ml', precio: null },
    { nombre: 'Boost Lata 235ml', precio: null },
  ],
  shots: [
    { nombre: 'Perla Negra', precio: null },
    { nombre: 'Paquete de 10 Perlas Negras', precio: null },
    { nombre: 'Bufanda', precio: null },
    { nombre: 'Revolver', precio: null },
    { nombre: 'Turbina', precio: null },
  ],
  cocteles: [
    { nombre: 'Limoncello Spritz', precio: null },
    { nombre: 'Aperol Spritz', precio: null },
    { nombre: 'St-Germain Spritz', precio: null },
    { nombre: 'Campari Spritz', precio: null },
    { nombre: 'Negroni', precio: null },
    { nombre: 'Margarita', precio: null },
    { nombre: 'Mojito', precio: null },
    { nombre: 'Fernanditos', precio: null },
    { nombre: 'Hanky Panky', precio: null },
    { nombre: 'Moskow Mule', precio: null },
  ],
  mixología: [
    { nombre: 'Tequila Sunrise', precio: null },
    { nombre: 'Moon Milk', precio: null },
    { nombre: 'Apple Balkan', precio: null },
    { nombre: 'Xococol', precio: null },
    { nombre: 'Agave Soul', precio: null },
    { nombre: 'Harry Night', precio: null },
    { nombre: 'Mezcal Mirage', precio: null },
    { nombre: 'Berry Ron', precio: null },
    { nombre: 'Café Quina', precio: null },
  ],
  licores: [
    { nombre: 'Hpnotiq 750ml', precio: 2490 },
    { nombre: 'Herbal Jagermeister 700ml', precio: 1990 },
  ],
}

export default function PrintPage4() {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return `$${price.toLocaleString('es-MX')}`
  }

  return (
    <div className="page-container">
      <div className="background-gradient" />
      
      <div className="content">
        <div className="header">
          <div className="logo-container">
            <Image 
              src="/fever-logo.png" 
              alt="FEVER" 
              width={120} 
              height={48} 
              className="logo"
              priority
            />
          </div>
          <p className="subtitle">Menú Digital FEVER</p>
        </div>

        <div className="menu-grid">
          {Object.entries(menuData).map(([key, items]) => (
            <div key={key} className="category-section">
              <h2 className="category-title">{key.toUpperCase()}</h2>
              <div className="items-list">
                {items.map((item: any, index: number) => (
                  <div key={index} className="menu-item">
                    <div className="item-name">{item.nombre}</div>
                    {item.ingredientes && (
                      <div className="item-ingredients">{item.ingredientes}</div>
                    )}
                    <div className="item-prices">
                      <span className="price">{formatPrice(item.precio)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer">
          <p>Consumo responsable · Prohibida la venta a menores de edad</p>
          <p>Fever Club · León, Gto</p>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          width: 8.5in;
          height: 11in;
          margin: 0 auto;
          background: #0a0a0a;
          color: #e5e5e5;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .background-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(212, 175, 55, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%);
        }

        .content {
          position: relative;
          z-index: 1;
          padding: 0.3in;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .header {
          text-align: center;
          margin-bottom: 0.1in;
          padding: 0.08in;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
          border: 1px solid #d4af37;
          border-radius: 0.08in;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 0.03in;
        }

        .logo {
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }

        .subtitle {
          font-size: 7pt;
          letter-spacing: 0.15em;
          margin: 0;
          color: #d4af37;
          font-weight: 500;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.08in;
          flex: 1;
        }

        .category-section {
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 0.05in;
          padding: 0.05in;
        }

        .category-title {
          font-size: 6pt;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin: 0 0 0.03in 0;
          padding: 0.03in;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          color: #0a0a0a;
          text-align: center;
          border-radius: 0.03in;
          box-shadow: 0 1px 4px rgba(212, 175, 55, 0.3);
        }

        .items-list {
          font-size: 5pt;
        }

        .menu-item {
          margin-bottom: 0.02in;
          padding: 0.02in;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.02in;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 700;
          margin-bottom: 0.01in;
          color: #f5f5f5;
          font-size: 5pt;
          line-height: 1.1;
        }

        .item-ingredients {
          font-size: 4pt;
          font-style: italic;
          color: #999;
          margin-bottom: 0.01in;
          line-height: 1.1;
        }

        .item-prices {
          display: flex;
          gap: 0.12in;
          flex-wrap: wrap;
        }

        .price {
          font-weight: 600;
          color: #d4af37;
          font-size: 5pt;
        }

        .footer {
          text-align: center;
          font-size: 5pt;
          color: #999;
          margin-top: 0.08in;
          padding-top: 0.05in;
          border-top: 1px solid rgba(212, 175, 55, 0.3);
        }

        .footer p {
          margin: 0.02in 0;
        }
      `}</style>
    </div>
  )
}
