import prisma from "../../../../lib/prisma";
import { fungi } from "../../../../lib/fungi";
import { authorize, getUser, ncWithSession } from "../../../../lib/session";

type Query = {
  id: string;
};

export default ncWithSession()
  .use(authorize)
  .post(async (req, res) => {
    let { email } = getUser(req)!;
    let { id: roomId } = req.query as Query;

    let existingMember = await prisma.roomMember.findFirst({
      where: {
        AND: [{ email: { equals: email } }, { roomId }],
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "This member already exists." });
    }

    let newMember = await prisma.roomMember.create({
      data: {
        email,
        room: {
          connect: {
            id: roomId,
          },
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    let membersCount = await prisma.roomMember.count({
      where: {
        roomId,
      },
    });

    await fungi.triggerBatch([
      {
        channel: `private-rooms`,
        event: "member-added",
        data: {
          roomId,
          membersCount,
        },
      },
      {
        channel: `private-room-${roomId}`,
        event: "member-added",
        data: {
          id: newMember.id,
          email: newMember.email,
        },
      },
    ]);

    res.json(newMember);
  });
