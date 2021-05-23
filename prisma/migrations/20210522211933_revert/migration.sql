/*
  Warnings:

  - You are about to drop the `RoomMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomOwner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomToRoomMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoomOwner" DROP CONSTRAINT "RoomOwner_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToRoomMember" DROP CONSTRAINT "_RoomToRoomMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToRoomMember" DROP CONSTRAINT "_RoomToRoomMember_B_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "RoomMember";

-- DropTable
DROP TABLE "RoomOwner";

-- DropTable
DROP TABLE "_RoomToRoomMember";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomsMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomsMembers_AB_unique" ON "_RoomsMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomsMembers_B_index" ON "_RoomsMembers"("B");

-- AddForeignKey
ALTER TABLE "_RoomsMembers" ADD FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomsMembers" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
