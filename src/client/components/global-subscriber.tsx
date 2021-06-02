import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { useSubscription } from "../hooks/use-subscription";
import { useAuth } from "./auth-provider";

type UserWentIdleEvent = {
  id: string;
};

type UserWentOfflineEvent = {
  id: string;
};

export function GlobalSubscriber() {
  let { user } = useAuth();
  let queryClient = useQueryClient();
  let { channel: notificationsChannel } = useSubscription(
    "private-notifications",
    {
      enabled: !!user,
    }
  );

  useEffect(() => {
    notificationsChannel?.bind(
      "user-came-online",
      (user) => {
        console.log(user);
      },
      {
        replace: true,
      }
    );

    notificationsChannel?.bind<UserWentIdleEvent>(
      "user-went-idle",
      (user) => {
        console.log(user);
      },
      {
        replace: true,
      }
    );

    notificationsChannel?.bind<UserWentOfflineEvent>(
      "user-went-offline",
      (user) => {
        console.log(user);
      },
      {
        replace: true,
      }
    );
  }, [notificationsChannel, queryClient]);

  return null;
}
