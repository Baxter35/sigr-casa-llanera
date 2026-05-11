import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })
  const mesas = await prisma.mesa.findMany({ orderBy: { numero: 'asc' } })
  return Response.json(mesas)
}
