import { QueryClient, useInfiniteQuery } from "react-query";
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

export let invalidateUsersQuery = (queryClient: QueryClient) => {
  queryClient.invalidateQueries(queryKeys.users);
};
