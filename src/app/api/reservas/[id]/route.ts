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

  const reserva = await prisma.reserva.update({
    where: { id },
    data: { estado: body.estado },
    include: { usuario: { select: { name: true, email: true } }, mesa: true },
  })

  return Response.json(reserva)
}
