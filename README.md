# SIGR — Sistema Integral de Gestión de Restaurante
## Casa Llanera

Sistema de gestión para restaurante con módulos de pedidos, reservas, facturación y reportes.

## Stack

| Tecnología | Versión |
|---|---|
| Next.js | 16.2.6 |
| React | 19.2.4 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| shadcn/ui | 4.x |
| Prisma | 7.x |
| NextAuth.js | 5.0.0-beta |
| Neon (PostgreSQL) | — |

## Requisitos

- Node.js 20.9+
- Cuenta en [Neon](https://neon.tech) con un proyecto PostgreSQL

## Setup local

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/Baxter35/sigr-casa-llanera.git
cd sigr-casa-llanera
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Neon

# 3. Generar cliente Prisma y migrar
npx prisma generate
npx prisma migrate dev --name init

# 4. Cargar datos iniciales
npx prisma db seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

## Variables de entorno

```env
DATABASE_URL="postgresql://..."      # Neon connection string (pooling)
DIRECT_URL="postgresql://..."        # Neon direct connection (sin -pooler)
AUTH_SECRET="..."                    # Secreto para JWT
NEXTAUTH_URL="http://localhost:3000"
```

## Estructura del proyecto

```
src/
├── app/
│   ├── api/           # Route handlers (API REST)
│   ├── dashboard/     # Módulos del sistema
│   └── login/         # Página de autenticación
├── auth.ts            # Configuración NextAuth v5
├── components/        # Componentes UI
├── generated/prisma/  # Cliente Prisma generado
├── lib/prisma.ts      # Singleton Prisma
└── types/             # Extensiones de tipos
prisma/
├── schema.prisma      # Esquema de base de datos
└── seed.ts            # Datos iniciales
proxy.ts               # Protección de rutas (Next.js 16)
```

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@casallanera.com | Admin123! |
| Mesero | mesero@casallanera.com | Mesero123! |
| Cajero | cajero@casallanera.com | Cajero123! |

## Módulos

- **Dashboard** — Métricas del día (ventas, pedidos activos, mesas)
- **Menú** — CRUD de platos y categorías llaneras
- **Pedidos** — Grid visual de mesas con estados en tiempo real
- **Reservas** — Gestión de reservas por fecha y mesa
- **Facturación** — Cobro de pedidos y cierre de caja
- **Reportes** — Ventas diarias con exportación CSV

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run seed         # Cargar datos iniciales
npx prisma studio    # Explorador de base de datos
```
