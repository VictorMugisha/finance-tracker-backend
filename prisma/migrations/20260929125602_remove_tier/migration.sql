/*
  Warnings:

  - You are about to drop the column `tierId` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the `Tier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_tierId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "tierId";

-- DropTable
DROP TABLE "Tier";
