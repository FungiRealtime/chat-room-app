/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `_RoomsMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RoomsMembers" DROP CONSTRAINT "_RoomsMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomsMembers" DROP CONSTRAINT "_RoomsMembers_B_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_ownerId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "ownerId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_RoomsMembers";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "RoomOwner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMember" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomToRoomMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomOwner_roomId_unique" ON "RoomOwner"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomToRoomMember_AB_unique" ON "_RoomToRoomMember"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomToRoomMember_B_index" ON "_RoomToRoomMember"("B");

-- AddForeignKey
ALTER TABLE "RoomOwner" ADD FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToRoomMember" ADD FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToRoomMember" ADD FOREIGN KEY ("B") REFERENCES "RoomMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
