import clsx from "clsx";
import { useMemo } from "react";
import { UsersQuery } from "../pages/api/users";

type SidebarUserProps = {
  user: UsersQuery["users"][number];
};

let DARK = "#111827";
function randomColor() {
  let letters = "BCDEF".split("");
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }

  return color;
}

export function SidebarUser({ user }: SidebarUserProps) {
  let avatarBgColor = useMemo(() => randomColor(), []);

  return (
    <div
      className={clsx(
        "flex space-x-3 items-center",
        user.status === "OFFLINE" && "opacity-30"
      )}
    >
      {/* User avatar */}
      <div
        className="relative uppercase rounded-full text-sm min-h-8 h-8 min-w-8 w-8 flex items-center justify-center"
        style={{ backgroundColor: avatarBgColor, color: DARK }}
      >
        {user.nickname.slice(0, 2)}

        <div className="absolute -right-0.5 -bottom-0.5 bg-[#000000] w-3 h-3 rounded-full flex items-center justify-center">
          <div
            className={clsx(
              "w-2.5 h-2.5 rounded-full",

              user.status === "ONLINE"
                ? "bg-green-500"
                : user.status === "OFFLINE"
                ? "bg-gray-400"
                : "bg-red-700"
            )}
          />
          <span className="sr-only">
            {user.status === "ONLINE"
              ? "Online"
              : user.status === "OFFLINE"
              ? "Offline"
              : "Idle"}
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="flex-1">
        <span className="text-sm break-all">{user.nickname}</span>
      </div>
    </div>
  );
}
