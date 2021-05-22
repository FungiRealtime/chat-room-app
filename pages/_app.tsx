import "../styles/globals.css";
import type { AppProps } from "next/app";
import { FungiClient } from "@fungi-realtime/core";
import { ClientProvider } from "../components/client-provider";
import { useRef } from "react";

let wsAddress =
  process.env.NODE_ENV === "development" ? "ws://localhost:8080" : "...";

function MyApp({ Component, pageProps }: AppProps) {
  let clientRef = useRef<FungiClient>();
  if (!clientRef.current) {
    clientRef.current = new FungiClient(wsAddress, { clientOnly: true });
  }

  return (
    <ClientProvider client={clientRef.current}>
      <Component {...pageProps} />
    </ClientProvider>
  );
}

export default MyApp;
