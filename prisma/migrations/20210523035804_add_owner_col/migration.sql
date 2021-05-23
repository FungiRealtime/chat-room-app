/*
  Warnings:

  - You are about to drop the column `isOnline` on the `RoomMember` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `RoomMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoomMember" DROP COLUMN "isOnline",
DROP COLUMN "role";

-- DropEnum
DROP TYPE "RoomMemberRole";

-- CreateTable
CREATE TABLE "RoomOwner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_ownerId_unique" ON "Room"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomOwner.email_unique" ON "RoomOwner"("email");

-- AddForeignKey
ALTER TABLE "Room" ADD FOREIGN KEY ("ownerId") REFERENCES "RoomOwner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
