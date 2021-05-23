import { Magic } from "@magic-sdk/admin";

let magic = new Magic(process.env.MAGIC_SECRET_KEY);

export { magic };
