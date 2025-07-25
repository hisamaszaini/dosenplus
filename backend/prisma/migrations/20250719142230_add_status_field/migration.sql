/*
  Warnings:

  - Added the required column `status` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Semester" ADD COLUMN     "status" BOOLEAN NOT NULL;
