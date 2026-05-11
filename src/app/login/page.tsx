'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌾</div>
          <h1 className="text-3xl font-bold text-amber-900">Casa Llanera</h1>
          <p className="text-amber-700 mt-1">Sistema Integral de Gestión</p>
        </div>

        <Card className="shadow-xl border-amber-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-amber-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-amber-700">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@casallanera.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-amber-100">
              <p className="text-xs text-amber-600 font-medium mb-2">Usuarios de prueba:</p>
              <div className="space-y-1 text-xs text-amber-700">
                <p>Admin: admin@casallanera.com / Admin123!</p>
                <p>Mesero: mesero@casallanera.com / Mesero123!</p>
                <p>Cajero: cajero@casallanera.com / Cajero123!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
