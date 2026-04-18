'use client'

import Image from 'next/image'

const menuData = {
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
}

export default function PrintPage3() {
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
              width={180} 
              height={72} 
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
          padding: 0.8in;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .header {
          text-align: center;
          margin-bottom: 0.25in;
          padding: 0.12in;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
          border: 2px solid #d4af37;
          border-radius: 0.12in;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 0.06in;
        }

        .logo {
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }

        .subtitle {
          font-size: 9pt;
          letter-spacing: 0.2em;
          margin: 0;
          color: #d4af37;
          font-weight: 500;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.2in;
          flex: 1;
        }

        .category-section {
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 0.08in;
          padding: 0.1in;
        }

        .category-title {
          font-size: 10pt;
          font-weight: 800;
          letter-spacing: 0.12em;
          margin: 0 0 0.08in 0;
          padding: 0.05in;
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
          margin-bottom: 0.07in;
          padding: 0.05in;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.03in;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 700;
          margin-bottom: 0.03in;
          text-transform: capitalize;
          color: #f5f5f5;
        }

        .item-prices {
          display: flex;
          gap: 0.12in;
          flex-wrap: wrap;
        }

        .price {
          font-weight: 600;
          color: #d4af37;
          font-size: 7pt;
        }

        .footer {
          text-align: center;
          font-size: 6.5pt;
          color: #999;
          margin-top: 0.2in;
          padding-top: 0.08in;
          border-top: 2px solid rgba(212, 175, 55, 0.3);
        }

        .footer p {
          margin: 0.04in 0;
        }
      `}</style>
    </div>
  )
}
