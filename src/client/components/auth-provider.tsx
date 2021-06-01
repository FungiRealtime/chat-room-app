import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from "react";
import type { UserSession } from "../../server/utils/session";

export type Auth = {
  loading: boolean;
  user: UserSession | null;
};

type AuthContext = Auth & {
  setAuth: Dispatch<SetStateAction<Auth>>;
};

type AuthProviderProps = {
  children: ReactNode;
  auth: AuthContext;
};

let Context = createContext<AuthContext | undefined>(undefined);

export function useAuth() {
  let auth = useContext(Context);

  if (!auth) {
    throw new Error("Can't use hook `useAuth` outside of a <AuthProvider>");
  }

  return auth;
}

export function AuthProvider({ children, auth }: AuthProviderProps) {
  return <Context.Provider value={auth}>{children}</Context.Provider>;
}
