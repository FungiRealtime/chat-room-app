import prisma from "../../../lib/prisma";
import { authorize, ncWithSession } from "../../../lib/session";

export type RoomsQuery = {
  id: string;
  name: string;
  numPeopleInside: number;
}[];

export default ncWithSession()
  .use(authorize)
  .get(async (_req, res) => {
    let rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        numPeopleInside: true,
      },
      orderBy: {
        numPeopleInside: "desc",
      },
    });

    return res.json(rooms);
  });
