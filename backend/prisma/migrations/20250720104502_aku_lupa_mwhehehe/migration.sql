-- CreateTable
CREATE TABLE "Validator" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Validator_nip_key" ON "Validator"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_no_hp_key" ON "Validator"("no_hp");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_userId_key" ON "Validator"("userId");

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
