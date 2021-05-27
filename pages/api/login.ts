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

    let { createdAt, currentRoom } = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
      },
      select: {
        createdAt: true,
        currentRoom: {
          select: {
            id: true,
            name: true,
            numPeopleInside: true,
          },
        },
      },
    });

    let user = req.session.set<UserSession>("user", {
      email,
      createdAt,
      currentRoom,
    });

    await req.session.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
