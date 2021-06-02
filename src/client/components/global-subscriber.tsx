import { UserStatus } from ".prisma/client";
import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { useSubscription } from "../hooks/use-subscription";
import { useAuth } from "./auth-provider";

type UserCameOnlineEvent = {
  id: string;
  nickname: string;
  status: string;
  avatarColor: string;
};

type UserWentIdleEvent = {
  id: string;
};

type UserWentOfflineEvent = {
  id: string;
};

type UsersQuery = {
  users: UserCameOnlineEvent[];
};

let onlineUsersQueryKey = ["users.online", null, "TRPC_QUERY"];

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
        queryClient.setQueryData<UsersQuery>(
          onlineUsersQueryKey,
          (previousData) => {
            return {
              users: [user, ...(previousData?.users ?? [])],
            };
          }
        );
      },
      {
        replace: true,
      }
    );

    notificationsChannel?.bind<UserWentIdleEvent>(
      "user-went-idle",
      ({ id }) => {
        queryClient.setQueryData<UsersQuery>(
          onlineUsersQueryKey,
          (previousData) => {
            return {
              users:
                previousData?.users.map((user) => {
                  if (user.id === id) {
                    return {
                      ...user,
                      status: UserStatus.IDLE,
                    };
                  }

                  return user;
                }) ?? [],
            };
          }
        );
      },
      {
        replace: true,
      }
    );

    notificationsChannel?.bind<UserWentOfflineEvent>(
      "user-went-offline",
      ({ id }) => {
        queryClient.setQueryData<UsersQuery>(
          onlineUsersQueryKey,
          (previousData) => {
            return {
              users: previousData?.users.filter((user) => user.id !== id) ?? [],
            };
          }
        );
      },
      {
        replace: true,
      }
    );
  }, [notificationsChannel, queryClient]);

  return null;
}
