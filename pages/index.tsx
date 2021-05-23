import type { Room } from ".prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { useAuth } from "../components/auth-provider";
import { useFungiClient } from "../components/fungi-client-provider";
import { LoadingAuth } from "../components/loading-auth";
import { useRoomsQuery, roomsQueryKey } from "../hooks/use-rooms-query";

export default function Home() {
  let fungi = useFungiClient();
  let queryClient = useQueryClient();
  let { loading, user } = useAuth();
  let { data: rooms } = useRoomsQuery({
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    let roomsChannel = fungi.subscribe("private-rooms");

    roomsChannel.bind<Room>(
      "new-room",
      async (newRoom) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(roomsQueryKey);

        queryClient.setQueryData<Room[]>(roomsQueryKey, (previousRooms) => {
          let updatedRooms = [...(previousRooms ?? []), newRoom];
          return updatedRooms;
        });
      },
      { replace: true }
    );
  }, [fungi, queryClient, user]);

  if (loading || !user) {
    return <LoadingAuth />;
  }

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
            <Link key={room.id} href={`/room/${room.id}`}>
              <a className="bg-gray-800 overflow-hidden shadow rounded-lg divide-y divide-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-gray-300">
                <div className="px-4 py-5 sm:px-6 sm:py-4 flex items-start justify-between">
                  <p className="text-gray-300 text-sm">{room.name}</p>
                  <div className="text-gray-100 ml-4 text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>{room.membersCount}</span>
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
