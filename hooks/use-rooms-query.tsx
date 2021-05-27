import { useQuery, UseQueryOptions } from "react-query";
import { betterFetch } from "../lib/better-fetch";
import { RoomsQuery } from "../pages/api/rooms";

export let roomsQueryKey = "rooms";

export function useRoomsQuery(options?: UseQueryOptions<RoomsQuery>) {
  return useQuery<RoomsQuery>(
    roomsQueryKey,
    async () => {
      let rooms = await betterFetch<RoomsQuery>("/api/rooms", {
        credentials: "include",
      });

      return rooms;
    },
    options
  );
}
