'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Crown, Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AshtonLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .eq('telefono', '5550000001')
        .eq('password', password)
        .eq('activo', true)
        .single()

      if (error || !data) {
        setError('Contraseña incorrecta')
        setLoading(false)
        return
      }

      // Actualizar último acceso
      await supabase
        .from('socios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', data.id)

      // Guardar en sessionStorage
      sessionStorage.setItem('socio', JSON.stringify(data))
      
      // Redirigir al dashboard
      router.push('/dashboard/socios')
    } catch (err) {
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-yellow-500/20 bg-black/40 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/socios')}
            className="absolute top-4 left-4 text-yellow-300 hover:text-yellow-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/50">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            ASHTON
          </CardTitle>
          <CardDescription className="text-yellow-200">
            Socio Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-yellow-100">
                <Lock className="w-4 h-4 inline mr-2" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder:text-yellow-300"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold shadow-lg shadow-yellow-500/30"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
