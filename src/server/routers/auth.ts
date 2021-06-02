import { UserStatus } from ".prisma/client";
import { httpError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "~/pages/api/trpc/[trpc]";
import { fungi } from "../utils/fungi";
import { magic } from "../utils/magic";
import { UserSession } from "../utils/session";
import { createNicknameFromEmail, randomAvatarColor } from "../utils/users";

export let authRouter = createRouter()
  .mutation("logout", {
    input: z.object({}).optional(),
    resolve({ ctx }) {
      ctx.req.session.destroy();
      return { success: true };
    },
  })
  .mutation("login", {
    input: z.object({
      didToken: z.string(),
      socketId: z.string().max(30),
    }),
    async resolve({ ctx, input }) {
      try {
        magic.token.validate(input.didToken);
      } catch (error) {
        throw httpError.badRequest("Invalid DID token.");
      }

      let { email, issuer } = await magic.users.getMetadataByToken(
        input.didToken
      );

      if (!email || !issuer) {
        throw httpError.badRequest(
          "Couldn't retrieve email or issuer, try again later."
        );
      }

      let { socketId } = input;

      let upsertedUser = await ctx.prisma.user.upsert({
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

      let user = ctx.req.session.set<UserSession>("user", {
        id: upsertedUser.id,
        nickname: upsertedUser.nickname,
        email: upsertedUser.email,
        createdAt: upsertedUser.createdAt,
        avatarColor: upsertedUser.avatarColor,
      });

      await ctx.req.session.save();

      return user;
    },
  })
  .mutation("authorize", {
    input: z.object({
      socketId: z.string().max(30),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.user) {
        throw httpError.unauthorized();
      }

      if (!input?.socketId) {
        throw httpError.badRequest("Socket id is invalid or missing.");
      }

      let refreshedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          status: { set: UserStatus.ONLINE },
          sockets: {
            create: {
              id: input.socketId,
            },
          },
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          status: true,
          createdAt: true,
          avatarColor: true,
          sockets: {
            select: {
              id: true,
            },
          },
        },
      });

      // 1 socket means the user just came online.
      if (refreshedUser.sockets.length === 1) {
        await fungi.trigger("private-notifications", "user-came-online", {
          id: refreshedUser.id,
          nickname: refreshedUser.nickname,
          status: refreshedUser.status,
          avatarColor: refreshedUser.avatarColor,
        });
      }

      let user = ctx.req.session.set<UserSession>("user", {
        id: refreshedUser.id,
        email: refreshedUser.email,
        nickname: refreshedUser.nickname,
        createdAt: refreshedUser.createdAt,
        avatarColor: refreshedUser.avatarColor,
      });

      await ctx.req.session.save();

      return user;
    },
  });
