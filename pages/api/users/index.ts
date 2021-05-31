import { UserStatus } from ".prisma/client";
import prisma from "../../../lib/prisma";
import { authorize, ncWithSession } from "../../../lib/session";

type UserQueryResult = {
  id: string;
  email: string;
  status: UserStatus;
};

export type UsersQuery = {
  users: {
    id: string;
    nickname: string;
    status: UserStatus;
  }[];
  cursor: string | null;
};

type RequestQuery = {
  cursor: string | undefined;
};

let PAGE_SIZE = 50;

export default ncWithSession()
  .use(authorize)
  .get(async (req, res) => {
    let { cursor } = req.query as RequestQuery;

    let userQueryResults: UserQueryResult[];

    if (!cursor) {
      userQueryResults = await prisma.user.findMany({
        take: PAGE_SIZE,
        orderBy: [{ id: "asc" }],
        where: {
          NOT: { status: { equals: UserStatus.OFFLINE } },
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });
    } else {
      userQueryResults = await prisma.user.findMany({
        take: PAGE_SIZE,
        skip: 1, // Skip the cursor
        cursor: {
          id: cursor,
        },
        orderBy: [{ id: "asc" }],
        where: {
          NOT: { status: { equals: UserStatus.OFFLINE } },
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });
    }

    let nextCursor: string | null = null;
    let lastUserInResults = userQueryResults[PAGE_SIZE - 1]; // Remember: zero-based index! :)

    if (lastUserInResults) {
      nextCursor = lastUserInResults.id;
    }

    let users = userQueryResults.map<UsersQuery["users"][number]>((user) => {
      return {
        id: user.id,
        nickname: user.email.split("@")[0],
        status: user.status,
      };
    });

    return res.json({
      users,
      cursor: nextCursor,
    });
  });
