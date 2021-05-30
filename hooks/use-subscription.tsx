import { Channel, ServerEvents } from "@fungi-realtime/core";
import { useEffect, useRef, useState } from "react";
import { useFungiClient } from "../components/fungi-client-provider";

type UseSubcriptionOptions = {
  enabled?: boolean;
};

enum SubscriptionStatus {
  idle = "idle",
  subscribing = "subscribing",
  subscribed = "subscribed",
  error = "error",
}

type UseSubscriptionResult = {
  channel: Channel | undefined;
  status: SubscriptionStatus;
  isIdle: boolean;
  isSubscribing: boolean;
  isSubscribed: boolean;
  isError: boolean;
};

export function useSubscription(
  channel: string,
  options?: UseSubcriptionOptions
): UseSubscriptionResult {
  let fungi = useFungiClient();
  let channelRef = useRef<Channel>();
  let [status, setStatus] = useState<SubscriptionStatus>(
    SubscriptionStatus.idle
  );

  useEffect(() => {
    if (options?.enabled === false) return;

    setStatus(SubscriptionStatus.subscribing);
    channelRef.current = fungi.subscribe(channel);

    channelRef.current.bind(ServerEvents.SUBSCRIPTION_SUCCEEDED, () => {
      setStatus(SubscriptionStatus.subscribed);
    });

    channelRef.current.bind(ServerEvents.SUBSCRIPTION_ERROR, () => {
      setStatus(SubscriptionStatus.error);
    });

    return () => {
      channelRef.current?.unsubscribe();
      setStatus(SubscriptionStatus.idle);
    };
  }, [channel, fungi, options?.enabled]);

  return {
    channel: channelRef.current,
    status,
    isIdle: status === SubscriptionStatus.idle,
    isSubscribing: status === SubscriptionStatus.subscribing,
    isSubscribed: status === SubscriptionStatus.subscribed,
    isError: status === SubscriptionStatus.error,
  };
}
