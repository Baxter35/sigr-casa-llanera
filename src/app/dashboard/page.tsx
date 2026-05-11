import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ClipboardList, Table2, CalendarDays } from 'lucide-react'

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

export default async function DashboardPage() {
  const session = await auth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ventasHoy, pedidosActivos, mesasOcupadas, reservasHoy] = await Promise.all([
    prisma.pedido.aggregate({
      where: { estado: 'ENTREGADO', createdAt: { gte: today } },
      _sum: { total: true },
    }),
    prisma.pedido.count({
      where: { estado: { in: ['PENDIENTE', 'EN_COCINA', 'LISTO'] } },
    }),
    prisma.mesa.count({ where: { estado: 'OCUPADA' } }),
    prisma.reserva.count({
      where: {
        fecha: { gte: today, lt: new Date(today.getTime() + 86400000) },
        estado: { not: 'CANCELADA' },
      },
    }),
  ])

  const totalVentas = Number(ventasHoy._sum.total ?? 0)

  const stats = [
    {
      title: 'Ventas del día',
      value: formatCOP(totalVentas),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pedidos activos',
      value: pedidosActivos.toString(),
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Mesas ocupadas',
      value: mesasOcupadas.toString(),
      icon: Table2,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Reservas hoy',
      value: reservasHoy.toString(),
      icon: CalendarDays,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
