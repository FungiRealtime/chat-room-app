import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useQueryClient } from "react-query";
import { useAuth } from "../components/auth-provider";
import { withAuthenticationRequired } from "../components/with-auth";
import { useRoomsQuery, roomsQueryKey } from "../hooks/use-rooms-query";
import { useSubscription } from "../hooks/use-subscription";
import { UserSession } from "../lib/session";
import { RoomsQuery } from "../pages/api/rooms";

type UserLeftRoom = {
  roomId: string;
  numPeopleInside: number;
};

type UserJoinedRoom = {
  roomId: string;
  roomName: string;
  numPeopleInside: number;
};

function Home() {
  let queryClient = useQueryClient();
  let { setAuth } = useAuth();
  let { channel } = useSubscription("private-rooms", { staySubscribed: true });
  let { data: rooms } = useRoomsQuery({
    staleTime: Infinity,
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
    channel?.bind<UserLeftRoom>("user-left-room", onUserLeftRoom, {
      replace: true,
    });
    channel?.bind<UserJoinedRoom>("user-joined-room", onUserJoinedRoom, {
      replace: true,
    });
  }, [channel, onUserJoinedRoom, onUserLeftRoom]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>Rooms</title>
      </Head>

      <div className="sm:px-12 sm:py-10 px-6 py-4 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <img
            src="/logo_transparent.png"
            alt="Fungi's Logo"
            className="w-8 h-8"
          />

          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-400 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            New room
          </button>
        </div>

        <h1 className="mt-8 text-xl text-gray-100 font-bold">Chat Rooms</h1>

        <div className="mt-4 flex flex-col items-start space-y-4">
          {rooms?.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <a className="hover:bg-gray-700 group bg-gray-800 overflow-hidden shadow rounded-lg divide-y divide-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-gray-300">
                <div className="px-4 py-5 sm:px-6 sm:py-4 flex items-start justify-between">
                  <p className="text-gray-300 group-hover:text-gray-400 text-sm">
                    {room.name}
                  </p>
                  <div className="text-gray-100 group-hover:text-gray-200 ml-4 text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>{room.numPeopleInside}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(Home);
