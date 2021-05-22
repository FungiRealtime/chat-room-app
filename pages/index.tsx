import Head from "next/head";
import { useClient } from "../components/client-provider";

export default function Home() {
  let client = useClient();

  return (
    <div>
      <Head>
        <title>Fungi Chat Room</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div />
    </div>
  );
}
