import { useCallback, useEffect } from "react";
import { useQueryClient } from "react-query";
import { roomsQueryKey } from "../hooks/use-rooms-query";
import { useSubscription } from "../hooks/use-subscription";
import { UserSession } from "../lib/session";
import { RoomsQuery } from "../pages/api/rooms";
import { useAuth } from "./auth-provider";

type UserLeftRoom = {
  roomId: string;
  numPeopleInside: number;
};

type UserJoinedRoom = {
  roomId: string;
  roomName: string;
  numPeopleInside: number;
};

export function GlobalSubscriber() {
  let queryClient = useQueryClient();
  let { setAuth } = useAuth();
  let { channel: privateRoomsChannel } = useSubscription("private-rooms", {
    staySubscribed: true,
  });

  let onUserLeftRoom = useCallback(
    async ({ roomId, numPeopleInside }: UserLeftRoom) => {
      await queryClient.cancelQueries(roomsQueryKey);

      queryClient.setQueryData<RoomsQuery>(roomsQueryKey, (previousRooms) => {
        return (previousRooms ?? [])
          .map((room) =>
            room.id === roomId ? { ...room, numPeopleInside } : room
          )
          .sort((a, b) => b.numPeopleInside - a.numPeopleInside);
      });
    },
    [queryClient]
  );

  let onUserJoinedRoom = useCallback(
    async ({ roomId, roomName, numPeopleInside }: UserJoinedRoom) => {
      await queryClient.cancelQueries(roomsQueryKey);

      queryClient.setQueryData<RoomsQuery>(roomsQueryKey, (previousRooms) => {
        return (previousRooms ?? [])
          .map((room) =>
            room.id === roomId ? { ...room, numPeopleInside } : room
          )
          .sort((a, b) => b.numPeopleInside - a.numPeopleInside);
      });

      setAuth((previousAuth) => {
        let updatedUser: UserSession | null = previousAuth.user
          ? {
              ...previousAuth.user,
              currentRoom: {
                id: roomId,
                name: roomName,
                numPeopleInside,
              },
            }
          : previousAuth.user;

        return {
          ...previousAuth,
          user: updatedUser,
        };
      });
    },
    [queryClient, setAuth]
  );

  useEffect(() => {
    privateRoomsChannel?.bind<UserLeftRoom>("user-left-room", onUserLeftRoom, {
      replace: true,
    });

    privateRoomsChannel?.bind<UserJoinedRoom>(
      "user-joined-room",
      onUserJoinedRoom,
      {
        replace: true,
      }
    );
  }, [onUserJoinedRoom, onUserLeftRoom, privateRoomsChannel]);

  return null;
}
