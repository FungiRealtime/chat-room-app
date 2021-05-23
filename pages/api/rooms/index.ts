import prisma from "../../../lib/prisma";
import { authorize, ncWithSession } from "../../../lib/session";

export type RoomWithMembersCount = {
  id: string;
  name: string;
  membersCount: number;
};

export default ncWithSession()
  .use(authorize)
  .get(async (_req, res) => {
    try {
      let rooms = await prisma.room.findMany({
        select: {
          id: true,
          name: true,
          members: { select: { id: true } },
        },
        orderBy: {
          members: {
            _count: "desc",
          },
        },
      });

      let roomsWithMembersCount: RoomWithMembersCount[] = rooms.map((room) => {
        return {
          id: room.id,
          name: room.name,
          membersCount: room.members.length,
        };
      });

      return res.json(roomsWithMembersCount);
    } catch (error) {
      console.log(error);
    }
  });
