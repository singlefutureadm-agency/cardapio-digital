/*
  Warnings:

  - You are about to drop the column `artista` on the `Show` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Show" DROP COLUMN "artista",
ADD COLUMN     "artistaId" INTEGER;

-- CreateTable
CREATE TABLE "Artista" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "bio" TEXT,
    "genero" TEXT,
    "imagemUrl" TEXT,
    "instagram" TEXT,
    "spotify" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "site" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoShow" (
    "id" SERIAL NOT NULL,
    "showId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoShow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoShow_showId_userId_key" ON "AvaliacaoShow"("showId", "userId");

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoShow" ADD CONSTRAINT "AvaliacaoShow_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoShow" ADD CONSTRAINT "AvaliacaoShow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
