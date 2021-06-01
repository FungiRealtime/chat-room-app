import { fungi } from "../../lib/fungi";
import { authorize, ncWithSession } from "../../lib/session";
import { UsersQuery } from "./users";

type Body = {
  content: string;
  author: Omit<UsersQuery["users"][number], "status">;
};

export default ncWithSession()
  .use(authorize)
  .post(async (req, res) => {
    let { content, author } = req.body as Body;

    if (content.length > 2000) {
      return res.status(413).json({ error: "Content too large." });
    }

    let { id, avatarColor, nickname } = author;

    await fungi.trigger("private-messages", "user-sent-message", {
      content,
      author: {
        id,
        avatarColor,
        nickname,
      },
    });

    return res.json({ success: true });
  });
