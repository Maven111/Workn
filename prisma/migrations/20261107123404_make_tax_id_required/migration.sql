/*
  Warnings:

  - Made the column `taxId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "taxId" SET NOT NULL;
