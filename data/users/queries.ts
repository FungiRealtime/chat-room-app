import { UserStatus } from "@prisma/client";
import {
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "react-query";
import { betterFetch } from "../../lib/better-fetch";
import { UsersQuery } from "../../pages/api/users";

let queryKeys = {
  users: ["users"],
};

export let useInfiniteUsers = () =>
  useInfiniteQuery<UsersQuery>(
    queryKeys.users,
    ({ pageParam }) => {
      let url = pageParam ? `/api/users?cursor=${pageParam}` : "/api/users";
      return betterFetch(url);
    },
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      staleTime: Infinity,
    }
  );

export let onUserCameOnline = (
  queryClient: QueryClient,
  user: UsersQuery["users"][number]
) => {
  let currentData = queryClient.getQueryData<
    UseInfiniteQueryResult<UsersQuery>["data"]
  >(queryKeys.users);

  if (!currentData) {
    return;
  }

  let updatedPages = currentData.pages.map((page, i) => {
    if (i === 0) {
      return {
        ...page,
        users: [user, ...page.users],
      };
    }

    return page;
  });

  queryClient.setQueryData<UseInfiniteQueryResult<UsersQuery>["data"]>(
    queryKeys.users,
    { pages: updatedPages, pageParams: currentData.pageParams }
  );
};

export let onUserWentIdle = (queryClient: QueryClient, userId: string) => {
  let currentData = queryClient.getQueryData<
    UseInfiniteQueryResult<UsersQuery>["data"]
  >(queryKeys.users);

  if (!currentData) {
    return;
  }

  let updatedPages = currentData.pages.map((page) => {
    return {
      ...page,
      users: page.users.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            status: UserStatus.IDLE,
          };
        }

        return user;
      }),
    };
  });

  queryClient.setQueryData<UseInfiniteQueryResult<UsersQuery>["data"]>(
    queryKeys.users,
    { pages: updatedPages, pageParams: currentData.pageParams }
  );
};

export let onUserWentOffline = (queryClient: QueryClient, userId: string) => {
  let currentData = queryClient.getQueryData<
    UseInfiniteQueryResult<UsersQuery>["data"]
  >(queryKeys.users);

  if (!currentData) {
    return;
  }

  let updatedPages = currentData.pages.map((page) => {
    return { ...page, users: page.users.filter((user) => user.id !== userId) };
  });

  queryClient.setQueryData<UseInfiniteQueryResult<UsersQuery>["data"]>(
    queryKeys.users,
    { pages: updatedPages, pageParams: currentData.pageParams }
  );
};
