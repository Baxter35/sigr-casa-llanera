-- CreateEnum
CREATE TYPE "EstadoDomicilio" AS ENUM ('RECIBIDO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateTable
CREATE TABLE "Domiciliario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domiciliario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domicilio" (
    "id" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteTelefono" TEXT NOT NULL,
    "clienteDireccion" TEXT NOT NULL,
    "clienteBarrio" TEXT NOT NULL,
    "notas" TEXT,
    "estado" "EstadoDomicilio" NOT NULL DEFAULT 'RECIBIDO',
    "domiciliarioId" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domicilio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleDomicilio" (
    "id" TEXT NOT NULL,
    "domicilioId" TEXT NOT NULL,
    "platoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "DetalleDomicilio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Domicilio" ADD CONSTRAINT "Domicilio_domiciliarioId_fkey" FOREIGN KEY ("domiciliarioId") REFERENCES "Domiciliario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleDomicilio" ADD CONSTRAINT "DetalleDomicilio_domicilioId_fkey" FOREIGN KEY ("domicilioId") REFERENCES "Domicilio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleDomicilio" ADD CONSTRAINT "DetalleDomicilio_platoId_fkey" FOREIGN KEY ("platoId") REFERENCES "Plato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
