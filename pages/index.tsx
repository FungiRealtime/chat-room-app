import Head from "next/head";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../components/auth-provider";
import { SidebarUser } from "../components/sidebar-user";
import { withAuthenticationRequired } from "../components/with-auth";
import { useInfiniteUsers } from "../data/users/queries";

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
  let { data, fetchNextPage, hasNextPage } = useInfiniteUsers();
  let { ref: loadMoreRef, inView: wantsToLoadMore } = useInView();

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

      <div className="flex-1 flex flex-col sm:px-12 sm:py-10 px-6 py-4 max-w-4xl w-full mx-auto">
        <img
          src="/logo_transparent.png"
          alt="Fungi's Logo"
          className="w-8 h-8"
        />

        <h1 className="mt-8 text-xl text-gray-100 font-bold">
          {greetUser()}, {user?.email.split("@")[0]}
        </h1>

        <div className="flex flex-1 text-gray-300 justify-between">
          {/* Messages etc */}
          <main className="flex-1">
            <p>...</p>
          </main>

          {/* Sidebar with users */}
          <div
            style={{ maxHeight: "calc(100vh - 12rem)" }}
            className="space-y-4 w-[240px] scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-900 scrollbar-thin scrollbar-thumb-rounded"
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
