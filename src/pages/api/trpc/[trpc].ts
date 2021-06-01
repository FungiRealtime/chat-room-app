import { createNextApiHandler } from "@trpc/server/adapters/next";
import { createContext } from "../../../server/utils/trpc/context";
import { appRouter } from "../../../server/utils/trpc/router";

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
