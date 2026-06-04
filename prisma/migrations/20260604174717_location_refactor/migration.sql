/*
  Warnings:

  - You are about to drop the column `hostelId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `block` on the `Pool` table. All the data in the column will be lost.
  - You are about to drop the column `hostelId` on the `Pool` table. All the data in the column will be lost.
  - You are about to drop the column `hostelId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Hostel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `Pool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `Pool` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_hostelId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_hostelId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "hostelId",
DROP COLUMN "roomNumber",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "block",
DROP COLUMN "hostelId",
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hostelId",
DROP COLUMN "roomNumber",
ADD COLUMN     "defaultAddress" TEXT,
ADD COLUMN     "defaultLat" DOUBLE PRECISION,
ADD COLUMN     "defaultLng" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Hostel";
