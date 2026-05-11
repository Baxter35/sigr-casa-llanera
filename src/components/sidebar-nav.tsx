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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-amber-900 text-lg">Casa Llanera</span>
        </div>
        <p className="text-xs text-amber-600">Sistema de Gestión</p>
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
          <span className="text-xl">🌾</span>
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
