import Head from "next/head";
import Link from "next/link";
import { withAuthenticationRequired } from "../components/with-auth";
import { useRoomsQuery } from "../hooks/use-rooms-query";

function Home() {
  let { data: rooms } = useRoomsQuery({
    staleTime: Infinity,
  });

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
