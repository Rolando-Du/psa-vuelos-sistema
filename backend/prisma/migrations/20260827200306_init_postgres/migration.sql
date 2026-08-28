-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'PASAPORTE', 'CEDULA');

-- CreateEnum
CREATE TYPE "TripPax" AS ENUM ('T', 'P');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ARRIBO', 'PARTIDA');

-- CreateEnum
CREATE TYPE "EstadoVuelo" AS ENUM ('ACTIVO', 'ANULADO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'oficial');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "lup" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'oficial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL,
    "nroRegistro" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME(0) NOT NULL,
    "matricula" TEXT NOT NULL,
    "tipoAeronave" TEXT NOT NULL,
    "propietario" TEXT NOT NULL DEFAULT '',
    "procedencia" TEXT NOT NULL DEFAULT '',
    "destino" TEXT NOT NULL DEFAULT '',
    "tipoMovimiento" "TipoMovimiento" NOT NULL,
    "gradoOficial" TEXT NOT NULL,
    "nombreOficial" TEXT NOT NULL,
    "lupOficial" TEXT NOT NULL,
    "observaciones" TEXT NOT NULL DEFAULT '',
    "estado" "EstadoVuelo" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightPerson" (
    "id" TEXT NOT NULL,
    "apellidoNombre" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'DNI',
    "nroDni" TEXT NOT NULL,
    "tripPax" "TripPax" NOT NULL DEFAULT 'T',
    "nacionalidad" TEXT NOT NULL DEFAULT 'ARG',
    "equipajeMano" INTEGER NOT NULL DEFAULT 0,
    "equipajeBodega" INTEGER NOT NULL DEFAULT 0,
    "flightId" TEXT NOT NULL,

    CONSTRAINT "FlightPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_lup_key" ON "User"("lup");

-- CreateIndex
CREATE UNIQUE INDEX "Flight_nroRegistro_key" ON "Flight"("nroRegistro");

-- CreateIndex
CREATE INDEX "Flight_matricula_idx" ON "Flight"("matricula");

-- CreateIndex
CREATE INDEX "Flight_fecha_idx" ON "Flight"("fecha");

-- CreateIndex
CREATE INDEX "Flight_tipoMovimiento_idx" ON "Flight"("tipoMovimiento");

-- CreateIndex
CREATE INDEX "Flight_estado_idx" ON "Flight"("estado");

-- CreateIndex
CREATE INDEX "FlightPerson_nroDni_idx" ON "FlightPerson"("nroDni");

-- CreateIndex
CREATE INDEX "FlightPerson_flightId_idx" ON "FlightPerson"("flightId");

CREATE UNIQUE INDEX "idx_vuelo_unico_activo"
ON "Flight" ("fecha", "hora", "matricula", "tipoMovimiento")
WHERE "estado" = 'ACTIVO';

-- AddForeignKey
ALTER TABLE "FlightPerson"
ADD CONSTRAINT "FlightPerson_flightId_fkey"
FOREIGN KEY ("flightId")
REFERENCES "Flight"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;