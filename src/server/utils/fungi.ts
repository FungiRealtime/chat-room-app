import { FungiClient } from "@fungi-realtime/node";

let fungi = new FungiClient({
  key: process.env.FUNGI_APP_KEY!,
  secret: process.env.FUNGI_APP_SECRET!,
  url:
    process.env.NODE_ENV === "production"
      ? "https://chatroom-fungi.fungirealti.me"
      : "http://localhost:8080",
});

export { fungi };
