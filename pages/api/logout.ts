import { ncWithSession } from "../../lib/session";

export default ncWithSession().post(async (req, res) => {
  req.session.destroy();
  return res.json({ success: true });
});
