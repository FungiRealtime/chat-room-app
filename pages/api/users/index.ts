import { UserStatus } from ".prisma/client";
import prisma from "../../../lib/prisma";
import { authorize, ncWithSession } from "../../../lib/session";

export type UsersQuery = {
  users: {
    id: string;
    nickname: string;
    status: UserStatus;
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
        email: true,
        status: true,
      },
    });

    let users = userQueryResults.map<UsersQuery["users"][number]>((user) => {
      return {
        id: user.id,
        nickname: user.email.split("@")[0],
        status: user.status,
      };
    });

    return res.json({ users });
  });
