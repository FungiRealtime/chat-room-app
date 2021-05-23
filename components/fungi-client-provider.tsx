import type { ReactNode } from "react";
import type { FungiClient } from "@fungi-realtime/core";
import { createContext, useContext, useEffect } from "react";

type FungiClientProviderProps = {
  children: ReactNode;
  client: FungiClient;
};

let Context = createContext<FungiClient | undefined>(undefined);

export function useFungiClient() {
  let client = useContext(Context);

  if (!client) {
    throw new Error(
      "Can't use hook `useFungiClient` outside of a <FungiClientProvider>"
    );
  }

  return client!;
}

export function FungiClientProvider({
  children,
  client,
}: FungiClientProviderProps) {
  useEffect(() => {
    return () => {
      client.disconnect();
    };
  }, [client]);

  return <Context.Provider value={client}>{children}</Context.Provider>;
}
