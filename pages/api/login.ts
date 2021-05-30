import { UserStatus } from ".prisma/client";
import { fungi } from "../../lib/fungi";
import { magic } from "../../lib/magic-admin";
import prisma from "../../lib/prisma";
import { ncWithSession, UserSession } from "../../lib/session";

export default ncWithSession().post(async (req, res) => {
  try {
    let didToken = magic.utils.parseAuthorizationHeader(
      req.headers.authorization!
    );

    magic.token.validate(didToken);
    let { email, issuer } = await magic.users.getMetadataByToken(didToken);

    if (!email || !issuer) {
      return res
        .status(500)
        .json({ error: "Couldn't retrieve email or issuer, try again later." });
    }

    let { socketId } = req.body;

    let existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        createdAt: true,
      },
    });

    let id, createdAt;

    if (!existingUser) {
      let newUser = await prisma.user.create({
        data: {
          email,
          status: UserStatus.ONLINE,
          sockets: {
            create: {
              id: socketId,
            },
          },
        },
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
        },
      });

      id = newUser.id;
      createdAt = newUser.createdAt;

      await fungi.trigger("private-notifications", "new-user", {});
    } else {
      let updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
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
          createdAt: true,
          sockets: {
            select: {
              id: true,
            },
          },
        },
      });

      id = updatedUser.id;
      createdAt = updatedUser.createdAt;

      // 1 socket means the user just came online.
      if (updatedUser.sockets.length === 1) {
        await fungi.trigger("private-notifications", "user-came-online", {});
      }
    }

    let user = req.session.set<UserSession>("user", {
      id,
      email,
      createdAt,
    });

    await req.session.save();

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
