import { UserStatus } from ".prisma/client";
import { fungi } from "../../../lib/fungi";
import prisma from "../../../lib/prisma";
import {
  authorize,
  getUser,
  ncWithSession,
  UserSession,
} from "../../../lib/session";

export default ncWithSession()
  .use(authorize)
  .patch(async (req, res) => {
    let user = getUser(req);
    let { refresh } = req.query;

    if (refresh) {
      let { socketId } = req.body;

      let refreshedUser = await prisma.user.update({
        where: { id: user?.id },
        data: {
          status: { set: UserStatus.ONLINE },
          sockets: {
            create: {
              id: socketId,
            },
          },
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          sockets: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!refreshedUser) {
        return res.status(404).json({ error: "User not found." });
      }

      // 1 socket means the user just came online.
      if (refreshedUser.sockets.length === 1) {
        await fungi.trigger("private-notifications", "user-came-online", {});
      }

      user = req.session.set<UserSession>("user", {
        id: refreshedUser.id,
        email: refreshedUser.email,
        createdAt: refreshedUser.createdAt,
      });

      await req.session.save();
    }

    return res.json(user);
  });
