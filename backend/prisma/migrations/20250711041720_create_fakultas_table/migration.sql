-- CreateTable
CREATE TABLE "Fakultas" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_kode_key" ON "Fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_name_key" ON "Fakultas"("name");
