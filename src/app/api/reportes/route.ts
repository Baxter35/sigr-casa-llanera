import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86400000)

  const [pedidos, ventasAgr] = await Promise.all([
    prisma.pedido.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      include: { mesa: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pedido.aggregate({
      where: { estado: 'ENTREGADO', createdAt: { gte: today, lt: tomorrow } },
      _sum: { total: true },
      _count: true,
    }),
  ])

  const detalles = await prisma.detallePedido.findMany({
    where: { pedido: { createdAt: { gte: today, lt: tomorrow }, estado: 'ENTREGADO' } },
    include: { plato: true },
  })

  const conteoPlatos: Record<string, { nombre: string; cantidad: number }> = {}
  for (const d of detalles) {
    if (!conteoPlatos[d.platoId]) conteoPlatos[d.platoId] = { nombre: d.plato.nombre, cantidad: 0 }
    conteoPlatos[d.platoId].cantidad += d.cantidad
  }

  const platoMasVendido = Object.values(conteoPlatos).sort((a, b) => b.cantidad - a.cantidad)[0]?.nombre ?? null

  return Response.json({
    totalVentas: Number(ventasAgr._sum.total ?? 0),
    numPedidos: ventasAgr._count,
    platoMasVendido,
    pedidos: pedidos.map((p) => ({
      id: p.id,
      mesa: p.mesa.numero,
      estado: p.estado,
      total: p.total !== null ? Number(p.total) : null,
      createdAt: p.createdAt,
    })),
  })
}
