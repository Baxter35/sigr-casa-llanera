'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  CalendarDays,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bike,
} from 'lucide-react'
import { useState } from 'react'

type UserSession = {
  name?: string | null
  email?: string | null
  image?: string | null
  id: string
  rol: string
}

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MESERO', 'CAJERO'] },
  { href: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed, roles: ['ADMIN', 'MESERO'] },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList, roles: ['ADMIN', 'MESERO'] },
  { href: '/dashboard/reservas', label: 'Reservas', icon: CalendarDays, roles: ['ADMIN', 'MESERO'] },
  { href: '/dashboard/domicilios', label: 'Domicilios', icon: Bike, roles: ['ADMIN', 'MESERO'] },
  { href: '/dashboard/facturacion', label: 'Facturación', icon: Receipt, roles: ['ADMIN', 'CAJERO'] },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'CAJERO'] },
]

const rolColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
  MESERO: 'bg-green-100 text-green-700 border-green-200',
  CAJERO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CLIENTE: 'bg-blue-100 text-blue-700 border-blue-200',
}

export function SidebarNav({ user }: { user: UserSession }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = allNavItems.filter((item) => item.roles.includes(user.rol))

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-amber-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-800/20 border border-amber-600/40 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 58C32 58 14 46 14 30C14 20 20 14 26 12C24 18 28 22 28 22C28 22 26 16 32 10C32 10 30 20 36 24C36 24 34 18 38 16C42 20 50 26 50 34C50 46 32 58 32 58Z" fill="#F97316" />
              <path d="M32 52C32 52 20 43 20 33C20 26 24 22 28 20C27 24 30 27 30 27C30 27 29 23 32 18C32 18 31 25 36 28C36 28 34 24 37 22C40 25 44 30 44 36C44 45 32 52 32 52Z" fill="#FCD34D" />
              <path d="M32 46C32 46 25 40 25 34C25 30 28 27 30 26C29.5 28.5 31 30.5 31 30.5C31 30.5 30 28 32 25C32 25 31.5 29 34 31C34 31 33 29 35 28C37 30 38 33 38 36C38 41 32 46 32 46Z" fill="#FEF3C7" />
            </svg>
          </div>
          <span className="font-bold text-amber-900 text-lg leading-tight">Casa Llanera</span>
        </div>
        <p className="text-xs text-amber-600 ml-10">Carne a la Llanera</p>
      </div>

      <div className="px-4 py-3 border-b border-amber-100">
        <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
        <span
          className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${rolColors[user.rol] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {user.rol}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-amber-100">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-amber-100 shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-800/20 border border-amber-600/40 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 58C32 58 14 46 14 30C14 20 20 14 26 12C24 18 28 22 28 22C28 22 26 16 32 10C32 10 30 20 36 24C36 24 34 18 38 16C42 20 50 26 50 34C50 46 32 58 32 58Z" fill="#F97316" />
              <path d="M32 52C32 52 20 43 20 33C20 26 24 22 28 20C27 24 30 27 30 27C30 27 29 23 32 18C32 18 31 25 36 28C36 28 34 24 37 22C40 25 44 30 44 36C44 45 32 52 32 52Z" fill="#FCD34D" />
              <path d="M32 46C32 46 25 40 25 34C25 30 28 27 30 26C29.5 28.5 31 30.5 31 30.5C31 30.5 30 28 32 25C32 25 31.5 29 34 31C34 31 33 29 35 28C37 30 38 33 38 36C38 41 32 46 32 46Z" fill="#FEF3C7" />
            </svg>
          </div>
          <span className="font-bold text-amber-900">Casa Llanera</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-amber-100 z-40 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top padding */}
      <div className="md:hidden h-14" />
    </>
  )
}
