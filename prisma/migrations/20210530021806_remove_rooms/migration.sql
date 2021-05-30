/*
  Warnings:

  - You are about to drop the column `currentRoomId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_currentRoomId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentRoomId";

-- DropTable
DROP TABLE "Room";
