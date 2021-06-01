import { UserStatus } from ".prisma/client";
import { fungi } from "../../lib/fungi";
import { magic } from "../../lib/magic-admin";
import prisma from "../../lib/prisma";
import { ncWithSession, UserSession } from "../../lib/session";
import { createNicknameFromEmail, randomAvatarColor } from "../../lib/users";

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
        nickname: createNicknameFromEmail(email),
        status: UserStatus.ONLINE,
        sockets: {
          create: {
            id: socketId,
          },
        },
      },
      create: {
        email,
        nickname: createNicknameFromEmail(email),
        status: UserStatus.ONLINE,
        avatarColor: randomAvatarColor(),
        sockets: {
          create: {
            id: socketId,
          },
        },
      },
      select: {
        id: true,
        nickname: true,
        email: true,
        status: true,
        avatarColor: true,
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
        nickname: upsertedUser.nickname,
        status: upsertedUser.status,
        avatarColor: upsertedUser.avatarColor,
      });
    }

    let user = req.session.set<UserSession>("user", {
      id: upsertedUser.id,
      nickname: upsertedUser.nickname,
      email: upsertedUser.email,
      createdAt: upsertedUser.createdAt,
      avatarColor: upsertedUser.avatarColor,
    });

    await req.session.save();

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
