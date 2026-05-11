import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  const domicilios = await prisma.domicilio.findMany({
    where: { createdAt: { gte: hoy, lt: manana } },
    include: {
      domiciliario: true,
      detalles: { include: { plato: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(domicilios)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { clienteNombre, clienteTelefono, clienteDireccion, clienteBarrio, notas, metodoPago, domiciliarioId, detalles } = body

  if (!clienteNombre || !clienteTelefono || !clienteDireccion || !clienteBarrio) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (!detalles || detalles.length === 0) {
    return NextResponse.json({ error: 'Debe agregar al menos un plato' }, { status: 400 })
  }

  const platos = await prisma.plato.findMany({
    where: { id: { in: detalles.map((d: { platoId: string }) => d.platoId) } },
  })

  const precioMap = new Map(platos.map((p) => [p.id, Number(p.precio)]))
  let total = 0
  const detallesData = detalles.map((d: { platoId: string; cantidad: number; notas?: string }) => {
    const precio = precioMap.get(d.platoId) ?? 0
    total += precio * d.cantidad
    return { platoId: d.platoId, cantidad: d.cantidad, precioUnitario: precio, notas: d.notas }
  })

  const domicilio = await prisma.domicilio.create({
    data: {
      clienteNombre,
      clienteTelefono,
      clienteDireccion,
      clienteBarrio,
      notas,
      metodoPago,
      domiciliarioId: domiciliarioId || null,
      total,
      detalles: { create: detallesData },
    },
    include: { domiciliario: true, detalles: { include: { plato: true } } },
  })

  return NextResponse.json(domicilio, { status: 201 })
}
