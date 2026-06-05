-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultCylinderSize" "CylinderSize",
ADD COLUMN     "lastRefillAt" TIMESTAMP(3),
ADD COLUMN     "refillSnoozedUntil" TIMESTAMP(3);
