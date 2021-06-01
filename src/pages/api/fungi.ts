import { fungi } from "../../server/utils/fungi";
import { authorize, ncWithSession } from "../../server/utils/session";

export default ncWithSession()
  .use(authorize)
  .post(async (req, res) => {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;
    let auth = fungi.authenticate(socketId, channel);
    return res.json(auth);
  });
