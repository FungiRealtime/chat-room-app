import { ReactNode, useEffect } from "react";
import { Client } from "@fungi-realtime/core";
import { createContext, useContext } from "react";

type ClientProviderProps = {
  children: ReactNode;
  client: Client;
};

let Context = createContext<Client | undefined>(undefined);

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
