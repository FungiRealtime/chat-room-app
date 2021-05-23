import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Auth, AuthProvider } from "../components/auth-provider";
import { FungiClient } from "@fungi-realtime/core";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";
import { FungiClientProvider } from "../components/fungi-client-provider";
import { magic } from "../lib/magic";
import { MultipleTabsError } from "../components/multiple-tabs-error";

let wsAddress =
  process.env.NODE_ENV === "production" ? "..." : "ws://localhost:8080";

function MyApp({ Component, pageProps }: AppProps) {
  let router = useRouter();
  let fungiClientRef = useRef<FungiClient>();
  let queryClientRef = useRef<QueryClient>();
  let [hasMultipleTabs, setHasMultipleTabs] = useState(false);

  let [auth, setAuth] = useState<Auth>({
    loading: true,
    user: null,
  });

  let logout = () => {
    router.push("/login");
    magic.user.logout();
  };

  let authenticate = async () => {
    try {
      let res = await fetch("/api/user", {
        credentials: "include",
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

  let detectTabs = (event: StorageEvent) => {
    console.log(event);

    if (event.key === "open_pages") {
      // Listen if anybody else is opening the same page!
      localStorage.setItem("page_available", `${Date.now()}`);
    }

    if (event.key === "page_available") {
      setHasMultipleTabs(true);
    }
  };

  useEffect(() => {
    localStorage.setItem("open_pages", `${Date.now()}`);

    window.addEventListener("storage", detectTabs);

    return () => {
      window.removeEventListener("storage", detectTabs);
    };
  }, []);

  useEffect(() => {
    authenticate();

    // It's fine to ignore this rule here, if we included the router
    // in the dependency array then we would get an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!fungiClientRef.current) {
    fungiClientRef.current = new FungiClient(wsAddress, {
      clientOnly: true,
      auth: {
        endpoint: "/api/fungi",
      },
    });
  }

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  if (hasMultipleTabs) {
    return <MultipleTabsError />;
  }

  return (
    <FungiClientProvider client={fungiClientRef.current}>
      <AuthProvider auth={{ loading: auth.loading, setAuth, user: auth.user }}>
        <QueryClientProvider client={queryClientRef.current}>
          <Hydrate state={pageProps.dehydratedState}>
            <Component {...pageProps} />
          </Hydrate>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </AuthProvider>
    </FungiClientProvider>
  );
}

export default MyApp;
