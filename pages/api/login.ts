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

    let upsertedUser = await prisma.user.upsert({
      where: { email },
      update: {
        status: UserStatus.ONLINE,
        sockets: {
          create: {
            id: socketId,
          },
        },
      },
      create: {
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
        sockets: {
          select: {
            id: true,
          },
        },
      },
    });

    // 1 socket means the user just came online.
    if (upsertedUser.sockets.length === 1) {
      await fungi.trigger("private-notifications", "user-came-online", {
        id: upsertedUser.id,
        nickname: upsertedUser.email.split("@")[0],
        status: upsertedUser.status,
      });
    }

    let user = req.session.set<UserSession>("user", {
      id: upsertedUser.id,
      email: upsertedUser.email,
      createdAt: upsertedUser.createdAt,
    });

    await req.session.save();

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
