import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const { id } = await params
  const body = await request.json()

  const pedido = await prisma.pedido.update({
    where: { id },
    data: { estado: body.estado },
    include: { mesa: true },
  })

  if (body.estado === 'ENTREGADO' || body.estado === 'CANCELADO') {
    await prisma.mesa.update({ where: { id: pedido.mesaId }, data: { estado: 'LIBRE' } })
  }

  return Response.json({ ...pedido, total: pedido.total !== null ? Number(pedido.total) : null })
}
