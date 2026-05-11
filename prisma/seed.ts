import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

import { PrismaClient, Rol } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPass = await bcrypt.hash('Admin123!', 10)
  const meseroPass = await bcrypt.hash('Mesero123!', 10)
  const cajeroPass = await bcrypt.hash('Cajero123!', 10)

  await prisma.user.upsert({
    where: { email: 'admin@casallanera.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@casallanera.com', password: adminPass, rol: Rol.ADMIN },
  })
  await prisma.user.upsert({
    where: { email: 'mesero@casallanera.com' },
    update: {},
    create: { name: 'Carlos Mesero', email: 'mesero@casallanera.com', password: meseroPass, rol: Rol.MESERO },
  })
  await prisma.user.upsert({
    where: { email: 'cajero@casallanera.com' },
    update: {},
    create: { name: 'María Cajero', email: 'cajero@casallanera.com', password: cajeroPass, rol: Rol.CAJERO },
  })

  await Promise.all([
    prisma.categoria.upsert({ where: { id: 'cat-1' }, update: {}, create: { id: 'cat-1', nombre: 'Entradas' } }),
    prisma.categoria.upsert({ where: { id: 'cat-2' }, update: {}, create: { id: 'cat-2', nombre: 'Sopas y Sancochos' } }),
    prisma.categoria.upsert({ where: { id: 'cat-3' }, update: {}, create: { id: 'cat-3', nombre: 'Carnes a la Llanera' } }),
    prisma.categoria.upsert({ where: { id: 'cat-4' }, update: {}, create: { id: 'cat-4', nombre: 'Bebidas Típicas' } }),
    prisma.categoria.upsert({ where: { id: 'cat-5' }, update: {}, create: { id: 'cat-5', nombre: 'Postres' } }),
  ])

  const platos = [
    { id: 'p-1', nombre: 'Mamona al Palo', descripcion: 'Ternera llanera asada lentamente al palo, tradición de los Llanos', precio: 45000, categoriaId: 'cat-3' },
    { id: 'p-2', nombre: 'Pabellón Criollo', descripcion: 'Arroz, caraotas negras, carne mechada y tajadas de plátano', precio: 28000, categoriaId: 'cat-3' },
    { id: 'p-3', nombre: 'Hayaca Llanera', descripcion: 'Masa de maíz rellena con guiso de carne, envuelta en hoja de plátano', precio: 18000, categoriaId: 'cat-1' },
    { id: 'p-4', nombre: 'Sancocho de Gallina', descripcion: 'Caldo espeso de gallina criolla con yuca, papa y mazorca', precio: 32000, categoriaId: 'cat-2' },
    { id: 'p-5', nombre: 'Cachapa con Queso', descripcion: 'Torta dulce de maíz tierno con queso de mano derretido', precio: 16000, categoriaId: 'cat-1' },
    { id: 'p-6', nombre: 'Tungos de Arroz', descripcion: 'Bollos de arroz envueltos en hoja de plátano, cocidos al vapor', precio: 8000, categoriaId: 'cat-1' },
    { id: 'p-7', nombre: 'Pisillo de Chigüire', descripcion: 'Carne de chigüire desmechada y frita con ajo y cebolla', precio: 38000, categoriaId: 'cat-3' },
    { id: 'p-8', nombre: 'Chicha de Maíz', descripcion: 'Bebida tradicional de maíz fermentado con canela y panela', precio: 8000, categoriaId: 'cat-4' },
    { id: 'p-9', nombre: 'Limonada de Panela', descripcion: 'Limonada natural endulzada con panela raspada y hierbabuena', precio: 7000, categoriaId: 'cat-4' },
    { id: 'p-10', nombre: 'Guarapo de Caña', descripcion: 'Jugo natural de caña de azúcar recién exprimida', precio: 6000, categoriaId: 'cat-4' },
    { id: 'p-11', nombre: 'Besitos de Coco', descripcion: 'Dulce tradicional de coco rallado con panela y canela', precio: 9000, categoriaId: 'cat-5' },
    { id: 'p-12', nombre: 'Arroz con Leche Llanero', descripcion: 'Postre cremoso de arroz con leche entera, canela y raisins', precio: 10000, categoriaId: 'cat-5' },
  ]

  for (const plato of platos) {
    await prisma.plato.upsert({ where: { id: plato.id }, update: {}, create: { ...plato } })
  }

  const mesas = [
    { id: 'mesa-1', numero: 1, capacidad: 2 },
    { id: 'mesa-2', numero: 2, capacidad: 2 },
    { id: 'mesa-3', numero: 3, capacidad: 4 },
    { id: 'mesa-4', numero: 4, capacidad: 4 },
    { id: 'mesa-5', numero: 5, capacidad: 4 },
    { id: 'mesa-6', numero: 6, capacidad: 6 },
    { id: 'mesa-7', numero: 7, capacidad: 6 },
    { id: 'mesa-8', numero: 8, capacidad: 8 },
  ]

  for (const mesa of mesas) {
    await prisma.mesa.upsert({ where: { id: mesa.id }, update: {}, create: mesa })
  }

  const domiciliarios = [
    { id: 'dom-1', nombre: 'Juan Pérez', telefono: '3001234567' },
    { id: 'dom-2', nombre: 'Carlos Ruiz', telefono: '3109876543' },
    { id: 'dom-3', nombre: 'Andrés Mora', telefono: '3157654321' },
  ]
  for (const d of domiciliarios) {
    await prisma.domiciliario.upsert({ where: { id: d.id }, update: {}, create: d })
  }
  console.log('✅ Domiciliarios creados')

  console.log('✅ Seed completado — Casa Llanera lista')
}

main().catch(console.error).finally(() => prisma.$disconnect())
