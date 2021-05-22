import type { ReactNode } from "react";
import type { FungiClient } from "@fungi-realtime/core";
import { createContext, useContext, useEffect } from "react";

type ClientProviderProps = {
  children: ReactNode;
  client: FungiClient;
};

let Context = createContext<FungiClient | undefined>(undefined);

export function useClient() {
  let client = useContext(Context);
  return client!;
}

export function ClientProvider({ children, client }: ClientProviderProps) {
  useEffect(() => {
    return () => {
      client.disconnect();
    };
  }, []);

  return <Context.Provider value={client}>{children}</Context.Provider>;
}
