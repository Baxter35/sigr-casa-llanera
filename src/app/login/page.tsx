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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900">
      {/* Fondo con textura de llama */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-800/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-800/30 border-2 border-amber-600/50 mb-4 shadow-lg shadow-amber-900/50">
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Llama de fuego */}
              <path d="M32 58C32 58 14 46 14 30C14 20 20 14 26 12C24 18 28 22 28 22C28 22 26 16 32 10C32 10 30 20 36 24C36 24 34 18 38 16C42 20 50 26 50 34C50 46 32 58 32 58Z" fill="#F97316" />
              <path d="M32 52C32 52 20 43 20 33C20 26 24 22 28 20C27 24 30 27 30 27C30 27 29 23 32 18C32 18 31 25 36 28C36 28 34 24 37 22C40 25 44 30 44 36C44 45 32 52 32 52Z" fill="#FCD34D" />
              <path d="M32 46C32 46 25 40 25 34C25 30 28 27 30 26C29.5 28.5 31 30.5 31 30.5C31 30.5 30 28 32 25C32 25 31.5 29 34 31C34 31 33 29 35 28C37 30 38 33 38 36C38 41 32 46 32 46Z" fill="#FEF3C7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-amber-100 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Casa Llanera
          </h1>
          <p className="text-amber-400 mt-1 text-sm tracking-widest uppercase">
            Carne a la Llanera
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-12 bg-amber-700" />
            <span className="text-amber-600 text-xs">✦</span>
            <div className="h-px w-12 bg-amber-700" />
          </div>
        </div>

        <Card className="shadow-2xl border-amber-800/50 bg-stone-900/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-amber-100">Bienvenido</CardTitle>
            <CardDescription className="text-center text-amber-400/80">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-200 text-sm">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@casallanera.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-stone-800/80 border-amber-800/60 text-amber-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-200 text-sm">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-stone-800/80 border-amber-800/60 text-amber-100 placeholder:text-stone-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-semibold tracking-wide transition-colors mt-2"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-stone-600 text-xs mt-6">
          © {new Date().getFullYear()} Casa Llanera · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
