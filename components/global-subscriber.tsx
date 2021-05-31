import { useEffect } from "react";
import { useQueryClient } from "react-query";
import {
  onUserCameOnline,
  onUserWentIdle,
  onUserWentOffline,
} from "../data/users/queries";
import { useSubscription } from "../hooks/use-subscription";
import { UsersQuery } from "../pages/api/users";
import { useAuth } from "./auth-provider";

type UserCameOnlineEvent = UsersQuery["users"][number];

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
    notificationsChannel?.bind<UserCameOnlineEvent>(
      "user-came-online",
      (user) => {
        onUserCameOnline(queryClient, user);
      },
      { replace: true }
    );

    notificationsChannel?.bind<UserWentIdleEvent>(
      "user-went-idle",
      (user) => {
        onUserWentIdle(queryClient, user.id);
      },
      {
        replace: true,
      }
    );

    notificationsChannel?.bind<UserWentOfflineEvent>(
      "user-went-offline",
      (user) => {
        onUserWentOffline(queryClient, user.id);
      },
      {
        replace: true,
      }
    );
  }, [notificationsChannel, queryClient]);

  return null;
}
