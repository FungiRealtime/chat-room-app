import { useMutation } from "react-query";
import { useAuth } from "../components/auth-provider";
import { betterFetch } from "../lib/better-fetch";
import { JoinRoomMutation } from "../pages/api/rooms/[id]/join";

export type JoinRoomVariables = {
  roomId: string;
};

export function useJoinRoomMutation() {
  let { setAuth } = useAuth();

  return useMutation<JoinRoomMutation, unknown, JoinRoomVariables>(
    async (variables) => {
      let { updatedUser } = await betterFetch<JoinRoomMutation>(
        `/api/rooms/${variables.roomId}/join`,
        {
          credentials: "include",
          method: "PATCH",
        }
      );

      return { updatedUser };
    },
    {
      onSuccess: (data) => {
        setAuth((previousAuth) => ({
          ...previousAuth,
          user: data.updatedUser,
        }));
      },
    }
  );
}
