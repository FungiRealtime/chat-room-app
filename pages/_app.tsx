import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Auth, AuthProvider } from "../components/auth-provider";
import { FungiClient } from "@fungi-realtime/core";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";
import { FungiClientProvider } from "../components/fungi-client-provider";
import { magic } from "../lib/magic";
import { GlobalSubscriber } from "../components/global-subscriber";

let wsAddress =
  process.env.NODE_ENV === "production" ? "..." : "ws://localhost:8080";

function MyApp({ Component, pageProps }: AppProps) {
  let router = useRouter();
  let fungiClientRef = useRef<FungiClient>();
  let queryClientRef = useRef<QueryClient>();
  let [isConnectionEstablished, setIsConnectionEstablished] = useState(false);

  let [auth, setAuth] = useState<Auth>({
    loading: true,
    user: null,
  });

  let logout = () => {
    router.push("/login");

    fetch("/api/logout", {
      credentials: "include",
      method: "POST",
    });

    magic.user.logout();
  };

  let authenticate = async (socketId: string) => {
    try {
      let res = await fetch("/api/user?refresh=true", {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          socketId,
        }),
      });

      if (!res.ok) {
        logout();
        return setAuth({
          loading: false,
          user: null,
        });
      }

      let user = await res.json();

      setAuth({
        loading: false,
        user,
      });
    } catch (error) {
      logout();
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

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <FungiClientProvider client={fungiClientRef.current}>
      <AuthProvider auth={{ loading: auth.loading, setAuth, user: auth.user }}>
        <QueryClientProvider client={queryClientRef.current}>
          <Hydrate state={pageProps.dehydratedState}>
            <GlobalSubscriber />
            <Component {...pageProps} />
          </Hydrate>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </AuthProvider>
    </FungiClientProvider>
  );
}

export default MyApp;
