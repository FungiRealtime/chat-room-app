import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../components/auth-provider";
import { withAuthenticationRequired } from "../../components/with-auth";
import { useJoinRoomMutation } from "../../hooks/use-join-room-mutation";
import { useSubscription } from "../../hooks/use-subscription";

type Query = {
  id: string;
};

type UserLeftRoom = {
  userEmail: string;
  numPeopleInside: number;
};

type UserJoinedRoom = {
  userEmail: string;
  numPeopleInside: number;
};

function Room() {
  let router = useRouter();
  let { user } = useAuth();
  let { id } = router.query as Query;
  let { mutate: joinRoom, isIdle, isLoading } = useJoinRoomMutation();
  let hasLeftRoom = useRef(false);
  let { channel, isSubscribing, isSubscribed } = useSubscription(
    `private-room-${id}`
  );

  let shouldJoinRoom = !!id && isSubscribed && user?.currentRoom?.id !== id;
  let hasJoinedRoom = !!id && isSubscribed && user?.currentRoom?.id === id;
  let isJoiningRoom =
    !id ||
    (user?.currentRoom?.id !== id && (isIdle || isLoading || isSubscribing));

  let onUserLeftRoom = useCallback(
    ({ userEmail, numPeopleInside }: UserLeftRoom) => {
      // If the current user left the room from another device/tab then
      // redirect to /.
      if (userEmail === user?.email) {
        hasLeftRoom.current = true;
        router.push("/");
        return;
      }

      // TODO: Update room members
      console.log(
        `User with email ${userEmail} left the room and now there's ${numPeopleInside} people inside.`
      );
    },
    [router, user?.email]
  );

  let onUserJoinedRoom = useCallback(
    ({ userEmail, numPeopleInside }: UserJoinedRoom) => {
      // TODO: Update room members
      console.log(
        `User with email ${userEmail} joined the room and now there's ${numPeopleInside} people inside.`
      );
    },
    []
  );

  useEffect(() => {
    channel?.bind<UserLeftRoom>("user-left-room", onUserLeftRoom, {
      replace: true,
    });

    channel?.bind<UserJoinedRoom>("user-joined-room", onUserJoinedRoom, {
      replace: true,
    });
  }, [channel, onUserJoinedRoom, onUserLeftRoom]);

  // Once the user subscribes to the room's channel, we will check if
  // the user's current room is this one, if it is then we'll do nothing
  // however if it isn't, we'll join the user to this room.
  useEffect(() => {
    if (hasLeftRoom.current || !shouldJoinRoom) return;

    joinRoom({ roomId: id });
  }, [id, joinRoom, shouldJoinRoom]);

  return (
    <div>
      {isJoiningRoom && <p>Loading...</p>}
      {hasJoinedRoom && <p>Welcome to room {id}!</p>}
    </div>
  );
}

export default withAuthenticationRequired(Room);
