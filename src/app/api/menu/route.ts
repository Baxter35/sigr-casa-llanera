import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const platos = await prisma.plato.findMany({
    include: { categoria: true },
    orderBy: { nombre: 'asc' },
  })
  return Response.json(platos.map((p) => ({ ...p, precio: Number(p.precio) })))
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const body = await request.json()
  const plato = await prisma.plato.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio,
      disponible: body.disponible ?? true,
      categoriaId: body.categoriaId,
    },
    include: { categoria: true },
  })
  return Response.json({ ...plato, precio: Number(plato.precio) }, { status: 201 })
}
