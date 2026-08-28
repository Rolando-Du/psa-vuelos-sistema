-- CreateTable
CREATE TABLE "Officer" (
    "id" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "lup" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Officer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Officer_lup_key" ON "Officer"("lup");

-- CreateIndex
CREATE INDEX "Officer_nombre_idx" ON "Officer"("nombre");
