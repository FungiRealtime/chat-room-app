import { Channel, ServerEvents } from "@fungi-realtime/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "react-query";
import { useFungiClient } from "../../components/fungi-client-provider";

type MemberAdded = {
  id: string;
  email: string;
};

type MemberRemoved = {
  id: string;
};

type MemberAddedMutationVariables = {
  roomId: string;
};

export default function Room() {
  let router = useRouter();
  let { id: roomId } = router.query;
  let fungi = useFungiClient();
  let roomChannelRef = useRef<Channel>();
  let { mutate: addMember } = useMutation<
    MemberAdded,
    unknown,
    MemberAddedMutationVariables
  >(async (variables) => {
    let member = await fetch(`/api/rooms/${variables.roomId}/member-added`, {
      method: "POST",
      credentials: "include",
    }).then((res) => res.json());

    return member as MemberAdded;
  });

  let { mutate: removeMember } = useMutation<
    MemberAdded,
    unknown,
    MemberAddedMutationVariables
  >(
    async (variables) => {
      let member = await fetch(
        `/api/rooms/${variables.roomId}/member-removed`,
        {
          method: "POST",
          credentials: "include",
        }
      ).then((res) => res.json());

      return member as MemberAdded;
    },
    {
      onSuccess: () => {
        router.push("/");
      },
    }
  );

  let leaveRoom = useCallback(() => {
    if (!roomId) return;

    removeMember({ roomId: roomId as string });
    roomChannelRef.current?.unsubscribe();
  }, [removeMember, roomId]);

  useEffect(() => {
    window.addEventListener("beforeunload", leaveRoom);

    return () => {
      leaveRoom();
      window.removeEventListener("beforeunload", leaveRoom);
    };
  }, [leaveRoom]);

  useEffect(() => {
    if (!roomId) return;

    roomChannelRef.current = fungi.subscribe(`private-room-${roomId}`);
  }, [fungi, leaveRoom, roomId]);

  useEffect(() => {
    roomChannelRef.current?.bind(ServerEvents.SUBSCRIPTION_SUCCEEDED, () => {
      addMember({
        roomId: roomId as string,
      });
    });

    roomChannelRef.current?.bind<MemberAdded>("member-added", ({ email }) => {
      console.log(`Member with email ${email} added`);
    });

    roomChannelRef.current?.bind<MemberRemoved>("member-removed", ({ id }) => {
      console.log(`Member with id ${id} removed`);
    });
  }, [addMember, roomId]);

  return (
    <div className="bg-gray-900 min-h-screen">
      <Head>
        <title>Room</title>
      </Head>

      <div className="sm:px-12 sm:py-10 px-6 py-4 max-w-4xl w-full mx-auto"></div>
    </div>
  );
}
