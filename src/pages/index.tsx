import Head from "next/head";
import TextArea from "react-textarea-autosize";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "~/client/components/auth-provider";
import { SidebarUser } from "~/client/components/sidebar-user";
import { withAuthenticationRequired } from "~/client/components/with-auth";
import { useSubscription } from "~/client/hooks/use-subscription";
import { trpc } from "~/client/utils/trpc";
import { UserAvatar } from "~/client/components/user-avatar";
import { format, isToday, isYesterday, parseISO } from "date-fns";

function formatMessageTimestamp(timestamp: string) {
  let date = parseISO(timestamp);

  if (isToday(date)) {
    return format(date, `'Today at 'h:mm a`);
  } else if (isYesterday(date)) {
    return format(date, `'Yesterday at 'h:mm a`);
  }

  return format(date, `dd/MM/yyyy 'at' h:mm a`);
}

type Message = {
  id: string;
  content: string;
  timestamp: string;
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
  let messagesEndRef = useRef<HTMLDivElement>(null);
  let { channel } = useSubscription("private-messages");

  let handleSubmit = () => {
    if (!user || !content.trim()) return;

    setContent("");

    sendMessage.mutate({
      content,
    });
  };

  useEffect(() => {
    channel?.bind<Message>(
      "user-sent-message",
      ({ id, content, timestamp, author }) => {
        setMessages((currentMessages) => [
          ...currentMessages,
          { id, content, timestamp, author },
        ]);
      }
    );
  }, [channel]);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Head>
        <title>Fungi Chat Room</title>
      </Head>

      <div className="flex-1 flex flex-col sm:px-12 sm:py-10 px-6 py-4 max-w-6xl w-full mx-auto">
        <header className="border-b border-gray-800 pb-4 flex items-center space-x-4">
          <img
            src="/logo_transparent.png"
            alt="Fungi's Logo"
            className="w-8 h-8"
          />

          <h1 className="text-gray-200 font-semibold">Fungi Chat Room</h1>
        </header>

        <div className="mt-6 flex-1 flex flex-col">
          <div className="flex flex-1 text-gray-300 justify-between space-x-6">
            {/* Messages etc */}
            <main className="flex-1 flex flex-col items-stretch relative">
              <div className="flex-1 relative mb-6">
                <div className="inset-0 border-r border-gray-800 absolute overflow-x-hidden overflow-y-auto scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-thin scrollbar-track-rounded scrollbar-thumb-rounded">
                  {messages.length === 0 ? (
                    <p>No new messages</p>
                  ) : (
                    <>
                      <ul className="flex flex-col space-y-8 pr-16">
                        {messages.map((message) => (
                          <li
                            key={message.id}
                            className="text-sm flex space-x-4 items-start"
                          >
                            <div>
                              <UserAvatar
                                avatarColor={message.author.avatarColor}
                                nickname={message.author.nickname}
                              />
                            </div>

                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">
                                  {message.author.nickname}
                                </span>
                                <time
                                  className="text-gray-400 text-xs"
                                  dateTime={message.timestamp}
                                >
                                  {formatMessageTimestamp(message.timestamp)}
                                </time>
                              </div>

                              <p className="break-all">{message.content}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>

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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                  placeholder="Send a message"
                  className="w-full scrollbar resize-none scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-thin scrollbar-track-rounded scrollbar-thumb-rounded max-h-44 bg-gray-800 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </form>
            </main>

            {/* Sidebar with users */}
            <div className="relative w-[260px]">
              <div className="space-y-4 inset-0 absolute overflow-x-hidden overflow-y-auto scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-thin scrollbar-track-rounded scrollbar-thumb-rounded">
                {data?.users.map((user) => (
                  <SidebarUser key={user.id} user={user} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(Home);
