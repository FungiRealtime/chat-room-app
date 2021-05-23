import { Client } from "@fungi-realtime/node";

let fungi = new Client({
  key: process.env.FUNGI_APP_KEY!,
  secret: process.env.FUNGI_APP_SECRET!,
});

export { fungi };
