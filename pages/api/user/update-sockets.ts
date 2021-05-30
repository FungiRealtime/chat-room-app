import prisma from "../../../lib/prisma";
import { authorize, getUser, ncWithSession } from "../../../lib/session";

export default ncWithSession()
  .use(authorize)
  .patch(async (req, res) => {
    let user = getUser(req)!;
    let { socketId } = req.body;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        sockets: {
          create: {
            id: socketId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return res.json({ socketId });
  });
