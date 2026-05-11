import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const { searchParams } = new URL(request.url)
  const mesaId = searchParams.get('mesaId')
  const activo = searchParams.get('activo') === 'true'

  const pedidos = await prisma.pedido.findMany({
    where: {
      ...(mesaId && { mesaId }),
      ...(activo && { estado: { in: ['PENDIENTE', 'EN_COCINA', 'LISTO'] } }),
    },
    include: {
      detalles: { include: { plato: true } },
      mesa: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(
    pedidos.map((p) => ({ ...p, total: p.total !== null ? Number(p.total) : null }))
  )
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const body = await request.json()
  const { mesaId, detalles } = body

  const platos = await prisma.plato.findMany({
    where: { id: { in: detalles.map((d: any) => d.platoId) } },
  })

  const precioMap = Object.fromEntries(platos.map((p) => [p.id, Number(p.precio)]))
  const total = detalles.reduce(
    (sum: number, d: any) => sum + (precioMap[d.platoId] ?? 0) * d.cantidad,
    0
  )

  const pedido = await prisma.pedido.create({
    data: {
      mesaId,
      meseroId: session.user.id,
      total,
      detalles: {
        create: detalles.map((d: any) => ({
          platoId: d.platoId,
          cantidad: d.cantidad,
          precioUnitario: precioMap[d.platoId] ?? 0,
          notas: d.notas ?? null,
        })),
      },
    },
    include: { detalles: { include: { plato: true } }, mesa: true },
  })

  await prisma.mesa.update({ where: { id: mesaId }, data: { estado: 'OCUPADA' } })

  return Response.json({ ...pedido, total: Number(pedido.total) }, { status: 201 })
}
