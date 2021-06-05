import { httpError } from "@trpc/server";
import { z } from "zod";
import { nanoid as createId } from "nanoid";
import { createRouter } from "~/pages/api/trpc/[trpc]";
import { fungi } from "../utils/fungi";

export let messagesRouter = createRouter().mutation("sendMessage", {
  input: z.object({
    content: z.string().max(2000),
  }),
  async resolve({ ctx, input }) {
    if (!ctx.user) {
      throw httpError.unauthorized();
    }

    let { content } = input;

    await fungi.trigger("private-messages", "user-sent-message", {
      id: createId(),
      content,
      timestamp: new Date().toISOString(),
      author: {
        id: ctx.user.id,
        avatarColor: ctx.user.avatarColor,
        nickname: ctx.user.nickname,
      },
    });

    return { success: true };
  },
});
