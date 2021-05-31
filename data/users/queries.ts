import { UserStatus } from "@prisma/client";
import { QueryClient, useQuery } from "react-query";
import { betterFetch } from "../../lib/better-fetch";
import { UsersQuery } from "../../pages/api/users";

let queryKeys = {
  users: ["users"],
};

export let useUsersQuery = () =>
  useQuery<UsersQuery>(queryKeys.users, () => betterFetch("/api/users"), {
    staleTime: Infinity,
  });

export let onUserCameOnline = (
  queryClient: QueryClient,
  user: UsersQuery["users"][number]
) => {
  queryClient.setQueryData<UsersQuery>(queryKeys.users, (data) => {
    return {
      users: [user, ...(data?.users ?? [])],
    };
  });
};

export let onUserWentIdle = (queryClient: QueryClient, userId: string) => {
  queryClient.setQueryData<UsersQuery>(queryKeys.users, (data) => {
    return {
      ...data,
      users:
        data?.users.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              status: UserStatus.IDLE,
            };
          }

          return user;
        }) ?? [],
    };
  });
};

export let onUserWentOffline = (queryClient: QueryClient, userId: string) => {
  queryClient.setQueryData<UsersQuery>(queryKeys.users, (data) => {
    return {
      ...data,
      users: data?.users.filter((user) => user.id !== userId) ?? [],
    };
  });
};
