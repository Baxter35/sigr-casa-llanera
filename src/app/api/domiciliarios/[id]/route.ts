import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if ((session.user as { rol?: string }).rol !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const { id } = await params
  const domiciliario = await prisma.domiciliario.findUnique({ where: { id } })
  if (!domiciliario) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const actualizado = await prisma.domiciliario.update({
    where: { id },
    data: { activo: !domiciliario.activo },
  })
  return NextResponse.json(actualizado)
}
