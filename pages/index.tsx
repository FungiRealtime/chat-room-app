import Head from "next/head";
import { Fragment, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../components/auth-provider";
import { SidebarUser } from "../components/sidebar-user";
import { withAuthenticationRequired } from "../components/with-auth";
import { useInfiniteUsers } from "../data/users/queries";
import TextArea from "react-textarea-autosize";
import { useSubscription } from "../hooks/use-subscription";

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

type Message = {
  content: string;
};

function Home() {
  let { user } = useAuth();
  let { data, fetchNextPage, hasNextPage } = useInfiniteUsers();
  let { ref: loadMoreRef, inView: wantsToLoadMore } = useInView();
  let formRef = useRef<HTMLFormElement>(null);
  let { channel, isSubscribing, isSubscribed } =
    useSubscription("private-messages");

  let [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (wantsToLoadMore && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, wantsToLoadMore]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Head>
        <title>Rooms</title>
      </Head>

      <div className="flex-1 flex flex-col sm:px-12 sm:py-10 px-6 py-4 max-w-5xl w-full mx-auto">
        <img
          src="/logo_transparent.png"
          alt="Fungi's Logo"
          className="w-8 h-8"
        />

        <h1 className="mt-8 text-xl text-gray-100 font-bold">
          {greetUser()}, {user?.email.split("@")[0]}
        </h1>

        <div className="flex flex-1 text-gray-300 justify-between space-x-12">
          {/* Messages etc */}
          <main className="flex-1 flex flex-col items-stretch">
            {isSubscribing && <p className="mt-4">Loading...</p>}

            {isSubscribed && (
              <>
                <div className="mt-4">Messages...</div>

                <form ref={formRef} className="mt-auto">
                  <TextArea
                    onKeyPress={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        formRef.current?.submit();
                      }
                    }}
                    placeholder="Send a message"
                    className="w-full scrollbar resize-none scrollbar-thumb-gray-600 scrollbar-track-gray-900 scrollbar-thin scrollbar-thumb-rounded max-h-44 bg-gray-800 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </form>
              </>
            )}
          </main>

          {/* Sidebar with users */}
          <div
            style={{ maxHeight: "calc(100vh - 10.75rem)" }}
            className="space-y-4 min-w-[240px] w-[240px] scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-900 scrollbar-thin scrollbar-thumb-rounded"
          >
            {data?.pages.map((page, i) => (
              <Fragment key={i}>
                {page.users.map((user) => (
                  <SidebarUser key={user.id} user={user} />
                ))}
              </Fragment>
            ))}

            <div ref={loadMoreRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(Home);
