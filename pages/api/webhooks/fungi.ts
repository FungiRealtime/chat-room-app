import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { fungi } from "../../../lib/fungi";
import prisma from "../../../lib/prisma";
import { UserStatus } from "@prisma/client";

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
    let user = await prisma.user.findFirst({
      where: {
        sockets: {
          some: {
            id: {
              equals: event.data.socket_id as string,
            },
          },
        },
      },
      select: {
        id: true,
        sockets: {
          select: {
            id: true,
          },
        },
      },
    });

    if (user) {
      let isOnlineOnOtherDevices = user.sockets.length > 1;

      if (isOnlineOnOtherDevices) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            sockets: {
              delete: {
                id: event.data.socket_id as string,
              },
            },
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            sockets: {
              delete: {
                id: event.data.socket_id as string,
              },
            },
            status: { set: UserStatus.OFFLINE },
          },
        });

        await fungi.trigger("private-notifications", "user-went-offline", {
          id: user.id,
        });
      }
    }
  }

  res.json({ success: true });
});
