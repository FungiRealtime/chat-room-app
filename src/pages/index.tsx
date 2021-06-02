import Head from "next/head";
import TextArea from "react-textarea-autosize";
import { useEffect, useState } from "react";
import { useAuth } from "~/client/components/auth-provider";
import { SidebarUser } from "~/client/components/sidebar-user";
import { withAuthenticationRequired } from "~/client/components/with-auth";
import { useSubscription } from "~/client/hooks/use-subscription";
import { trpc } from "~/client/utils/trpc";

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
  author: {
    id: string;
    avatarColor: string;
    nickname: string;
  };
};

function Home() {
  let { user } = useAuth();
  let { data } = trpc.useQuery(["users.online"], { staleTime: Infinity });
  let [content, setContent] = useState("");
  let [messages, setMessages] = useState<Message[]>([]);
  let sendMessage = trpc.useMutation("messages.sendMessage");
  let { channel, isSubscribing, isSubscribed } =
    useSubscription("private-messages");

  let handleSubmit = () => {
    if (!user) return;

    sendMessage.mutate({
      content,
    });
  };

  useEffect(() => {
    channel?.bind<Message>("user-sent-message", ({ content, author }) => {
      setMessages((currentMessages) => [
        ...currentMessages,
        { content, author },
      ]);
    });
  }, [channel]);

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

                <form
                  className="mt-auto"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                  }}
                >
                  <TextArea
                    onKeyPress={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                    name="content"
                    required
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={2000}
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
            {data?.users.map((user) => (
              <SidebarUser key={user.id} user={user} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(Home);
