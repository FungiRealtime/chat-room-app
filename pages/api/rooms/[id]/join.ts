import { BatchedEvent } from "@fungi-realtime/node";
import { fungi } from "../../../../lib/fungi";
import prisma from "../../../../lib/prisma";
import {
  authorize,
  getUser,
  ncWithSession,
  UserSession,
} from "../../../../lib/session";

export type JoinRoomMutation = {
  success: boolean;
};

type Query = {
  id: string;
};

export default ncWithSession()
  .use(authorize)
  .patch(async (req, res) => {
    let { email, createdAt, currentRoom } = getUser(req)!;
    let { id } = req.query as Query;

    if (currentRoom?.id === id) {
      return res
        .status(400)
        .json({ error: "This user has already joined this room." });
    }

    let room = await prisma.room.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found." });
    }

    let events: BatchedEvent[] = [];

    let joinUserToRoomUpdate = {
      where: {
        id: room.id,
      },
      data: {
        numPeopleInside: { increment: 1 },
        peopleInside: {
          connect: {
            email,
          },
        },
      },
      select: {
        id: true,
        name: true,
        numPeopleInside: true,
      },
    };

    let updatedRoom;
    if (currentRoom) {
      // Leave the user's current room and join the new room.
      let [oldRoom, currentUpdatedRoom] = await Promise.all([
        prisma.room.update({
          where: {
            id: currentRoom.id,
          },
          data: {
            numPeopleInside: { decrement: 1 },
            peopleInside: {
              disconnect: {
                email,
              },
            },
          },
          select: {
            id: true,
            numPeopleInside: true,
          },
        }),
        prisma.room.update(joinUserToRoomUpdate),
      ]);

      updatedRoom = currentUpdatedRoom;

      events.push(
        {
          channel: "private-rooms",
          event: "user-left-room",
          data: {
            roomId: oldRoom.id,
            numPeopleInside: oldRoom.numPeopleInside,
          },
        },
        {
          channel: "private-rooms",
          event: "user-joined-room",
          data: {
            roomId: updatedRoom.id,
            roomName: updatedRoom.name,
            numPeopleInside: updatedRoom.numPeopleInside,
          },
        },
        {
          channel: `private-room-${oldRoom.id}`,
          event: "user-left-room",
          data: {
            userEmail: email,
            numPeopleInside: oldRoom.numPeopleInside,
          },
        },
        {
          channel: `private-room-${updatedRoom.id}`,
          event: "user-joined-room",
          data: {
            roomId: updatedRoom.id,
            userEmail: email,
            numPeopleInside: updatedRoom.numPeopleInside,
          },
        }
      );
    } else {
      // Just join the new room.
      updatedRoom = await prisma.room.update(joinUserToRoomUpdate);

      events.push(
        {
          channel: "private-rooms",
          event: "user-joined-room",
          data: {
            roomId: updatedRoom.id,
            roomName: updatedRoom.name,
            numPeopleInside: updatedRoom.numPeopleInside,
          },
        },
        {
          channel: `private-room-${updatedRoom.id}`,
          event: "user-joined-room",
          data: {
            userEmail: email,
            numPeopleInside: updatedRoom.numPeopleInside,
          },
        }
      );
    }

    // Update the user's current room.
    let updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        currentRoom: {
          connect: {
            id: updatedRoom.id,
          },
        },
      },
      select: {
        createdAt: true,
        currentRoom: {
          select: {
            id: true,
            name: true,
            numPeopleInside: true,
          },
        },
      },
    });

    // Update the user's session.
    req.session.set<UserSession>("user", {
      email,
      createdAt,
      currentRoom: updatedUser.currentRoom,
    });

    await req.session.save();

    // Notify the app in real-time of the
    // events that happened.
    await fungi.triggerBatch(events);

    return res.json({
      success: true,
    });
  });
