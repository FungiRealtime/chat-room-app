import Head from "next/head";
import { useAuth } from "../components/auth-provider";
import { withAuthenticationRequired } from "../components/with-auth";

function greetUser() {
  let date = new Date();
  let hrs = date.getHours();

  let greet;

  if (hrs < 12) {
    greet = "Good Morning";
  } else if (hrs >= 12 && hrs <= 17) {
    greet = "Good Afternoon";
  } else {
    greet = "Good Evening";
  }

  return greet;
}

function Home() {
  let { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>Rooms</title>
      </Head>

      <div className="sm:px-12 sm:py-10 px-6 py-4 max-w-4xl w-full mx-auto">
        <img
          src="/logo_transparent.png"
          alt="Fungi's Logo"
          className="w-8 h-8"
        />

        <h1 className="mt-8 text-xl text-gray-100 font-bold">
          {greetUser()}, {user?.email.split("@")[0]}
        </h1>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(Home);
