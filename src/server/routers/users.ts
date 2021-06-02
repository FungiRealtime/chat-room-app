import { UserStatus } from ".prisma/client";
import { httpError } from "@trpc/server";
import { createRouter } from "~/pages/api/trpc/[trpc]";

export let usersRouter = createRouter().query("online", {
  async resolve({ ctx }) {
    if (!ctx.user) {
      throw httpError.unauthorized();
    }

    let userQueryResults = await ctx.prisma.user.findMany({
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

    let users = userQueryResults.map((user) => {
      return {
        id: user.id,
        nickname: user.nickname,
        status: user.status,
        avatarColor: user.avatarColor,
      };
    });

    return {
      users,
    };
  },
});
