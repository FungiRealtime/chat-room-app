import { Channel } from "@fungi-realtime/core";
import { useEffect, useRef } from "react";
import { useFungiClient } from "../components/fungi-client-provider";

type UseSubcriptionOptions = {
  enabled?: boolean;
};

export function useSubscription(
  channel: string,
  options?: UseSubcriptionOptions
) {
  let fungi = useFungiClient();
  let channelRef = useRef<Channel>();

  useEffect(() => {
    if (options?.enabled === false) return;

    channelRef.current = fungi.subscribe(channel);

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [channel, fungi, options?.enabled]);

  return channelRef.current;
}
