export function FungiMainHandler() {
  // let { user } = useAuth();
  // let fungi = useFungiClient();
  // let queryClient = useQueryClient();

  // useEffect(() => {
  //   if (!user) return;

  //   // let roomsChannel = fungi.subscribe("private-rooms");

  //   // roomsChannel.bind<Room>(
  //   //   "new-room",
  //   //   async (newRoom) => {
  //   //     // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
  //   //     await queryClient.cancelQueries(roomsQueryKey);

  //   //     queryClient.setQueryData<Room[]>(roomsQueryKey, (previousRooms) => {
  //   //       let updatedRooms = [...(previousRooms ?? []), newRoom];
  //   //       return updatedRooms;
  //   //     });
  //   //   },
  //   //   { replace: true }
  //   // );
  // }, [user]);

  return null;
}
