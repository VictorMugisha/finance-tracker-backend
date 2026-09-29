-- CreateEnum
CREATE TYPE "RecurringPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "recurringContributionId" TEXT,
ADD COLUMN     "recurringPeriod" INTEGER;

-- CreateTable
CREATE TABLE "RecurringContribution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "period" "RecurringPeriod" NOT NULL,
    "targetAmount" DECIMAL(65,30),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringContribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_recurringContributionId_fkey" FOREIGN KEY ("recurringContributionId") REFERENCES "RecurringContribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
