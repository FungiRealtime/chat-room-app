import { useQuery, UseQueryOptions } from "react-query";
import { RoomWithMembersCount } from "../pages/api/rooms";

export let roomsQueryKey = "rooms";

export function useRoomsQuery(
  options?: UseQueryOptions<RoomWithMembersCount[]>
) {
  return useQuery<RoomWithMembersCount[]>(
    roomsQueryKey,
    async () => {
      let rooms = await fetch("/api/rooms", {
        credentials: "include",
      }).then((res) => res.json());

      return rooms;
    },
    options
  );
}
