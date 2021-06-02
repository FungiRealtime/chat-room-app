import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { withIronSession } from "next-iron-session";
import { authRouter } from "../../../server/routers/auth";
import { messagesRouter } from "../../../server/routers/messages";
import { usersRouter } from "../../../server/routers/users";
import prisma from "../../../server/utils/prisma";
import {
  getUser,
  RequestWithSession,
  sessionOptions,
  UserSession,
} from "../../../server/utils/session";

async function createContext(opts: trpcNext.CreateNextContextOptions) {
  let { user, req } = (await withIronSession((req: RequestWithSession) => {
    let user = getUser(req);
    return {
      user,
      req,
    };
  }, sessionOptions)(opts.req, opts.res)) as {
    user: UserSession | undefined;
    req: RequestWithSession;
  };

  return {
    user,
    req,
    prisma,
  };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export function createRouter() {
  return trpc.router<Context>();
}

let router = createRouter()
  .merge("users.", usersRouter)
  .merge("auth.", authRouter)
  .merge("messages.", messagesRouter);

export let appRouter = router;
export type AppRouter = typeof router;

export default trpcNext.createNextApiHandler({
  router,
  createContext,
  teardown: () => prisma.$disconnect(),
  onError({ error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      // send to bug reporting
      console.error("Something went wrong", error);
    }
  },
});
