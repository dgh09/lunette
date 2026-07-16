'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const registered = searchParams.get('registered')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin'
            ? 'Email o contraseña incorrectos'
            : result.error
        )
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-1">
          <span className="logo-main text-2xl tracking-wide">LUNETTE</span>
        </Link>
        <h1 className="mt-6 font-serif text-2xl font-bold text-gray-900">
          Iniciar Sesión
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      {/* Success Message */}
      {registered && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Cuenta creada exitosamente. Ya puedes iniciar sesión.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm text-gray-600">Recordarme</span>
          </label>
          <Link href="/recuperar" className="text-sm text-brand-red hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="font-medium text-brand-red hover:underline">
          Regístrate aquí
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-6 rounded-md bg-gray-50 p-3 text-center text-xs text-gray-500">
        <p className="font-medium">Credenciales de prueba:</p>
        <p>Email: demo@lunette.com</p>
        <p>Contraseña: demo123</p>
      </div>
    </div>
  )
}

// useSearchParams() necesita un límite de Suspense para no romper el prerender.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
