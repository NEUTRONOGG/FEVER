'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/menu')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="animate-pulse text-[oklch(0.72_0.16_80)] text-2xl font-bold">
          Cargando menú...
        </div>
      </div>
    </div>
  )
}
