import { useMutation } from "react-query";
import { betterFetch } from "../lib/better-fetch";
import { JoinRoomMutation } from "../pages/api/rooms/[id]/join";

export type JoinRoomVariables = {
  roomId: string;
};

export function useJoinRoomMutation() {
  return useMutation<JoinRoomMutation, unknown, JoinRoomVariables>(
    async (variables) => {
      let data = await betterFetch<JoinRoomMutation>(
        `/api/rooms/${variables.roomId}/join`,
        {
          credentials: "include",
          method: "PATCH",
        }
      );

      return data;
    }
  );
}
