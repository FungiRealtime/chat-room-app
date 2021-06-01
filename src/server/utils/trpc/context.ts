import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { withIronSession } from "next-iron-session";
import {
  getUser,
  RequestWithSession,
  sessionOptions,
  UserSession,
} from "../session";

export async function createContext({
  req: nextReq,
  res,
}: CreateNextContextOptions) {
  let { user, req } = (await withIronSession((req: RequestWithSession) => {
    let user = getUser(req);
    return {
      user,
      req,
    };
  }, sessionOptions)(nextReq, res)) as {
    user: UserSession | undefined;
    req: RequestWithSession;
  };

  return {
    user,
    req,
  };
}
