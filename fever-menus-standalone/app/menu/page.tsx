'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MenuSelector() {
  const router = useRouter()

  useEffect(() => {
    router.push('/menu-1')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-pulse text-[oklch(0.72_0.16_80)] text-xl">
          Cargando menú...
        </div>
      </div>
    </div>
  )
}
