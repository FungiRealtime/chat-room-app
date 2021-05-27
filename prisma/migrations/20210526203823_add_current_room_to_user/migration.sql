-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentRoomId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("currentRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
