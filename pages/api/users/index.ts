import { UserStatus } from ".prisma/client";
import prisma from "../../../lib/prisma";
import { authorize, ncWithSession } from "../../../lib/session";

export type UsersQuery = {
  users: {
    id: string;
    nickname: string;
    status: UserStatus;
    avatarColor: string;
  }[];
};

export default ncWithSession()
  .use(authorize)
  .get(async (_req, res) => {
    let userQueryResults = await prisma.user.findMany({
      where: {
        NOT: { status: { equals: UserStatus.OFFLINE } },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        nickname: true,
        status: true,
        avatarColor: true,
      },
    });

    let users = userQueryResults.map<UsersQuery["users"][number]>((user) => {
      return {
        id: user.id,
        nickname: user.nickname,
        status: user.status,
        avatarColor: user.avatarColor,
      };
    });

    return res.json({ users });
  });
