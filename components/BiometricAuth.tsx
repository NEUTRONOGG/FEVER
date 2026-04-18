"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Fingerprint, Scan, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BiometricAuthProps {
  rpId: string
  rpNombre: string
  onSuccess: () => void
  onError: (error: string) => void
  mode: 'register' | 'login'
}

export default function BiometricAuth({ 
  rpId, 
  rpNombre, 
  onSuccess, 
  onError,
  mode 
}: BiometricAuthProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // Verificar si el navegador soporta WebAuthn
  const isWebAuthnSupported = () => {
    return window.PublicKeyCredential !== undefined && 
           navigator.credentials !== undefined
  }

  // Verificar si el dispositivo tiene autenticación biométrica
  const checkBiometricAvailability = async () => {
    if (!isWebAuthnSupported()) {
      return false
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch (error) {
      console.error('Error checking biometric availability:', error)
      return false
    }
  }

  // Registrar credencial biométrica (Face ID / Touch ID)
  const registerBiometric = async () => {
    setLoading(true)
    setStatus('scanning')
    setMessage('Mira tu iPhone para escanear tu rostro...')

    try {
      // Verificar disponibilidad
      const available = await checkBiometricAvailability()
      if (!available) {
        throw new Error('Face ID no está disponible en este dispositivo')
      }

      // Generar challenge único
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Configuración para registro
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'FEVER CRM',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(rpId),
          name: rpNombre,
          displayName: rpNombre
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Face ID / Touch ID
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: 'none'
      }

      // Crear credencial
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('No se pudo crear la credencial')
      }

      // Guardar credencial en base de datos
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64((credential.response as AuthenticatorAttestationResponse).clientDataJSON),
          attestationObject: arrayBufferToBase64((credential.response as AuthenticatorAttestationResponse).attestationObject)
        }
      }

      // Guardar en Supabase
      const { supabase } = await import('@/lib/supabase')
      const { error: dbError } = await supabase
        .from('limites_cortesias_rp')
        .update({ 
          biometric_credential: credentialData,
          biometric_enabled: true,
          biometric_registered_at: new Date().toISOString()
        })
        .eq('id', rpId)

      if (dbError) throw dbError

      setStatus('success')
      setMessage('¡Face ID registrado exitosamente! 🎉')
      
      setTimeout(() => {
        onSuccess()
      }, 1500)

    } catch (error: any) {
      console.error('Error registering biometric:', error)
      setStatus('error')
      
      let errorMessage = 'Error al registrar Face ID'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permiso denegado. Permite el acceso a Face ID'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Face ID no está disponible en este dispositivo'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Autenticar con biométrica
  const authenticateBiometric = async () => {
    setLoading(true)
    setStatus('scanning')
    setMessage('Mira tu iPhone para autenticarte...')

    try {
      // Verificar disponibilidad
      const available = await checkBiometricAvailability()
      if (!available) {
        throw new Error('Face ID no está disponible en este dispositivo')
      }

      // Obtener credencial guardada
      const { supabase } = await import('@/lib/supabase')
      const { data: rpData, error: fetchError } = await supabase
        .from('limites_cortesias_rp')
        .select('biometric_credential, biometric_enabled')
        .eq('id', rpId)
        .single()

      if (fetchError || !rpData?.biometric_enabled || !rpData?.biometric_credential) {
        throw new Error('Face ID no está registrado para este RP')
      }

      // Generar challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Configuración para autenticación
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: base64ToArrayBuffer(rpData.biometric_credential.rawId),
          type: 'public-key',
          transports: ['internal']
        }],
        userVerification: 'required',
        timeout: 60000
      }

      // Autenticar
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      if (!assertion) {
        throw new Error('Autenticación fallida')
      }

      setStatus('success')
      setMessage('¡Autenticación exitosa! ✓')
      
      setTimeout(() => {
        onSuccess()
      }, 1000)

    } catch (error: any) {
      console.error('Error authenticating biometric:', error)
      setStatus('error')
      
      let errorMessage = 'Error al autenticar con Face ID'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Autenticación cancelada o denegada'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Face ID no está disponible'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Utilidades para conversión
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  const handleClick = () => {
    if (mode === 'register') {
      registerBiometric()
    } else {
      authenticateBiometric()
    }
  }

  return (
    <div className="space-y-4">
      {/* Botón principal */}
      <Button
        onClick={handleClick}
        disabled={loading}
        className="w-full h-20 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        <div className="relative z-10 flex items-center justify-center gap-3">
          {status === 'scanning' ? (
            <>
              <Scan className="w-6 h-6 animate-pulse" />
              <span>Escaneando...</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              <span>¡Éxito!</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-6 h-6" />
              <span>{mode === 'register' ? 'Registrar Face ID' : 'Iniciar con Face ID'}</span>
            </>
          )}
        </div>
      </Button>

      {/* Mensaje de estado */}
      {message && (
        <Alert className={
          status === 'success' 
            ? 'border-green-500/50 bg-green-500/10' 
            : status === 'error'
            ? 'border-red-500/50 bg-red-500/10'
            : 'border-purple-500/50 bg-purple-500/10'
        }>
          {status === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : status === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Scan className="h-4 w-4 text-purple-500 animate-pulse" />
          )}
          <AlertDescription className={
            status === 'success' 
              ? 'text-green-300' 
              : status === 'error'
              ? 'text-red-300'
              : 'text-purple-300'
          }>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Información */}
      {status === 'idle' && (
        <div className="text-center text-sm text-slate-400 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Fingerprint className="w-4 h-4" />
            {mode === 'register' 
              ? 'Registra tu rostro para acceso rápido'
              : 'Usa Face ID para iniciar sesión rápidamente'
            }
          </p>
          <p className="text-xs text-slate-500">
            Compatible con Face ID y Touch ID de Apple
          </p>
        </div>
      )}
    </div>
  )
}
