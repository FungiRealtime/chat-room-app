import { fungi } from "../../lib/fungi";
import { authorize, ncWithSession } from "../../lib/session";

export default ncWithSession()
  .use(authorize)
  .post(async (req, res) => {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;
    let auth = fungi.authenticate(socketId, channel);
    res.json(auth);
  });
