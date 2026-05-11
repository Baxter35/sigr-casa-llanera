import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } })
  return Response.json(categorias)
}
