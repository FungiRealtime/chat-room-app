import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-iron-session";
import { ironSession } from "next-iron-session";
import nc, { NextHandler } from "next-connect";

export const SESSION_TTL = 157680000; // 5 years

export const session = ironSession({
  password: process.env.SESSION_PASSWORD!,
  cookieName: "fungi_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

type RequestWithSession = NextApiRequest & {
  session: Session;
};

export type UserSession = {
  id: string;
  nickname: string;
  email: string;
  createdAt: Date;
  avatarColor: string;
};

export function ncWithSession() {
  return nc<RequestWithSession, NextApiResponse>().use(session);
}

export function getUser(req: RequestWithSession) {
  return req.session.get<UserSession>("user");
}

export function authorize(
  req: RequestWithSession,
  res: NextApiResponse,
  next: NextHandler
) {
  let user = getUser(req);

  if (!user) {
    res.status(401).json({ msg: "Unauthenticated" });
    return;
  }

  next();
}
