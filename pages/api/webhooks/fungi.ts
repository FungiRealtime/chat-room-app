import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { fungi } from "../../../lib/fungi";

export default nc<NextApiRequest, NextApiResponse>().post(async (req, res) => {
  let sigHeader = req.headers["fungi-signature"] as string;
  let endpointSecret = process.env.WEBHOOKS_SIGNING_SECRET;

  let event;

  try {
    event = fungi.constructEvent(
      JSON.stringify(req.body),
      sigHeader,
      endpointSecret!
    );
  } catch (error) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type === "connection_closed") {
    // TODO
  }

  res.json({ success: true });
});
