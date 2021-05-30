import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { invalidateUsersQuery } from "../data/users/queries";
import { useSubscription } from "../hooks/use-subscription";
import { useAuth } from "./auth-provider";

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
      () => invalidateUsersQuery(queryClient),
      { replace: true }
    );

    notificationsChannel?.bind(
      "user-went-offline",
      () => invalidateUsersQuery(queryClient),
      { replace: true }
    );

    notificationsChannel?.bind(
      "new-user",
      () => invalidateUsersQuery(queryClient),
      { replace: true }
    );
  }, [notificationsChannel, queryClient]);

  return null;
}
