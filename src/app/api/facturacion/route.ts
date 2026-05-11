import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const pedidos = await prisma.pedido.findMany({
    where: { estado: 'ENTREGADO' },
    include: { mesa: true, detalles: { include: { plato: true } } },
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
  const { pedidoId, metodoPago } = body

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
  if (!pedido) return new Response(null, { status: 404 })

  await prisma.pedido.update({ where: { id: pedidoId }, data: { estado: 'CANCELADO' } })

  return Response.json({ ok: true })
}
