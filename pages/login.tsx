import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../components/auth-provider";
import { magic } from "../lib/magic";
import { UserSession } from "../lib/session";

export default function Login() {
  let { user, setAuth, loading } = useAuth();
  let router = useRouter();
  let [email, setEmail] = useState("");

  // Redirect to / if user is logged in.
  useEffect(() => {
    if (user?.issuer) {
      router.push("/");
    }
  }, [router, user?.issuer]);

  let handleLogin = async () => {
    try {
      setAuth({
        loading: true,
        user: null,
      });

      let didToken = await magic.auth.loginWithMagicLink({
        email,
      });

      // Validate didToken with server
      let res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + didToken,
        },
      });

      if (res.ok) {
        let user = (await res.json()) as UserSession;

        setAuth({
          loading: false,
          user,
        });

        router.push("/");
      }
    } catch (error) {
      setAuth({
        loading: false,
        user: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center">
      <Head>
        <title>Log in to Fungi Chat Room</title>
      </Head>

      <div className="flex flex-col items-center justify-center w-full max-w-[25rem] mx-auto">
        <h1 className="text-3xl font-bold text-gray-300">
          Log in to Fungi Chat Room
        </h1>

        <form
          className="mt-10 flex flex-col w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            className="border border-gray-800 p-3 rounded-lg transition-all focus:ring-gray-500 focus:ring-2 focus:border-gray-500 hover:border-gray-500 outline-none"
            type="email"
            name="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="mt-4 bg-gray-500 p-3 text-white text-lg font-bold rounded-lg hover:bg-gray-600 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            type="submit"
            disabled={loading || !email}
          >
            {loading ? (
              <svg
                className="animate-spin h-7 w-7 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>Log in</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
