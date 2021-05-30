import { authorize, getUser, ncWithSession } from "../../../lib/session";

export default ncWithSession()
  .use(authorize)
  .get(async (req, res) => {
    let user = getUser(req);
    return res.json(user);
  });
