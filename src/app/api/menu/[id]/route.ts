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
  const plato = await prisma.plato.update({
    where: { id },
    data: {
      ...(body.nombre !== undefined && { nombre: body.nombre }),
      ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
      ...(body.precio !== undefined && { precio: body.precio }),
      ...(body.disponible !== undefined && { disponible: body.disponible }),
      ...(body.categoriaId !== undefined && { categoriaId: body.categoriaId }),
    },
    include: { categoria: true },
  })
  return Response.json({ ...plato, precio: Number(plato.precio) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const { id } = await params
  await prisma.plato.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
