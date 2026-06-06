-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'OPEN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ONLINE';

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "partnerStation" TEXT;

-- CreateTable
CREATE TABLE "RiderApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "businessName" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "coverageArea" TEXT NOT NULL,
    "partnerStation" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiderApplication_pkey" PRIMARY KEY ("id")
);
