import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pedidos = await prisma.pedido.findMany({
    where: { estado: 'ENTREGADO', updatedAt: { gte: today } },
  })

  const totalGeneral = pedidos.reduce((s, p) => s + Number(p.total ?? 0), 0)
  const totalEfectivo = totalGeneral * 0.6
  const totalTarjeta = totalGeneral * 0.4

  await prisma.cierreCaja.create({
    data: {
      cajeroId: session.user.id,
      totalEfectivo,
      totalTarjeta,
      totalGeneral,
    },
  })

  return Response.json({ efectivo: totalEfectivo, tarjeta: totalTarjeta, total: totalGeneral })
}
