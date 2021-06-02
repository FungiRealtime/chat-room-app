import { httpError } from "@trpc/server";
import { z } from "zod";
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
      content,
      author: {
        id: ctx.user.id,
        avatarColor: ctx.user.avatarColor,
        nickname: ctx.user.nickname,
      },
    });

    return { success: true };
  },
});
