import { magic } from "../../lib/magic-admin";
import { getUser, ncWithSession, UserSession } from "../../lib/session";

export default ncWithSession().post(async (req, res) => {
  try {
    let didToken = magic.utils.parseAuthorizationHeader(
      req.headers.authorization!
    );

    magic.token.validate(didToken);
    let { email, issuer } = await magic.users.getMetadataByToken(didToken);

    if (!email || !issuer) {
      return res
        .status(500)
        .json({ error: "Couldn't retrieve email or issuer, try again later." });
    }

    req.session.set<UserSession>("user", {
      email,
      issuer,
    });

    await req.session.save();

    let user = getUser(req);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
