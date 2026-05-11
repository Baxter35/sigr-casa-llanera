import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const domiciliarios = await prisma.domiciliario.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })
  return NextResponse.json(domiciliarios)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if ((session.user as { rol?: string }).rol !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const { nombre, telefono } = await request.json()
  if (!nombre || !telefono) {
    return NextResponse.json({ error: 'Nombre y teléfono requeridos' }, { status: 400 })
  }

  const domiciliario = await prisma.domiciliario.create({ data: { nombre, telefono } })
  return NextResponse.json(domiciliario, { status: 201 })
}
