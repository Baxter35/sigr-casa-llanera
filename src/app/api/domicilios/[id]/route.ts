import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const domicilio = await prisma.domicilio.findUnique({
    where: { id },
    include: { domiciliario: true, detalles: { include: { plato: true } } },
  })
  if (!domicilio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(domicilio)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { estado, domiciliarioId } = body

  const actual = await prisma.domicilio.findUnique({ where: { id } })
  if (!actual) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (actual.estado === 'ENTREGADO' || actual.estado === 'CANCELADO') {
    return NextResponse.json({ error: 'No se puede modificar un domicilio finalizado' }, { status: 400 })
  }

  const domicilio = await prisma.domicilio.update({
    where: { id },
    data: {
      ...(estado && { estado }),
      ...(domiciliarioId !== undefined && { domiciliarioId }),
    },
    include: { domiciliario: true, detalles: { include: { plato: true } } },
  })

  return NextResponse.json(domicilio)
}
