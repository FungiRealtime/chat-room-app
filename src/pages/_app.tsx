import "../../styles/globals.css";
import type { AppProps } from "next/app";
import { Auth, AuthProvider } from "../client/components/auth-provider";
import { FungiClient } from "@fungi-realtime/core";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FungiClientProvider } from "../client/components/fungi-client-provider";
import { magic } from "../client/utils/magic";
import { GlobalSubscriber } from "../client/components/global-subscriber";
import { withTRPC } from "@trpc/next";
import { ReactQueryDevtools } from "react-query/devtools";
import { trpc } from "../client/utils/trpc";

let wsAddress =
  process.env.NODE_ENV === "production" ? "..." : "ws://localhost:8080";

function MyApp({ Component, pageProps }: AppProps) {
  let router = useRouter();
  let fungiClientRef = useRef<FungiClient>();
  let [isConnectionEstablished, setIsConnectionEstablished] = useState(false);
  let authorize = trpc.useMutation("authorize");
  let logout = trpc.useMutation("logout");

  let [auth, setAuth] = useState<Auth>({
    loading: true,
    user: null,
  });

  let logoutAndRedirect = async () => {
    logout.mutate({});
    magic.user.logout();

    router.push("/login");
  };

  let authenticate = async (socketId: string) => {
    try {
      let user = await authorize.mutateAsync({
        socketId,
      });

      setAuth({
        loading: false,
        user,
      });
    } catch (error) {
      logoutAndRedirect();
      return setAuth({
        loading: false,
        user: null,
      });
    }
  };

  useEffect(() => {
    if (!isConnectionEstablished || !fungiClientRef.current?.socketId) return;

    authenticate(fungiClientRef.current.socketId);

    // It's fine to ignore this rule here, if we included the router
    // in the dependency array then we would get an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnectionEstablished]);

  if (!fungiClientRef.current) {
    fungiClientRef.current = new FungiClient(wsAddress, {
      clientOnly: true,
      auth: {
        endpoint: "/api/fungi",
      },
      onConnectionEstablished: () => {
        setIsConnectionEstablished(true);
      },
    });
  }

  return (
    <FungiClientProvider client={fungiClientRef.current}>
      <AuthProvider auth={{ loading: auth.loading, setAuth, user: auth.user }}>
        <GlobalSubscriber />
        <Component {...pageProps} />
        <ReactQueryDevtools />
      </AuthProvider>
    </FungiClientProvider>
  );
}

export default withTRPC((_ctx) => {
  let url =
    process.env.NODE_ENV === "production"
      ? `...`
      : "http://localhost:3000/api/trpc";

  return {
    url,
  };
})(MyApp);
