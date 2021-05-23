/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomsMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomMemberRole" AS ENUM ('OWNER', 'MEMBER');

-- DropForeignKey
ALTER TABLE "_RoomsMembers" DROP CONSTRAINT "_RoomsMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomsMembers" DROP CONSTRAINT "_RoomsMembers_B_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_ownerId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "ownerId";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_RoomsMembers";

-- CreateTable
CREATE TABLE "RoomMember" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RoomMemberRole" NOT NULL,
    "roomId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomMember.email_unique" ON "RoomMember"("email");

-- AddForeignKey
ALTER TABLE "RoomMember" ADD FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
