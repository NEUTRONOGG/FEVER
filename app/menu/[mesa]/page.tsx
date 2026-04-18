import MenuDigitalClient from './menu-client'

// Generar parámetros estáticos para las mesas (1-12)
export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({
    mesa: String(i + 1)
  }))
}

export default function MenuDigitalPage({ params }: { params: { mesa: string } }) {
  return <MenuDigitalClient mesa={params.mesa} />
}
