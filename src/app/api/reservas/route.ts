import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const { searchParams } = new URL(request.url)
  const fechaParam = searchParams.get('fecha')

  let where: any = {}
  if (fechaParam) {
    const start = new Date(fechaParam)
    start.setHours(0, 0, 0, 0)
    const end = new Date(fechaParam)
    end.setHours(23, 59, 59, 999)
    where.fecha = { gte: start, lte: end }
  }

  const reservas = await prisma.reserva.findMany({
    where,
    include: { usuario: { select: { name: true, email: true } }, mesa: true },
    orderBy: { fecha: 'asc' },
  })

  return Response.json(reservas)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const body = await request.json()
  const reserva = await prisma.reserva.create({
    data: {
      usuarioId: session.user.id,
      mesaId: body.mesaId,
      fecha: new Date(body.fecha),
      numPersonas: body.numPersonas,
      notas: body.notas ?? null,
    },
    include: { usuario: { select: { name: true, email: true } }, mesa: true },
  })

  return Response.json(reserva, { status: 201 })
}
